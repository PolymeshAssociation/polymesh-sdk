import { differenceWith, isEqual } from 'lodash';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { MAX_COMPLIANCE_REQUIREMENT_CONDITIONS } from '~/utils/constants';
import {
  complianceRequirementToRequirement,
  requirementToComplianceRequirement,
  stringToTicker,
} from '~/utils/conversion';

export interface SetAssetRequirementsParams {
  requirements: Condition[][];
}

/**
 * @hidden
 */
export type Params = SetAssetRequirementsParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetAssetRequirements(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, requirements } = args;

  const rawTicker = stringToTicker(ticker, context);

  if (requirements.length >= MAX_COMPLIANCE_REQUIREMENT_CONDITIONS) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Condition limit reached',
      data: { limit: MAX_COMPLIANCE_REQUIREMENT_CONDITIONS },
    });
  }

  const rawCurrentAssetCompliance = await query.complianceManager.assetCompliances(rawTicker);

  const currentRequirements = rawCurrentAssetCompliance.requirements.map(
    requirement => complianceRequirementToRequirement(requirement, context).conditions
  );

  const comparator = (a: Condition[], b: Condition[]): boolean => {
    return !differenceWith(a, b, isEqual).length && a.length === b.length;
  };

  if (
    !differenceWith(requirements, currentRequirements, comparator).length &&
    requirements.length === currentRequirements.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  const rawConditions = requirements.map(requirement => {
    const {
      sender_conditions: senderConditions,
      receiver_conditions: receiverConditions,
    } = requirementToComplianceRequirement({ conditions: requirement, id: 1 }, context);

    return {
      senderConditions,
      receiverConditions,
    };
  });

  if (currentRequirements.length) {
    this.addTransaction(tx.complianceManager.resetAssetCompliance, {}, rawTicker);
  }

  rawConditions.forEach(({ senderConditions, receiverConditions }) => {
    this.addTransaction(
      tx.complianceManager.addComplianceRequirement,
      {},
      rawTicker,
      senderConditions,
      receiverConditions
    );
  });

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
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [
        TxTags.complianceManager.ResetAssetCompliance,
        TxTags.complianceManager.AddComplianceRequirement,
      ],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetRequirements = new Procedure(prepareSetAssetRequirements, getAuthorization);
