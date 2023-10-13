import BigNumber from 'bignumber.js';

import {
  DefaultPortfolio,
  NftCollection,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RedeemNftParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, portfolioToPortfolioKind, stringToTicker } from '~/utils/conversion';

export interface Storage {
  fromPortfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export type Params = { ticker: string; id: BigNumber } & RedeemNftParams;

/**
 * @hidden
 */
export async function prepareRedeemNft(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'nft', 'redeemNft'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
    storage: { fromPortfolio },
  } = this;

  const { ticker, id } = args;

  const rawTicker = stringToTicker(ticker, context);

  const [{ free }] = await fromPortfolio.getCollections({ collections: [ticker] });

  if (!free.find(heldNft => heldNft.id.eq(id))) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Portfolio does not hold NFT to redeem',
      data: {
        nftId: id.toString(),
      },
    });
  }

  const rawId = bigNumberToU64(id, context);

  return {
    transaction: tx.nft.redeemNft,
    args: [rawTicker, rawId, portfolioToPortfolioKind(fromPortfolio, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { ticker }: Params
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { fromPortfolio },
  } = this;

  return {
    permissions: {
      transactions: [TxTags.nft.RedeemNft],
      assets: [new NftCollection({ ticker }, context)],
      portfolios: [fromPortfolio],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { from }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  if (!from) {
    return { fromPortfolio: new DefaultPortfolio({ did }, context) };
  } else if (from instanceof BigNumber) {
    return { fromPortfolio: new NumberedPortfolio({ did, id: from }, context) };
  }

  return {
    fromPortfolio: from,
  };
}

/**
 * @hidden
 */
export const redeemNft = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRedeemNft, getAuthorization, prepareStorage);
