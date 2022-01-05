import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, InputCondition, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

export interface AddAssetRequirementParams {
  /**
   * array of conditions that form the requirement that must be added.
   *   Conditions within a requirement are *AND* between them. This means that in order
   *   for a transfer to comply with this requirement, it must fulfill *ALL* conditions
   */
  conditions: InputCondition[];
}

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
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, conditions } = args;

  const rawTicker = stringToTicker(ticker, context);

  const token = new SecurityToken({ ticker }, context);

  const {
    requirements: currentRequirements,
    defaultTrustedClaimIssuers,
  } = await token.compliance.requirements.get();

  const currentConditions = map(currentRequirements, 'conditions');

  // if the new requirement has the same conditions as any existing one, we throw an error
  if (
    currentConditions.some(requirementConditions =>
      hasSameElements(requirementConditions, conditions, conditionsAreEqual)
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'There already exists a Requirement with the same conditions for this Security Token',
    });
  }

  // check that the new requirement won't cause the current ones to exceed the max complexity
  assertRequirementsNotTooComplex(
    [...flatten(currentConditions), ...conditions],
    defaultTrustedClaimIssuers.length,
    context
  );

  const {
    sender_conditions: senderConditions,
    receiver_conditions: receiverConditions,
  } = requirementToComplianceRequirement({ conditions, id: 1 }, context);

  this.addTransaction(
    tx.complianceManager.addComplianceRequirement,
    {},
    rawTicker,
    senderConditions,
    receiverConditions
  );

  return token;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.complianceManager.AddComplianceRequirement],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addAssetRequirement = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareAddAssetRequirement, getAuthorization);
