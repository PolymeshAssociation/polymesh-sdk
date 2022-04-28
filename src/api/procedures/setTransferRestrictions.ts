import {
  BTreeSetStatType,
  BTreeSetStatUpdate,
  BTreeSetTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { TransferCondition, TxTag, TxTags } from 'polymesh-types/types';

import { StatisticsOpType } from '~/api/entities/Asset/TransferRestrictions/types';
import { Asset, Identity, PolymeshError, Procedure } from '~/internal';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestriction,
  TransferRestrictionType,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  bigNumberToU128,
  meshStatToStat,
  permillToBigNumber,
  primitive2ndKey,
  primitiveOpType,
  primitiveStatisticsStatType,
  scopeIdsToBtreeSetIdentityId,
  statUpdate,
  stringToIdentityId,
  stringToTicker,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { getExemptedIds } from '~/utils/internal';

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

export type SetTransferRestrictionsParams = { ticker: string } & (
  | SetCountTransferRestrictionsParams
  | SetPercentageTransferRestrictionsParams
);

/**
 * @hidden
 */
export interface Storage {
  currentRestrictions: TransferCondition[];
  occupiedSlots: BigNumber;
  needStat: boolean;
  currentStats: BTreeSetStatType;
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
        query: { asset },
        consts,
      },
    },
    storage: { currentRestrictions, occupiedSlots, needStat, currentStats },
    context,
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
    restrictions,
    type,
    ticker,
  } = args;

  const rawTicker = stringToTicker(ticker, context);

  const exemptions: (string | Identity)[] = [];

  let someDifference = restrictions.length !== currentRestrictions.length;
  const conditions = restrictions.map(r => {
    if (!someDifference) {
      someDifference = !currentRestrictions.find(transferRestriction => {
        if (transferRestriction.isMaxInvestorCount && type === TransferRestrictionType.Count) {
          const currentCount = u64ToBigNumber(transferRestriction.asMaxInvestorCount);
          return currentCount.eq((r as CountTransferRestrictionInput).count);
        } else if (transferRestriction.isMaxInvestorOwnership && type === 'Percentage') {
          const currentOwnership = permillToBigNumber(transferRestriction.asMaxInvestorOwnership);
          return currentOwnership.eq((r as PercentageTransferRestrictionInput).percentage);
        }
        return false;
      });
    }
    let condition: TransferRestriction;
    if (type === TransferRestrictionType.Count) {
      condition = { type, value: (r as CountTransferRestrictionInput).count };
    } else {
      condition = { type, value: (r as PercentageTransferRestrictionInput).percentage };
    }

    const rawCondition = transferRestrictionToPolymeshTransferCondition(condition, context);

    if (r.exemptedIdentities) {
      r.exemptedIdentities.forEach(e => {
        exemptions.push(e);
      });
    }

    return rawCondition;
  }) as BTreeSetTransferCondition;

  if (!someDifference) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: newRestrictionAmount
        ? 'The supplied restrictions are already in place'
        : 'There are no restrictions to remove',
    });
  }

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

  const op =
    type === TransferRestrictionType.Count
      ? primitiveOpType(StatisticsOpType.Count, context)
      : primitiveOpType(StatisticsOpType.Balance, context);

  if (needStat) {
    const newStat = primitiveStatisticsStatType(op, context);
    currentStats.push(newStat);
    currentStats.sort().reverse();

    this.addTransaction({
      transaction: statistics.setActiveAssetStats,
      args: [{ Ticker: rawTicker }, currentStats],
    });

    // Count stats need to be initialized manually
    if (type === TransferRestrictionType.Count) {
      const holders = await asset.balanceOf.entries(rawTicker);
      const holderCount = new BigNumber(holders.length);
      const secondKey = primitive2ndKey(context);
      const stat = [
        statUpdate(secondKey, bigNumberToU128(holderCount, context), context),
      ] as BTreeSetStatUpdate;

      this.addTransaction({
        transaction: statistics.batchUpdateAssetStats,
        args: [{ Ticker: rawTicker }, newStat, stat],
      });
    }
  }

  this.addTransaction({
    transaction: statistics.setAssetTransferCompliance,
    args: [{ Ticker: rawTicker }, conditions],
  });

  if (exemptions.length) {
    const exemptedIds = await getExemptedIds(exemptions, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);

    this.addTransaction({
      transaction: statistics.setEntitiesExempt,
      feeMultiplier: new BigNumber(exemptions.length),
      args: [true, { asset: { Ticker: rawTicker }, op }, btreeIds],
    });
  }

  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  { ticker }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  const { needStat } = this.storage;

  const transactions: TxTag[] = [TxTags.statistics.SetAssetTransferCompliance];

  if (needStat) {
    transactions.push(TxTags.statistics.SetActiveAssetStats);
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

  const rawTicker = stringToTicker(ticker, context);

  const currentStats = await statistics.activeAssetStats({ Ticker: rawTicker });
  const needStat = !currentStats.find(s => {
    const stat = meshStatToStat(s);
    const cmpStat = stat.type === 'Balance' ? 'Percentage' : 'Count';
    return cmpStat === type;
  });

  const {
    transferRestrictions: { count, percentage },
  } = new Asset({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
  ] = await Promise.all([count.get(), percentage.get()]);

  const currentRestrictions: TransferRestriction[] = [];
  const currentExemptions: [TransferRestriction, string[]][] = [];

  // take the count of the type of restrictions not being changed
  const occupiedSlots =
    type === 'Percentage' ? currentCountRestrictions.length : currentPercentageRestrictions.length;

  /*
   * we're using `defusePromise` here because we KNOW the exempted ID promises are being
   * awaited later and errors WILL be caught
   */
  if (type === TransferRestrictionType.Count) {
    currentCountRestrictions.forEach(({ exemptedIds = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
    });
  } else {
    currentPercentageRestrictions.forEach(({ exemptedIds = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
    });
  }

  const transformRestriction = (restriction: TransferRestriction): TransferCondition =>
    transferRestrictionToPolymeshTransferCondition(restriction, context);

  return {
    occupiedSlots: new BigNumber(occupiedSlots),
    currentRestrictions: currentRestrictions.map(transformRestriction),
    needStat,
    currentStats,
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
