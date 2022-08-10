import BigNumber from 'bignumber.js';
import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { AddAssetRequirementParams, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = AddAssetRequirementParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareAddAssetRequirement(
  this: Procedure<Params, Asset>,
  args: Params
): Promise<Asset> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, conditions } = args;

  const rawTicker = stringToTicker(ticker, context);

  const asset = new Asset({ ticker }, context);

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

  this.addTransaction({
    transaction: tx.complianceManager.addComplianceRequirement,
    args: [rawTicker, senderConditions, receiverConditions],
  });

  return asset;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.complianceManager.AddComplianceRequirement],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addAssetRequirement = (): Procedure<Params, Asset> =>
  new Procedure(prepareAddAssetRequirement, getAuthorization);
