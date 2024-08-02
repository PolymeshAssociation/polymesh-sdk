import { Permill } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';

import { assertCaTaxWithholdingsValid } from '~/api/procedures/utils';
import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  CorporateActionTargets,
  ErrorCode,
  InputTargets,
  ModifyCaDefaultConfigParams,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetToMeshAssetId,
  percentageToPermill,
  signerToString,
  stringToIdentityId,
  targetsToTargetIdentities,
} from '~/utils/conversion';
import { assembleBatchTransactions, checkTxType, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { asset: FungibleAsset } & ModifyCaDefaultConfigParams;

const areSameTargets = (targets: CorporateActionTargets, newTargets: InputTargets): boolean => {
  const { identities: newIdentities, treatment: newTreatment } = newTargets;
  const { identities, treatment } = targets;

  return (
    hasSameElements(
      identities,
      newIdentities,
      (identity, newIdentity) => signerToString(identity) === signerToString(newIdentity)
    ) && treatment === newTreatment
  );
};

/**
 * @hidden
 */
export async function prepareModifyCaDefaultConfig(
  this: Procedure<Params, void>,
  args: Params
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const {
    asset,
    targets: newTargets,
    defaultTaxWithholding: newDefaultTaxWithholding,
    taxWithholdings: newTaxWithholdings,
  } = args;

  const noArguments =
    newTargets === undefined &&
    newDefaultTaxWithholding === undefined &&
    newTaxWithholdings === undefined;

  if (noArguments) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Nothing to modify',
    });
  }

  if (newTaxWithholdings) {
    assertCaTaxWithholdingsValid(newTaxWithholdings, context);
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { targets, defaultTaxWithholding, taxWithholdings } =
    await asset.corporateActions.getDefaultConfig();

  const transactions = [];

  if (newTargets) {
    if (areSameTargets(targets, newTargets)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New targets are the same as the current ones',
      });
    }

    transactions.push(
      checkTxType({
        transaction: tx.corporateAction.setDefaultTargets,
        args: [rawAssetId, targetsToTargetIdentities(newTargets, context)],
      })
    );
  }

  if (newDefaultTaxWithholding) {
    if (newDefaultTaxWithholding.eq(defaultTaxWithholding)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New default tax withholding is the same as the current one',
      });
    }

    transactions.push(
      checkTxType({
        transaction: tx.corporateAction.setDefaultWithholdingTax,
        args: [rawAssetId, percentageToPermill(newDefaultTaxWithholding, context)],
      })
    );
  }

  if (newTaxWithholdings) {
    const areSameWithholdings = hasSameElements(
      taxWithholdings,
      newTaxWithholdings,
      ({ identity, percentage }, { identity: newIdentity, percentage: newPercentage }) =>
        signerToString(identity) === signerToString(newIdentity) && percentage.eq(newPercentage)
    );

    if (areSameWithholdings) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New per-Identity tax withholding percentages are the same as current ones',
      });
    }

    const transaction = tx.corporateAction.setDidWithholdingTax;
    const argsArray: [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId, Permill][] =
      newTaxWithholdings.map(({ identity, percentage }) => [
        rawAssetId,
        stringToIdentityId(signerToString(identity), context),
        percentageToPermill(percentage, context),
      ]);

    transactions.push(
      ...assembleBatchTransactions([
        {
          transaction,
          argsArray,
        },
      ])
    );
  }

  return { transactions, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset, targets, defaultTaxWithholding, taxWithholdings }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (targets) {
    transactions.push(TxTags.corporateAction.SetDefaultTargets);
  }

  if (defaultTaxWithholding) {
    transactions.push(TxTags.corporateAction.SetDefaultWithholdingTax);
  }

  if (taxWithholdings) {
    transactions.push(TxTags.corporateAction.SetDidWithholdingTax);
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
export const modifyCaDefaultConfig = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaDefaultConfig, getAuthorization);
