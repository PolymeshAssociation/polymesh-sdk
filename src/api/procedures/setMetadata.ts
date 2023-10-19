import { FungibleAsset, MetadataEntry, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MetadataLockStatus, SetMetadataParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  metadataToMeshMetadataKey,
  metadataValueDetailToMeshMetadataValueDetail,
  metadataValueToMeshMetadataValue,
  stringToTicker,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = SetMetadataParams & {
  metadataEntry: MetadataEntry;
};

/**
 * @hidden
 */
export async function prepareSetMetadata(
  this: Procedure<Params, MetadataEntry>,
  params: Params
): Promise<
  | TransactionSpec<MetadataEntry, ExtrinsicParams<'assets', 'setAssetMetadata'>>
  | TransactionSpec<MetadataEntry, ExtrinsicParams<'assets', 'setAssetMetadataDetails'>>
> {
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
    ...rest
  } = params;

  const rawTicker = stringToTicker(ticker, context);
  const rawMetadataKey = metadataToMeshMetadataKey(type, id, context);

  const currentValue = await metadataEntry.value();

  if (currentValue) {
    const { lockStatus } = currentValue;

    if (lockStatus === MetadataLockStatus.Locked) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'You cannot set details of a locked Metadata',
      });
    }

    if (lockStatus === MetadataLockStatus.LockedUntil) {
      const { lockedUntil } = currentValue;
      if (new Date() < lockedUntil) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Metadata is currently locked',
          data: {
            lockedUntil,
          },
        });
      }
    }
  } else {
    if (!('value' in rest)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Metadata value details cannot be set for a metadata with no value',
      });
    }
  }

  let transaction;
  let args;
  if ('value' in rest) {
    const { value, details } = rest;
    transaction = tx.asset.setAssetMetadata;
    args = [
      metadataValueToMeshMetadataValue(value, context),
      optionize(metadataValueDetailToMeshMetadataValueDetail)(details, context),
    ];
  } else {
    const { details } = rest;
    transaction = tx.asset.setAssetMetadataDetails;
    args = [metadataValueDetailToMeshMetadataValueDetail(details, context)];
  }

  return {
    transaction,
    args: [rawTicker, rawMetadataKey, ...args],
    resolver: new MetadataEntry({ id, type, ticker }, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, MetadataEntry>,
  params: Params
): ProcedureAuthorization {
  const { context } = this;

  const {
    metadataEntry: {
      asset: { ticker },
    },
  } = params;

  const transactions = [];

  if ('value' in params) {
    transactions.push(TxTags.asset.SetAssetMetadata);
  } else {
    transactions.push(TxTags.asset.SetAssetMetadataDetails);
  }

  return {
    permissions: {
      transactions,
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setMetadata = (): Procedure<Params, MetadataEntry> =>
  new Procedure(prepareSetMetadata, getAuthorization);
