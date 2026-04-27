import BigNumber from 'bignumber.js';

import {
  Account,
  DefaultPortfolio,
  NftCollection,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { AssetHolder, ErrorCode, RedeemNftParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderToAssetHolderKind,
  assetToMeshAssetId,
  bigNumberToU64,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export interface Storage {
  fromAssetHolder: AssetHolder;
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
      polymeshApi: { tx, query },
    },
    storage: { fromAssetHolder },
  } = this;

  const { collection, id } = args;

  const collectionId = await collection.getCollectionId();
  const rawAssetId = assetToMeshAssetId(collection, context);
  const rawId = bigNumberToU64(id, context);
  const rawCollectionId = bigNumberToU64(collectionId, context);

  const [[assetHolderCollection], rawKeySet] = await Promise.all([
    fromAssetHolder.getCollections({ collections: [collection.id] }),
    query.nft.collectionKeys(rawCollectionId),
  ]);

  if (!assetHolderCollection?.free.some(heldNft => heldNft.id.eq(id))) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Asset Holder does not hold NFT to redeem',
      data: {
        nftId: id.toString(),
      },
    });
  }

  return {
    transaction: tx.nft.redeemNft,
    args: [
      rawAssetId,
      rawId,
      assetHolderToAssetHolderKind(fromAssetHolder, context),
      rawKeySet.size,
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { collection }: Params
): ProcedureAuthorization {
  const {
    storage: { fromAssetHolder },
  } = this;

  return {
    permissions: {
      transactions: [TxTags.nft.RedeemNft],
      assets: [collection],
      portfolios: fromAssetHolder instanceof Account ? [] : [fromAssetHolder],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { from, fromAccount }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  let fromAssetHolder: AssetHolder;

  if (from && fromAccount) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only one of `from` or `fromAccount` can be provided to redeem',
    });
  }
  if (fromAccount) {
    fromAssetHolder = asAccount(fromAccount, context);
  } else if (!from) {
    fromAssetHolder = new DefaultPortfolio({ did }, context);
  } else if (from instanceof BigNumber) {
    fromAssetHolder = new NumberedPortfolio({ did, id: from }, context);
  } else {
    fromAssetHolder = from;
  }

  return {
    fromAssetHolder,
  };
}

/**
 * @hidden
 */
export const redeemNft = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRedeemNft, getAuthorization, prepareStorage);
