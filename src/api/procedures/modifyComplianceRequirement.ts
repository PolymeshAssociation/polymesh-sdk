import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, InputCondition, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

export type ModifyComplianceRequirementParams = {
  /**
   * ID of the Compliance Requirement
   */
  id: number;
  /**
   * array of conditions to replace the existing array of conditions for the requirement(identified by `id`).
   *   Conditions within a requirement are *AND* between them. This means that in order
   *   for a transfer to comply with this requirement, it must fulfill *ALL* conditions
   */
  conditions: InputCondition[];
};

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
  const { ticker, id, conditions } = args;

  const rawTicker = stringToTicker(ticker, context);

  const token = new SecurityToken({ ticker }, context);

  const {
    requirements: currentRequirements,
    defaultTrustedClaimIssuers,
  } = await token.compliance.requirements.get();

  const existingRequirement = currentRequirements.find(
    ({ id: currentRequirementId }) => id === currentRequirementId
  );

  if (!existingRequirement) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Compliance Requirement does not exist',
    });
  }

  const { conditions: existingConditions } = existingRequirement;

  if (hasSameElements(conditions, existingConditions, conditionsAreEqual)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  assertRequirementsNotTooComplex(context, conditions, defaultTrustedClaimIssuers.length);

  const rawComplianceRequirement = requirementToComplianceRequirement({ conditions, id }, context);

  this.addTransaction(
    tx.complianceManager.changeComplianceRequirement,
    {},
    rawTicker,
    rawComplianceRequirement
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.TickerOwner, ticker }],
    permissions: {
      transactions: [TxTags.complianceManager.ChangeComplianceRequirement],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyComplianceRequirement = (): Procedure<Params, void> =>
  new Procedure(prepareModifyComplianceRequirement, getAuthorization);
