import BigNumber from 'bignumber.js';
import { flatMap, remove } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, ModifyComplianceRequirementParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = ModifyComplianceRequirementParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareModifyComplianceRequirement(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, id, conditions: newConditions } = args;

  const rawTicker = stringToTicker(ticker, context);

  const token = new Asset({ ticker }, context);

  const { requirements: currentRequirements, defaultTrustedClaimIssuers } =
    await token.compliance.requirements.get();

  const existingRequirements = remove(currentRequirements, ({ id: currentRequirementId }) =>
    id.eq(currentRequirementId)
  );

  if (!existingRequirements.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Compliance Requirement does not exist',
    });
  }

  const [{ conditions: existingConditions }] = existingRequirements;

  if (hasSameElements(newConditions, existingConditions, conditionsAreEqual)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  const unchangedConditions = flatMap(currentRequirements, 'conditions');

  assertRequirementsNotTooComplex(
    [...unchangedConditions, ...newConditions],
    new BigNumber(defaultTrustedClaimIssuers.length),
    context
  );

  const rawComplianceRequirement = requirementToComplianceRequirement(
    { conditions: newConditions, id },
    context
  );

  this.addTransaction({
    transaction: tx.complianceManager.changeComplianceRequirement,
    args: [rawTicker, rawComplianceRequirement],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.complianceManager.ChangeComplianceRequirement],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyComplianceRequirement = (): Procedure<Params, void> =>
  new Procedure(prepareModifyComplianceRequirement, getAuthorization);
