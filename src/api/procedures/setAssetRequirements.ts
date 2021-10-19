import P from 'bluebird';
import { differenceWith, flattenDeep, isEqual } from 'lodash';

import { Context, Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { Condition, ConditionType, ErrorCode, RequirementCondition, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  complianceRequirementToRequirement,
  requirementToComplianceRequirement,
  stringToTicker,
  u32ToBigNumber,
} from '~/utils/conversion';

export interface SetAssetRequirementsParams {
  /**
   * array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   */
  requirements: RequirementCondition[][];
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
function identityTransformation(
  requirements: RequirementCondition[][],
  context: Context
): Condition[][] {
  return (requirements.map(requirementCondition => {
    return requirementCondition.map(requirement => {
      if (requirement.type === ConditionType.IsIdentity) {
        const { identity } = requirement;
        return {
          ...requirement,
          identity:
            identity instanceof Identity ? identity : new Identity({ did: identity }, context),
        };
      }
      return requirement;
    });
  }) as unknown) as Condition[][];
}

/**
 * @hidden
 */
export async function prepareSetAssetRequirements(
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

  if (requirements.length >= maxConditionComplexity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Condition limit reached',
      data: { limit: maxConditionComplexity },
    });
  }

  const rawCurrentAssetCompliance = await query.complianceManager.assetCompliances(rawTicker);

  const currentRequirements = rawCurrentAssetCompliance.requirements.map(
    requirement => complianceRequirementToRequirement(requirement, context).conditions
  );

  const comparator = (a: Condition[], b: Condition[]): boolean => {
    return !differenceWith(a, b, isEqual).length && a.length === b.length;
  };

  const requirementsCondition = identityTransformation(requirements, context);

  if (
    !differenceWith(requirementsCondition, currentRequirements, comparator).length &&
    requirements.length === currentRequirements.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied condition list is equal to the current one',
    });
  }

  const invalidDids: string[] = [];

  await P.each(flattenDeep<Condition>(requirementsCondition), async requirement => {
    if (requirement.type === ConditionType.IsIdentity) {
      const { identity } = requirement;
      const exists = await identity.exists();
      if (!exists) {
        invalidDids.push(identity.did);
      }
    }
  });

  if (invalidDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the passed "isIdentity" conditions reference Identities that do not exist',
      data: {
        dids: invalidDids,
      },
    });
  }

  const rawConditions = requirementsCondition.map(requirement => {
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
