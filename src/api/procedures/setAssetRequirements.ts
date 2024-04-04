import BigNumber from 'bignumber.js';
import { flatten, map } from 'lodash';

import { assertRequirementsNotTooComplex } from '~/api/procedures/utils';
import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { Condition, ErrorCode, InputCondition, SetAssetRequirementsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
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
  this: Procedure<Params, void>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'resetAssetCompliance'>>
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'replaceAssetCompliance'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, requirements } = args;

  const rawTicker = stringToTicker(ticker, context);

  const asset = new FungibleAsset({ ticker }, context);

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
    return {
      transaction: tx.complianceManager.resetAssetCompliance,
      args: [rawTicker],
      resolver: undefined,
    };
  }
  const rawAssetCompliance = requirements.map((requirement, index) =>
    requirementToComplianceRequirement(
      { conditions: requirement, id: new BigNumber(index) },
      context
    )
  );

  return {
    transaction: tx.complianceManager.replaceAssetCompliance,
    args: [rawTicker, rawAssetCompliance],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker, requirements }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: requirements.length
        ? [TxTags.complianceManager.ReplaceAssetCompliance]
        : [TxTags.complianceManager.ResetAssetCompliance],
      assets: [new FungibleAsset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetRequirements = (): Procedure<Params, void> =>
  new Procedure(prepareSetAssetRequirements, getAuthorization);
