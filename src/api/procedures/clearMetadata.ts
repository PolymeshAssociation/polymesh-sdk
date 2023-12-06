import { FungibleAsset, MetadataEntry, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { metadataToMeshMetadataKey, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  metadataEntry: MetadataEntry;
};

/**
 * @hidden
 */
export async function prepareClearMetadata(
  this: Procedure<Params, void>,
  params: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'removeMetadataValue'>>> {
  const {
    context: {
      polymeshApi: { tx },
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

  const rawTicker = stringToTicker(ticker, context);
  const rawMetadataKey = metadataToMeshMetadataKey(type, id, context);

  const { canModify, reason } = await metadataEntry.isModifiable();

  if (!canModify) {
    throw reason;
  }

  return {
    transaction: tx.asset.removeMetadataValue,
    args: [rawTicker, rawMetadataKey],
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
      transactions: [TxTags.asset.RemoveMetadataValue],
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const clearMetadata = (): Procedure<Params, void> =>
  new Procedure(prepareClearMetadata, getAuthorization);
