import { differenceWith, flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ErrorCode, InputCondition, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual } from '~/utils/internal';

export interface SetAssetRequirementsParams {
  /**
   * array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays.
   *   In other words, higher level arrays are *OR* between them, while conditions inside each array are *AND* between them
   */
  requirements: InputCondition[][];
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
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, requirements } = args;

  const rawTicker = stringToTicker(ticker, context);

  const token = new SecurityToken({ ticker }, context);

  const {
    requirements: currentRequirements,
    defaultTrustedClaimIssuers,
  } = await token.compliance.requirements.get();

  const currentConditions = map(currentRequirements, 'conditions');

  assertRequirementsNotTooComplex(
    context,
    flatten(requirements),
    defaultTrustedClaimIssuers.length
  );

  const comparator = (
    a: (Condition | InputCondition)[],
    b: (Condition | InputCondition)[]
  ): boolean => {
    return !differenceWith(a, b, conditionsAreEqual).length && a.length === b.length;
  };

  if (
    !differenceWith(requirements, currentConditions, comparator).length &&
    requirements.length === currentConditions.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  if (!requirements.length) {
    this.addTransaction({
      transaction: tx.complianceManager.resetAssetCompliance,
      args: [rawTicker],
    });
  } else {
    const rawAssetCompliance = requirements.map((requirement, index) =>
      requirementToComplianceRequirement({ conditions: requirement, id: index }, context)
    );

    this.addTransaction({
      transaction: tx.complianceManager.replaceAssetCompliance,
      args: [rawTicker, rawAssetCompliance],
    });
  }

  return token;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, requirements }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: requirements.length
        ? [TxTags.complianceManager.ReplaceAssetCompliance]
        : [TxTags.complianceManager.ResetAssetCompliance],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetRequirements = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareSetAssetRequirements, getAuthorization);
