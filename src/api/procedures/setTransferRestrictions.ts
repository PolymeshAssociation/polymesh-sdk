import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { TransferCondition } from 'polymesh-types/types';

import { Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountTransferRestrictionInput,
  ClaimOwnershipTransferRestrictionInput,
  ClaimRestrictionValue,
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestriction,
  TransferRestrictionType,
  TxTag,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  complianceConditionsToBtreeSet,
  scopeIdsToBtreeSetIdentityId,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  stringToIdentityId,
  stringToTickerKey,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
} from '~/utils/conversion';
import { checkTxType, compareTransferRestrictionToInput, getExemptedIds } from '~/utils/internal';

export interface SetCountTransferRestrictionsParams {
  /**
   * array of Count Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: CountTransferRestrictionInput[];
  type: TransferRestrictionType.Count;
}

export interface SetPercentageTransferRestrictionsParams {
  /**
   * array of Percentage Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: PercentageTransferRestrictionInput[];
  type: TransferRestrictionType.Percentage;
}

export interface SetClaimCountTransferRestrictionsParams {
  restrictions: ClaimCountTransferRestrictionInput[];
  type: TransferRestrictionType.ClaimCount;
}

export interface SetClaimOwnershipTransferRestrictionsParams {
  restrictions: ClaimOwnershipTransferRestrictionInput[];
  type: TransferRestrictionType.ClaimOwnership;
}

export type SetTransferRestrictionsParams = { ticker: string } & (
  | SetCountTransferRestrictionsParams
  | SetPercentageTransferRestrictionsParams
  | SetClaimCountTransferRestrictionsParams
  | SetClaimOwnershipTransferRestrictionsParams
);

/**
 * @hidden
 */
export interface Storage {
  currentRestrictions: TransferCondition[];
  occupiedSlots: BigNumber;
}

/**
 * @hidden
 */
function transformRestrictions(
  restrictions:
    | CountTransferRestrictionInput[]
    | PercentageTransferRestrictionInput[]
    | ClaimCountTransferRestrictionInput[]
    | ClaimOwnershipTransferRestrictionInput[],
  currentRestrictions: TransferCondition[],
  type: TransferRestrictionType,
  context: Context
): [PolymeshPrimitivesTransferComplianceTransferCondition[], (string | Identity)[]] {
  const exemptions: (string | Identity)[] = [];

  let someDifference = restrictions.length !== currentRestrictions.length;
  const conditions: PolymeshPrimitivesTransferComplianceTransferCondition[] = [];
  restrictions.forEach(r => {
    let value: BigNumber | ClaimRestrictionValue;
    if ('count' in r) {
      value = r.count;
    } else if ('percentage' in r) {
      value = r.percentage;
    } else {
      value = r;
    }

    const compareConditions = (transferCondition: TransferCondition): boolean =>
      compareTransferRestrictionToInput(transferCondition, value, type);
    if (!someDifference) {
      someDifference = ![...currentRestrictions].find(compareConditions);
    }
    const condition = { type, value };

    const rawCondition = transferRestrictionToPolymeshTransferCondition(condition, context);

    if (r.exemptedIdentities) {
      r.exemptedIdentities.forEach(e => {
        exemptions.push(e);
      });
    }

    conditions.push(rawCondition);
  });

  if (!someDifference) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: restrictions.length
        ? 'The supplied restrictions are already in place'
        : 'There are no restrictions to remove',
    });
  }

  return [conditions, exemptions];
}

/**
 * @hidden
 */
export async function prepareSetTransferRestrictions(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  args: SetTransferRestrictionsParams
): Promise<BigNumber> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        consts,
      },
    },
    storage: { currentRestrictions, occupiedSlots },
    context,
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
    restrictions,
    type,
    ticker,
  } = args;
  const tickerKey = stringToTickerKey(ticker, context);

  const [conditions, exemptions] = transformRestrictions(
    restrictions,
    currentRestrictions,
    type,
    context
  );

  const maxTransferConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);
  const finalCount = occupiedSlots.plus(newRestrictionAmount);
  if (finalCount.gte(maxTransferConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Cannot set more Transfer Restrictions than there are slots available',
      data: {
        availableSlots: maxTransferConditions.minus(occupiedSlots),
      },
    });
  }

  const transactions = [];

  const op =
    type === TransferRestrictionType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  transactions.push(
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [tickerKey, complianceConditionsToBtreeSet(conditions, context)],
    })
  );

  if (exemptions.length) {
    const exemptedIds = await getExemptedIds(exemptions, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
    const exemptKey = toExemptKey(tickerKey, op);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptions.length),
        args: [true, exemptKey, btreeIds],
      })
    );
  }
  this.addBatchTransaction({ transactions });
  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  { ticker, restrictions }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  const transactions: TxTag[] = [TxTags.statistics.SetAssetTransferCompliance];

  const needExemptionsPermission = restrictions.some(r => r.exemptedIdentities?.length);
  if (needExemptionsPermission) {
    transactions.push(TxTags.statistics.SetEntitiesExempt);
  }

  return {
    permissions: {
      assets: [new Asset({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  args: SetTransferRestrictionsParams
): Promise<Storage> {
  const {
    context,
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
  } = this;
  const { ticker, type } = args;

  const tickerKey = stringToTickerKey(ticker, context);

  const currentStats = await statistics.activeAssetStats(tickerKey);

  const neededOp =
    type === TransferRestrictionType.Count ? StatisticsOpType.Count : StatisticsOpType.Balance;
  const rawOp = statisticsOpTypeToStatOpType(neededOp, context);

  const neededStat = statisticsOpTypeToStatType({ op: rawOp }, context);
  const needStat = !currentStats.has(neededStat);

  if (needStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The appropriate statistic must be enabled. Try calling the enableStat method first',
    });
  }

  const {
    transferRestrictions: { count, percentage, claimCount, claimOwnership },
  } = new Asset({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
    { restrictions: currentClaimCountRestrictions },
    { restrictions: currentClaimOwnershipRestrictions },
  ] = await Promise.all([count.get(), percentage.get(), claimCount.get(), claimOwnership.get()]);

  const currentRestrictions: TransferRestriction[] = [];

  // take the count of the type of restrictions not being changed
  const occupiedSlots =
    type === TransferRestrictionType.Percentage
      ? currentCountRestrictions.length
      : currentPercentageRestrictions.length;

  if (type === TransferRestrictionType.Count) {
    currentCountRestrictions.forEach(({ count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      currentRestrictions.push(restriction);
    });
  } else if (type === TransferRestrictionType.Percentage) {
    currentPercentageRestrictions.forEach(({ percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      currentRestrictions.push(restriction);
    });
  } else if (type === TransferRestrictionType.ClaimCount) {
    currentClaimCountRestrictions.forEach(({ claim, min, max, issuer }) => {
      const restriction = {
        type: TransferRestrictionType.ClaimCount,
        value: { claim, min, max, issuer },
      };
      currentRestrictions.push(restriction);
    });
  } else {
    currentClaimOwnershipRestrictions.forEach(({ claim, min, max, issuer }) => {
      const restriction = {
        type: TransferRestrictionType.ClaimCount,
        value: { claim, min, max, issuer },
      };
      currentRestrictions.push(restriction);
    });
  }

  const transformRestriction = (
    restriction: TransferRestriction
  ): PolymeshPrimitivesTransferComplianceTransferCondition =>
    transferRestrictionToPolymeshTransferCondition(restriction, context);

  return {
    occupiedSlots: new BigNumber(occupiedSlots),
    currentRestrictions: currentRestrictions.map(transformRestriction),
  };
}

/**
 * @hidden
 */
export const setTransferRestrictions = (): Procedure<
  SetTransferRestrictionsParams,
  BigNumber,
  Storage
> => new Procedure(prepareSetTransferRestrictions, getAuthorization, prepareStorage);
