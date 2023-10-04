import BigNumber from 'bignumber.js';
import { uniq } from 'lodash';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Context,
  DefaultPortfolio,
  FungibleAsset,
  NftCollection,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  ErrorCode,
  MoveFundsParams,
  PortfolioId,
  PortfolioMovement,
  PortfolioMovementFungible,
  PortfolioMovementNonFungible,
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
import { asNftId, asTicker } from '~/utils/internal';

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
  fungibleMovements: PortfolioMovementFungible[];
  nftMovements: PortfolioMovementNonFungible[];
}> {
  const fungibleMovements: PortfolioMovementFungible[] = [];
  const nftMovements: PortfolioMovementNonFungible[] = [];
  const tickers: string[] = [];

  for (const item of items) {
    tickers.push(asTicker(item.asset));
    if (typeof item.asset === 'string') {
      const ticker = item.asset;
      const fungible = new FungibleAsset({ ticker }, context);
      const collection = new NftCollection({ ticker }, context);
      const [isAsset, isCollection] = await Promise.all([fungible.exists(), collection.exists()]);

      if (isCollection) {
        nftMovements.push(item as PortfolioMovementNonFungible);
      } else if (isAsset) {
        fungibleMovements.push(item as PortfolioMovementFungible);
      } else {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `No asset with "${ticker}" exists`,
        });
      }
    } else if (isFungibleAsset(item.asset)) {
      fungibleMovements.push(item as PortfolioMovementFungible);
    } else if (typeof item.asset !== 'string' && isNftCollection(item.asset)) {
      nftMovements.push(item as PortfolioMovementNonFungible);
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

  const [fungibleBalances, nftHoldings] = await Promise.all([
    fromPortfolio.getAssetBalances({
      assets: fungibleMovements.map(({ asset }) => asTicker(asset)),
    }),
    fromPortfolio.getNftsHeld({ assets: nftMovements.map(({ asset }) => asTicker(asset)) }),
  ]);
  const balanceExceeded: (PortfolioMovement & { free: BigNumber })[] = [];

  console.log({ fungibleBalances, nftHoldings, items });

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

  const notHeldNfts: Record<string, BigNumber[]> = {};

  nftMovements.forEach(movement => {
    const ticker = asTicker(movement.asset);
    const heldNfts = nftHoldings.find(({ asset }) => asset.ticker === ticker);

    movement.nfts.forEach(nftId => {
      const id = asNftId(nftId);
      const holdsNft = heldNfts?.free.find(held => held.id.eq(id));
      if (!holdsNft) {
        const entry = notHeldNfts[ticker] || [];
        entry.push(id);
        notHeldNfts[ticker] = entry;
      }
    });
  });

  if (Object.keys(notHeldNfts).length > 0) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Some of the NFTs are not available in the sending portfolio',
      data: { notHeldNfts },
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
