import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesAssetAssetType,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { BaseAsset, Context, PolymeshError, Procedure } from '~/internal';
import {
  Asset,
  ErrorCode,
  KnownAssetType,
  KnownNftType,
  ModifyAssetParams,
  SecurityIdentifier,
  TxTags,
} from '~/types';
import {
  BatchTransactionSpec,
  CustomTypeData,
  ProcedureAuthorization,
  TxWithArgs,
} from '~/types/internal';
import { isNftCollection } from '~/utils';
import {
  assetToMeshAssetId,
  fundingRoundToAssetFundingRound,
  internalAssetTypeToAssetType,
  nameToAssetName,
  securityIdentifierToAssetIdentifier,
} from '~/utils/conversion';
import {
  asAsset,
  checkTxType,
  hasSameElements,
  prepareStorageForCustomType,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { asset: BaseAsset } & ModifyAssetParams;

/**
 * @hidden
 */
export interface Storage {
  /**
   * fetched custom asset type ID and raw value in bytes.
   * A null value means the type is not custom
   */
  customTypeData: CustomTypeData | null;
}

/**
 * @hidden
 */
function getTxForMakeDivisible(
  asset: BaseAsset,
  isDivisible: boolean,
  rawAssetId: PolymeshPrimitivesAssetAssetId,
  context: Context
): TxWithArgs<unknown[]> {
  if (isNftCollection(asset)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'NFT Collections cannot be made divisible',
    });
  }

  if (isDivisible) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The Asset is already divisible',
    });
  }

  return checkTxType({
    transaction: context.polymeshApi.tx.asset.makeDivisible,
    args: [rawAssetId],
  });
}

/**
 * @hidden
 */
function getTxForNameChange(
  newName: string,
  name: string,
  rawAssetId: PolymeshPrimitivesAssetAssetId,
  context: Context
): TxWithArgs<unknown[]> {
  if (newName === name) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New name is the same as current name',
    });
  }

  const nameBytes = nameToAssetName(newName, context);
  return checkTxType({
    transaction: context.polymeshApi.tx.asset.renameAsset,
    args: [rawAssetId, nameBytes],
  });
}

/**
 * @hidden
 */
function getTxForFundingRoundChange(
  newFundingRound: string,
  fundingRound: string | null,
  rawAssetId: PolymeshPrimitivesAssetAssetId,
  context: Context
): TxWithArgs<unknown[]> {
  if (newFundingRound === fundingRound) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New funding round name is the same as current funding round',
    });
  }

  const fundingBytes = fundingRoundToAssetFundingRound(newFundingRound, context);
  return checkTxType({
    transaction: context.polymeshApi.tx.asset.setFundingRound,
    args: [rawAssetId, fundingBytes],
  });
}

/**
 * @hidden
 */
function getTxForIdentifiersChange(
  identifiers: SecurityIdentifier[],
  newIdentifiers: SecurityIdentifier[],
  rawAssetId: PolymeshPrimitivesAssetAssetId,
  context: Context
): TxWithArgs<unknown[]> {
  const identifiersAreEqual = hasSameElements(identifiers, newIdentifiers);

  if (identifiersAreEqual) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New identifiers are the same as current identifiers',
    });
  }

  return checkTxType({
    transaction: context.polymeshApi.tx.asset.updateIdentifiers,
    args: [
      rawAssetId,
      newIdentifiers.map(newIdentifier =>
        securityIdentifierToAssetIdentifier(newIdentifier, context)
      ),
    ],
  });
}

/* eslint-disable max-params */
/**
 * @hidden
 */
function getTxForAssetTypeChange(
  newType: string | BigNumber | undefined,
  assetType: string,
  nonFungible: boolean,
  customTypeData: CustomTypeData | null,
  rawAssetId: PolymeshPrimitivesAssetAssetId,
  context: Context
): TxWithArgs<unknown[]> {
  /* eslint-enable max-params */
  if (
    (typeof newType === 'string' && newType === assetType) ||
    (BigNumber.isBigNumber(newType) && newType.eq(assetType))
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New type is the same as current type',
    });
  }

  if (nonFungible) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The type for a NFT Collection cannot be modified',
    });
  }

  if (
    typeof newType === 'string' &&
    !values<string>(KnownAssetType).includes(newType) &&
    values<string>(KnownNftType).includes(newType)
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'KnownNftType cannot be used as an asset type',
    });
  }

  if (customTypeData && !customTypeData.isAlreadyCreated) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The provided custom type has not been created on the chain',
      data: { newType },
    });
  }

  let rawType: PolymeshPrimitivesAssetAssetType;

  if (customTypeData) {
    const { rawId } = customTypeData;

    rawType = internalAssetTypeToAssetType({ Custom: rawId }, context);
  } else {
    rawType = internalAssetTypeToAssetType(newType as KnownAssetType, context);
  }

  return checkTxType({
    transaction: context.polymeshApi.tx.asset.updateAssetType,
    args: [rawAssetId, rawType],
  });
}

/**
 * @hidden
 */
export async function prepareModifyAsset(
  this: Procedure<Params, Asset, Storage>,
  args: Params
): Promise<BatchTransactionSpec<Asset, unknown[][]>> {
  const { storage, context } = this;
  const {
    asset,
    makeDivisible,
    name: newName,
    fundingRound: newFundingRound,
    identifiers: newIdentifiers,
    assetType: newType,
  } = args;

  const noArguments =
    makeDivisible === undefined &&
    newName === undefined &&
    newFundingRound === undefined &&
    newIdentifiers === undefined &&
    newType === undefined;

  if (noArguments) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Nothing to modify',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const [{ isDivisible, name, assetType, nonFungible }, fundingRound, identifiers] =
    await Promise.all([asset.details(), asset.currentFundingRound(), asset.getIdentifiers()]);

  const transactions = [];
  if (makeDivisible) {
    transactions.push(getTxForMakeDivisible(asset, isDivisible, rawAssetId, context));
  }

  if (newName) {
    transactions.push(getTxForNameChange(newName, name, rawAssetId, context));
  }

  if (newFundingRound) {
    transactions.push(
      getTxForFundingRoundChange(newFundingRound, fundingRound, rawAssetId, context)
    );
  }

  if (newIdentifiers) {
    transactions.push(getTxForIdentifiersChange(identifiers, newIdentifiers, rawAssetId, context));
  }

  if (newType) {
    transactions.push(
      getTxForAssetTypeChange(
        newType,
        assetType,
        nonFungible,
        storage.customTypeData,
        rawAssetId,
        context
      )
    );
  }

  return { transactions, resolver: await asAsset(asset.id, context) };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset, Storage>,
  { asset, makeDivisible, name, fundingRound, identifiers, assetType }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (makeDivisible !== undefined) {
    transactions.push(TxTags.asset.MakeDivisible);
  }

  if (name) {
    transactions.push(TxTags.asset.RenameAsset);
  }

  if (fundingRound) {
    transactions.push(TxTags.asset.SetFundingRound);
  }

  if (identifiers) {
    transactions.push(TxTags.asset.UpdateIdentifiers);
  }

  if (assetType) {
    transactions.push(TxTags.asset.UpdateAssetType);
  }

  return {
    permissions: {
      transactions,
      portfolios: [],
      assets: [asset],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Asset, Storage>,
  { assetType }: Params
): Promise<Storage> {
  const { context } = this;

  if (!assetType) {
    return { customTypeData: null };
  }

  const customTypeData = await prepareStorageForCustomType(
    assetType,
    values(KnownAssetType),
    context,
    'modifyAsset'
  );

  return { customTypeData };
}

/**
 * @hidden
 */
export const modifyAsset = (): Procedure<Params, Asset, Storage> =>
  new Procedure(prepareModifyAsset, getAuthorization, prepareStorage);
