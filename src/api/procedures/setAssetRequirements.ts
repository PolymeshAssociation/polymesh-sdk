import BigNumber from 'bignumber.js';
import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { Condition, ErrorCode, InputCondition, SetAssetRequirementsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, requirementToComplianceRequirement } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = SetAssetRequirementsParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareSetAssetRequirements(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'resetAssetCompliance'>>
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'replaceAssetCompliance'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, requirements } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { requirements: currentRequirements, defaultTrustedClaimIssuers } =
    await asset.compliance.requirements.get();

  const currentConditions = map(currentRequirements, 'conditions');

  assertRequirementsNotTooComplex(
    flatten(requirements),
    new BigNumber(defaultTrustedClaimIssuers.length),
    context
  );

  const comparator = (
    a: (Condition | InputCondition)[],
    b: (Condition | InputCondition)[]
  ): boolean => {
    return hasSameElements(a, b, conditionsAreEqual);
  };

  if (hasSameElements(requirements, currentConditions, comparator)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  if (!requirements.length) {
    return {
      transaction: tx.complianceManager.resetAssetCompliance,
      args: [rawAssetId],
      resolver: undefined,
    };
  }
  const rawAssetCompliance = await Promise.all(
    requirements.map((requirement, index) =>
      requirementToComplianceRequirement(
        { conditions: requirement, id: new BigNumber(index) },
        context
      )
    )
  );

  return {
    transaction: tx.complianceManager.replaceAssetCompliance,
    args: [rawAssetId, rawAssetCompliance],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset, requirements }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: requirements.length
        ? [TxTags.complianceManager.ReplaceAssetCompliance]
        : [TxTags.complianceManager.ResetAssetCompliance],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetRequirements = (): Procedure<Params, void> =>
  new Procedure(prepareSetAssetRequirements, getAuthorization);
