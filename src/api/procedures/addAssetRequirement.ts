import BigNumber from 'bignumber.js';
import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { AddAssetRequirementParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, requirementToComplianceRequirement } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = AddAssetRequirementParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareAddAssetRequirement(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  TransactionSpec<void, ExtrinsicParams<'complianceManager', 'addComplianceRequirement'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, conditions } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { requirements: currentRequirements, defaultTrustedClaimIssuers } =
    await asset.compliance.requirements.get();

  const currentConditions = map(currentRequirements, 'conditions');

  // if the new requirement has the same conditions as any existing one, we throw an error
  if (
    currentConditions.some(requirementConditions =>
      hasSameElements(requirementConditions, conditions, conditionsAreEqual)
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'There already exists a Requirement with the same conditions for this Asset',
    });
  }

  // check that the new requirement won't cause the current ones to exceed the max complexity
  assertRequirementsNotTooComplex(
    [...flatten(currentConditions), ...conditions],
    new BigNumber(defaultTrustedClaimIssuers.length),
    context
  );

  const { senderConditions, receiverConditions } = requirementToComplianceRequirement(
    { conditions, id: new BigNumber(1) },
    context
  );

  return {
    transaction: tx.complianceManager.addComplianceRequirement,
    args: [rawAssetId, senderConditions, receiverConditions],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.complianceManager.AddComplianceRequirement],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addAssetRequirement = (): Procedure<Params, void> =>
  new Procedure(prepareAddAssetRequirement, getAuthorization);
