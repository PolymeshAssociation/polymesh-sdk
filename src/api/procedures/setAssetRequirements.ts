import { differenceWith, isEqual } from 'lodash';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { Condition, ErrorCode, Role, RoleType } from '~/types';
import {
  complianceRequirementToRequirement,
  requirementToComplianceRequirement,
  stringToTicker,
} from '~/utils';

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

  const rawCurrentAssetCompliance = await query.complianceManager.assetCompliances(rawTicker);

  const currentRequirements = rawCurrentAssetCompliance.requirements.map(
    requirement => complianceRequirementToRequirement(requirement).conditions
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
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const setAssetRequirements = new Procedure(prepareSetAssetRequirements, getRequiredRoles);
