import BigNumber from 'bignumber.js';
import { uniq } from 'lodash';

import { assertPortfolioExists } from '~/api/procedures/utils';
import { Context, DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import {
  ErrorCode,
  FungiblePortfolioMovement,
  MoveFundsParams,
  NonFungiblePortfolioMovement,
  PortfolioId,
  PortfolioMovement,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { isFungibleAsset, isNftCollection } from '~/utils';
import {
  fungibleMovementToPortfolioFund,
  nftMovementToPortfolioFund,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';
import { asAsset, asNftId, asTicker } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = MoveFundsParams & {
  from: DefaultPortfolio | NumberedPortfolio;
};

/**
 * @hidden
 * separates user input into fungible and nft movements
 */
async function segregateItems(
  items: PortfolioMovement[],
  context: Context
): Promise<{
  fungibleMovements: FungiblePortfolioMovement[];
  nftMovements: NonFungiblePortfolioMovement[];
}> {
  const fungibleMovements: FungiblePortfolioMovement[] = [];
  const nftMovements: NonFungiblePortfolioMovement[] = [];
  const tickers: string[] = [];

  for (const item of items) {
    const { asset } = item;
    const ticker = asTicker(asset);
    tickers.push(ticker);

    const typedAsset = await asAsset(asset, context);
    if (isFungibleAsset(typedAsset)) {
      if (!('amount' in item)) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The key "amount" should be present in a fungible portfolio movement',
          data: { ticker },
        });
      }
      fungibleMovements.push(item as FungiblePortfolioMovement);
    } else if (isNftCollection(typedAsset)) {
      if (!('nfts' in item)) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The key "nfts" should be present in an NFT portfolio movement',
          data: { ticker },
        });
      }
      nftMovements.push(item as NonFungiblePortfolioMovement);
    }
  }

  const hasDuplicates = uniq(tickers).length !== tickers.length;

  if (hasDuplicates) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Portfolio movements cannot contain any Asset more than once',
    });
  }

  return {
    fungibleMovements,
    nftMovements,
  };
}

/**
 * @hidden
 */
export async function prepareMoveFunds(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'portfolio', 'movePortfolioFunds'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { from: fromPortfolio, to, items } = args;

  const { fungibleMovements, nftMovements } = await segregateItems(items, context);

  const {
    owner: { did: fromDid },
  } = fromPortfolio;

  let toPortfolio;
  if (!to) {
    toPortfolio = new DefaultPortfolio({ did: fromDid }, context);
  } else if (to instanceof BigNumber) {
    toPortfolio = new NumberedPortfolio({ did: fromDid, id: to }, context);
  } else {
    toPortfolio = to;
  }

  const {
    owner: { did: toDid },
  } = toPortfolio;

  const fromPortfolioId = portfolioLikeToPortfolioId(fromPortfolio);
  const toPortfolioId = portfolioLikeToPortfolioId(toPortfolio);

  await Promise.all([
    assertPortfolioExists(fromPortfolioId, context),
    assertPortfolioExists(toPortfolioId, context),
  ]);

  if (fromDid !== toDid) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Both portfolios should have the same owner',
    });
  }

  if (fromPortfolioId.number === toPortfolioId.number) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Origin and destination should be different Portfolios',
    });
  }

  const [fungibleBalances, heldCollections] = await Promise.all([
    fromPortfolio.getAssetBalances({
      assets: fungibleMovements.map(({ asset }) => asTicker(asset)),
    }),
    fromPortfolio.getCollections({ collections: nftMovements.map(({ asset }) => asTicker(asset)) }),
  ]);
  const balanceExceeded: (PortfolioMovement & { free: BigNumber })[] = [];

  fungibleBalances.forEach(({ asset: { ticker }, free }) => {
    const transferItem = fungibleMovements.find(
      ({ asset: itemAsset }) => asTicker(itemAsset) === ticker
    )!;

    if (transferItem.amount.gt(free)) {
      balanceExceeded.push({ ...transferItem, free });
    }
  });

  if (balanceExceeded.length) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: "Some of the amounts being transferred exceed the Portfolio's balance",
      data: {
        balanceExceeded,
      },
    });
  }

  const unavailableNfts: Record<string, BigNumber[]> = {};

  nftMovements.forEach(movement => {
    const ticker = asTicker(movement.asset);
    const heldNfts = heldCollections.find(({ collection }) => collection.ticker === ticker);

    movement.nfts.forEach(nftId => {
      const id = asNftId(nftId);
      const hasNft = heldNfts?.free.find(held => held.id.eq(id));
      if (!hasNft) {
        const entry = unavailableNfts[ticker] || [];
        entry.push(id);
        unavailableNfts[ticker] = entry;
      }
    });
  });

  if (Object.keys(unavailableNfts).length > 0) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Some of the NFTs are not available in the sending portfolio',
      data: { unavailableNfts },
    });
  }

  const rawFrom = portfolioIdToMeshPortfolioId(fromPortfolioId, context);
  const rawTo = portfolioIdToMeshPortfolioId(toPortfolioId, context);

  const rawFungibleMovements = fungibleMovements.map(item =>
    fungibleMovementToPortfolioFund(item, context)
  );

  const rawNftMovements = nftMovements.map(item => nftMovementToPortfolioFund(item, context));

  return {
    transaction: portfolio.movePortfolioFunds,
    args: [rawFrom, rawTo, [...rawFungibleMovements, ...rawNftMovements]],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { from, to }: Params
): ProcedureAuthorization {
  const { context } = this;
  const {
    owner: { did },
  } = from;
  let portfolioId: PortfolioId = { did };

  if (from instanceof NumberedPortfolio) {
    portfolioId = { ...portfolioId, number: from.id };
  }

  let toPortfolio;
  if (!to) {
    toPortfolio = new DefaultPortfolio({ did }, context);
  } else if (to instanceof BigNumber) {
    toPortfolio = new NumberedPortfolio({ did, id: to }, context);
  } else {
    toPortfolio = to;
  }

  return {
    permissions: {
      transactions: [TxTags.portfolio.MovePortfolioFunds],
      assets: [],
      portfolios: [from, toPortfolio],
    },
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
  };
}

/**
 * @hidden
 */
export const moveFunds = (): Procedure<Params, void> =>
  new Procedure(prepareMoveFunds, getAuthorization);
