import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { Asset, ErrorCode, ModifyAssetParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { isNftCollection } from '~/utils';
import {
  assetToMeshAssetId,
  fundingRoundToAssetFundingRound,
  nameToAssetName,
  securityIdentifierToAssetIdentifier,
} from '~/utils/conversion';
import { asAsset, checkTxType, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { asset: BaseAsset } & ModifyAssetParams;

/**
 * @hidden
 */
export async function prepareModifyAsset(
  this: Procedure<Params, Asset>,
  args: Params
): Promise<BatchTransactionSpec<Asset, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const {
    asset,
    makeDivisible,
    name: newName,
    fundingRound: newFundingRound,
    identifiers: newIdentifiers,
  } = args;

  const noArguments =
    makeDivisible === undefined &&
    newName === undefined &&
    newFundingRound === undefined &&
    newIdentifiers === undefined;

  if (noArguments) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Nothing to modify',
    });
  }

  const rawAssetId = await assetToMeshAssetId(asset, context);

  const [{ isDivisible, name }, fundingRound, identifiers] = await Promise.all([
    asset.details(),
    asset.currentFundingRound(),
    asset.getIdentifiers(),
  ]);

  const transactions = [];
  if (makeDivisible) {
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

    transactions.push(
      checkTxType({
        transaction: tx.asset.makeDivisible,
        args: [rawAssetId],
      })
    );
  }

  if (newName) {
    if (newName === name) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New name is the same as current name',
      });
    }

    const nameBytes = nameToAssetName(newName, context);
    transactions.push(
      checkTxType({
        transaction: tx.asset.renameAsset,
        args: [rawAssetId, nameBytes],
      })
    );
  }

  if (newFundingRound) {
    if (newFundingRound === fundingRound) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New funding round name is the same as current funding round',
      });
    }

    const fundingBytes = fundingRoundToAssetFundingRound(newFundingRound, context);
    transactions.push(
      checkTxType({
        transaction: tx.asset.setFundingRound,
        args: [rawAssetId, fundingBytes],
      })
    );
  }

  if (newIdentifiers) {
    const identifiersAreEqual = hasSameElements(identifiers, newIdentifiers);

    if (identifiersAreEqual) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New identifiers are the same as current identifiers',
      });
    }

    transactions.push(
      checkTxType({
        transaction: tx.asset.updateIdentifiers,
        args: [
          rawAssetId,
          newIdentifiers.map(newIdentifier =>
            securityIdentifierToAssetIdentifier(newIdentifier, context)
          ),
        ],
      })
    );
  }

  return { transactions, resolver: await asAsset(asset.id, context) };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
  { asset, makeDivisible, name, fundingRound, identifiers }: Params
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
export const modifyAsset = (): Procedure<Params, Asset> =>
  new Procedure(prepareModifyAsset, getAuthorization);
