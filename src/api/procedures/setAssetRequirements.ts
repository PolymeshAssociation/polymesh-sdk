import { differenceWith, flattenDeep, isEqual } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  complianceRequirementToRequirement,
  numberToU32,
  requirementToComplianceRequirement,
  stringToTicker,
} from '~/utils/conversion';

export interface SetAssetRequirementsParams {
  /**
   * array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   */
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

  assertRequirementsNotTooComplex(context, flattenDeep<Condition>(requirements));

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
      code: ErrorCode.NoDataChange,
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

  if (!requirements.length) {
    this.addTransaction(tx.complianceManager.resetAssetCompliance, {}, rawTicker);
  } else {
    /* eslint-disable @typescript-eslint/naming-convention */
    const assetCompliance = rawConditions.map(({ senderConditions, receiverConditions }, i) => ({
      sender_conditions: senderConditions,
      receiver_conditions: receiverConditions,
      id: numberToU32(i, context),
    }));
    /* eslint-enable @typescript-eslint/naming-convention */

    this.addTransaction(
      tx.complianceManager.replaceAssetCompliance,
      {},
      rawTicker,
      assetCompliance
    );
  }

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
export const setAssetRequirements = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareSetAssetRequirements, getAuthorization);
