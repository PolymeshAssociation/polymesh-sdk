import BigNumber from 'bignumber.js';
import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { Condition, ErrorCode, InputCondition, SetAssetRequirementsParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { requirementToComplianceRequirement, stringToTicker } from '~/utils/conversion';
import { conditionsAreEqual, hasSameElements } from '~/utils/internal';

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
  this: Procedure<Params, Asset>,
  args: Params
): Promise<Asset> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, requirements } = args;

  const rawTicker = stringToTicker(ticker, context);

  const asset = new Asset({ ticker }, context);

  const { requirements: currentRequirements, defaultTrustedClaimIssuers } =
    await asset.compliance.requirements.get();

  const currentConditions = map(currentRequirements, 'conditions');

  assertRequirementsNotTooComplex(
    flatten(requirements),
    new BigNumber(defaultTrustedClaimIssuers.length),
    context
  );

  const comparator = (
    a: (Condition | InputCondition)[],
    b: (Condition | InputCondition)[]
  ): boolean => {
    return hasSameElements(a, b, conditionsAreEqual);
  };

  if (hasSameElements(requirements, currentConditions, comparator)) {
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
      requirementToComplianceRequirement(
        { conditions: requirement, id: new BigNumber(index) },
        context
      )
    );

    this.addTransaction({
      transaction: tx.complianceManager.replaceAssetCompliance,
      args: [rawTicker, rawAssetCompliance],
    });
  }

  return asset;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
  { ticker, requirements }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: requirements.length
        ? [TxTags.complianceManager.ReplaceAssetCompliance]
        : [TxTags.complianceManager.ResetAssetCompliance],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetRequirements = (): Procedure<Params, Asset> =>
  new Procedure(prepareSetAssetRequirements, getAuthorization);
