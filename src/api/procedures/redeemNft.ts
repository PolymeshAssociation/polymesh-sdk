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
import { assetToMeshAssetId, bigNumberToU64, portfolioToPortfolioKind } from '~/utils/conversion';

export interface Storage {
  fromPortfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export type Params = { collection: NftCollection; id: BigNumber } & RedeemNftParams;

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
      isV6,
      polymeshApi: { tx, query },
    },
    storage: { fromPortfolio },
  } = this;

  const { collection, id } = args;

  const collectionId = await collection.getCollectionId();
  const rawAssetId = assetToMeshAssetId(collection, context);
  const rawId = bigNumberToU64(id, context);
  const rawCollectionId = bigNumberToU64(collectionId, context);

  const [[{ free }], rawKeySet] = await Promise.all([
    fromPortfolio.getCollections({ collections: [collection.id] }),
    query.nft.collectionKeys(rawCollectionId),
  ]);

  if (!free.find(heldNft => heldNft.id.eq(id))) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Portfolio does not hold NFT to redeem',
      data: {
        nftId: id.toString(),
      },
    });
  }

  /* istanbul ignore next: this will be removed after dual version support for v6-v7 */
  const txArgs = isV6
    ? [rawAssetId, rawId, portfolioToPortfolioKind(fromPortfolio, context)]
    : [rawAssetId, rawId, portfolioToPortfolioKind(fromPortfolio, context), rawKeySet.size];

  return {
    transaction: tx.nft.redeemNft,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: txArgs as any,
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { collection }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { fromPortfolio },
  } = this;

  return {
    permissions: {
      transactions: [TxTags.nft.RedeemNft],
      assets: [collection],
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
