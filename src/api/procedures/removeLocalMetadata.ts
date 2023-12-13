import { FungibleAsset, MetadataEntry, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MetadataType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, meshMetadataKeyToMetadataKey, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  metadataEntry: MetadataEntry;
};

/**
 * @hidden
 */
export async function prepareRemoveLocalMetadata(
  this: Procedure<Params, void>,
  params: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'removeMetadataValue'>>> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: {
          nft: { collectionKeys, collectionTicker },
        },
      },
    },
    context,
  } = this;

  const {
    metadataEntry: {
      id,
      type,
      asset: { ticker },
    },
    metadataEntry,
  } = params;

  if (type === MetadataType.Global) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Global Metadata keys cannot be deleted',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawKeyId = bigNumberToU64(id, context);

  const [collectionKey, { canModify, reason }] = await Promise.all([
    collectionTicker(rawTicker),
    metadataEntry.isModifiable(),
  ]);

  if (!collectionKey.isZero()) {
    const rawKeys = await collectionKeys(collectionKey);
    const isRequired = [...rawKeys].some(value =>
      meshMetadataKeyToMetadataKey(value, ticker).id.eq(id)
    );

    if (isRequired) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Cannot delete a mandatory NFT Collection Key',
      });
    }
  }

  if (!canModify) {
    throw reason;
  }

  return {
    transaction: tx.asset.removeLocalMetadataKey,
    args: [rawTicker, rawKeyId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  params: Params
): ProcedureAuthorization {
  const { context } = this;

  const {
    metadataEntry: {
      asset: { ticker },
    },
  } = params;

  return {
    permissions: {
      transactions: [TxTags.asset.RemoveLocalMetadataKey],
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeLocalMetadata = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveLocalMetadata, getAuthorization);
