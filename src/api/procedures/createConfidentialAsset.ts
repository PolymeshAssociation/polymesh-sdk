import { BTreeSet } from '@polkadot/types';
import { PolymeshDartBpKeysEncryptionPublicKey } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { ConfidentialAsset } from '~/api/entities/ConfidentialAsset';
import { CreateConfidentialAssetParams } from '~/api/entities/ConfidentialAsset/types';
import { Context, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export const createCreateConfidentialAssetResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialAsset => {
    // Find the AssetCreated event in the receipt
    const events = receipt.filterRecords('confidentialAssets', 'AssetCreated');

    if (events.length === 0) {
      throw new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'Failed to find AssetCreated event in transaction receipt',
      });
    }

    const { data } = events[0]!.event;
    // The asset ID is expected to be in the event data (index 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = new BigNumber((data[1] as any).toNumber());

    return new ConfidentialAsset({ id }, context);
  };

/* eslint-disable require-await */
/**
 * @hidden
 */
export async function prepareCreateConfidentialAsset(
  this: Procedure<CreateConfidentialAssetParams, ConfidentialAsset>,
  args: CreateConfidentialAssetParams
): Promise<
  TransactionSpec<ConfidentialAsset, ExtrinsicParams<'confidentialAssets', 'createAsset'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { name, symbol, decimals, auditors, mediators = [], data = '' } = args;

  // Validate inputs
  if (decimals < 0 || decimals > 18) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Decimals must be between 0 and 18',
    });
  }

  if (symbol.length > 12) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Symbol must be 12 characters or less',
    });
  }

  if (auditors.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'At least one auditor is required',
    });
  }

  // Create BTreeSets for mediators and auditors
  const rawMediators = context.createType(
    'BTreeSet<PolymeshDartBpKeysEncryptionPublicKey>',
    mediators
  ) as unknown as BTreeSet<PolymeshDartBpKeysEncryptionPublicKey>;
  const rawAuditors = context.createType(
    'BTreeSet<PolymeshDartBpKeysEncryptionPublicKey>',
    auditors
  ) as unknown as BTreeSet<PolymeshDartBpKeysEncryptionPublicKey>;

  return {
    transaction: tx.confidentialAssets.createAsset,
    args: [name, symbol, decimals, rawMediators, rawAuditors, data],
    resolver: createCreateConfidentialAssetResolver(context),
  };
}

/**
 * @hidden
 */
export const createConfidentialAsset = (): Procedure<
  CreateConfidentialAssetParams,
  ConfidentialAsset
> =>
  new Procedure(prepareCreateConfidentialAsset, {
    permissions: {
      transactions: [TxTags.confidentialAssets.CreateAsset],
      assets: [],
      portfolios: [],
    },
  });
