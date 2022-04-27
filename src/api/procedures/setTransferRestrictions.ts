import { U8aFixed } from '@polkadot/types';
import {
  BTreeSetIdentityId,
  BTreeSetStatType,
  BTreeSetStatUpdate,
  BTreeSetTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { TransferCondition, TxTags } from 'polymesh-types/types';

import { StatisticsType } from '~/api/entities/Asset/TransferRestrictions/types';
import { Asset, PolymeshError, Procedure } from '~/internal';
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
  opToStatType,
  permillToBigNumber,
  primitive2ndKey,
  primitiveOpType,
  statUpdate,
  stringToIdentityId,
  stringToScopeId,
  stringToTicker,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { assembleBatchTransactions, defusePromise, getExemptedIds } from '~/utils/internal';

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
  currentExemptions: [TransferCondition, U8aFixed[]][];
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
    storage: { currentRestrictions, currentExemptions, occupiedSlots, needStat, currentStats },
    context,
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
    restrictions,
    type,
    ticker,
  } = args;

  const rawTicker = stringToTicker(ticker, context);

  const exemptions: any[] = [];

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
    } else if (type === TransferRestrictionType.Percentage) {
      condition = { type, value: (r as PercentageTransferRestrictionInput).percentage };
    } else {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Unknown transfer restriction type: ${type}`,
      });
    }

    const rawCondition = transferRestrictionToPolymeshTransferCondition(condition, context);

    if (r.exemptedIdentities) {
      exemptions.push({
        asset: { Ticker: rawTicker },
        op: type,
        entities: r.exemptedIdentities?.map(
          e => stringToIdentityId(e as string, context) // TODO need to check for Identity
        ) as BTreeSetIdentityId,
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

  if (needStat) {
    const op =
      type === TransferRestrictionType.Count
        ? primitiveOpType(StatisticsType.Count, context)
        : primitiveOpType(StatisticsType.Balance, context);
    const newStat = opToStatType(op, context);
    currentStats.push(newStat);

    this.addTransaction({
      transaction: statistics.setActiveAssetStats,
      args: [{ Ticker: rawTicker }, currentStats],
    });

    // also need to set the initial stats if its count
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

  if (exemptions) {
    exemptions.forEach(({ op, entities }) => {
      this.addTransaction({
        transaction: statistics.setEntitiesExempt,
        args: [true, { asset: rawTicker, op }, entities as BTreeSetIdentityId],
      });
    });
  }

  // const transactions = assembleBatchTransactions(
  //   tuple({
  //     transaction: statistics.setAssetTransferCompliance,
  //     argsArray: [{ Ticker: rawTicker }, conditions] as any,
  //   })
  // );

  // this.addBatchTransaction({ transactions });

  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  { ticker }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [new Asset({ ticker }, this.context)],
      transactions: [TxTags.statistics.SetActiveAssetStats, TxTags.statistics.SetEntitiesExempt], // should be dynamic
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
  const { ticker, type, restrictions } = args;

  const rawTicker = stringToTicker(ticker, context);

  const currentStats = await statistics.activeAssetStats(rawTicker);
  console.log('current statistics', currentStats.toString());
  const needStat =
    !currentStats.find(s => meshStatToStat(s).type === 'Count') &&
    type === TransferRestrictionType.Count;

  const {
    transferRestrictions: { count, percentage },
  } = new Asset({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
  ] = await Promise.all([count.get(), percentage.get()]);

  const currentRestrictions: TransferRestriction[] = [];
  const currentExemptions: [TransferRestriction, string[]][] = [];
  const toAddRestrictions: TransferRestriction[] = [];
  const toAddExemptionPromises: [TransferRestriction, Promise<string[]>][] = [];
  let occupiedSlots = currentCountRestrictions.length + currentPercentageRestrictions.length;

  /*
   * we're using `defusePromise` here because we KNOW the exempted ID promises are being
   * awaited later and errors WILL be caught
   */
  if (type === TransferRestrictionType.Count) {
    restrictions.forEach(({ exemptedIdentities = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      toAddRestrictions.push(restriction);
      toAddExemptionPromises.push(
        tuple(restriction, defusePromise(getExemptedIds(exemptedIdentities, context, ticker)))
      );
    });
    currentCountRestrictions.forEach(({ exemptedIds = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
    });
  } else {
    restrictions.forEach(({ exemptedIdentities = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      toAddRestrictions.push(restriction);
      toAddExemptionPromises.push(
        tuple(restriction, defusePromise(getExemptedIds(exemptedIdentities, context, ticker)))
      );
    });
    currentPercentageRestrictions.forEach(({ exemptedIds = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
    });
  }

  const transformRestriction = (restriction: TransferRestriction): TransferCondition =>
    transferRestrictionToPolymeshTransferCondition(restriction, context);

  occupiedSlots -= currentRestrictions.length;

  const transformExemptions = ([restriction, entityIds]: [TransferRestriction, string[]]): [
    TransferCondition,
    U8aFixed[]
  ] =>
    tuple(
      transferRestrictionToPolymeshTransferCondition(restriction, context),
      // we use `stringToScopeId` because both `ScopeId` and `IdentityId` are aliases for `U8aFixed`
      entityIds.map(entityId => stringToScopeId(entityId, context))
    );

  return {
    occupiedSlots: new BigNumber(occupiedSlots),
    currentExemptions: currentExemptions.map(transformExemptions),
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
