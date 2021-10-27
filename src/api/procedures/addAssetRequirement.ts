import { differenceWith, flattenDeep, isEqual } from 'lodash';

import { assertComplianceConditionComplexity } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  complianceRequirementToRequirement,
  requirementToComplianceRequirement,
  stringToTicker,
  u32ToBigNumber,
} from '~/utils/conversion';

export interface AddAssetRequirementParams {
  /**
   * array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   */
  requirements: Condition[];
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
      polymeshApi: { query, tx, consts },
    },
    context,
  } = this;
  const { ticker, requirements } = args;

  const rawTicker = stringToTicker(ticker, context);

  const maxConditionComplexity = u32ToBigNumber(
    consts.complianceManager.maxConditionComplexity
  ).toNumber();

  assertComplianceConditionComplexity(maxConditionComplexity, flattenDeep<Condition>(requirements));

  const rawCurrentAssetCompliance = await query.complianceManager.assetCompliances(rawTicker);

  const currentRequirements = rawCurrentAssetCompliance.requirements.map(
    requirement => complianceRequirementToRequirement(requirement, context).conditions
  );

  if (!differenceWith(flattenDeep<Condition>(currentRequirements), requirements, isEqual).length) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied condition list is already in the current one',
    });
  }

  const {
    sender_conditions: senderConditions,
    receiver_conditions: receiverConditions,
  } = requirementToComplianceRequirement({ conditions: requirements, id: 1 }, context);

  this.addTransaction(
    tx.complianceManager.addComplianceRequirement,
    {},
    rawTicker,
    senderConditions,
    receiverConditions
  );

  return new SecurityToken({ ticker }, context);
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
