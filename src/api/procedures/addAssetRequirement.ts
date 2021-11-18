import { differenceWith, flattenDeep, isEqual } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  complianceRequirementToRequirement,
  requirementToComplianceRequirement,
  stringToTicker,
} from '~/utils/conversion';

export interface AddAssetRequirementParams {
  /**
   * array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   */
  conditions: Condition[];
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
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, conditions } = args;

  const rawTicker = stringToTicker(ticker, context);

  assertRequirementsNotTooComplex(context, conditions);

  const currentRequirements = (
    await query.complianceManager.assetCompliances(rawTicker)
  ).requirements.map(
    requirement => complianceRequirementToRequirement(requirement, context).conditions
  );

  if (!differenceWith(flattenDeep<Condition>(currentRequirements), conditions, isEqual).length) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'There already exists a Requirement with the same conditions for this Security Token',
    });
  }

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
