import {
  BTreeSetStatType,
  BTreeSetStatUpdate,
  BTreeSetTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { StatisticsOpType } from '~/api/entities/Asset/TransferRestrictions/types';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { TransferCondition } from '~/polkadot/types';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
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
import { checkTxType, getExemptedIds } from '~/utils/internal';

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: 'Count';
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: 'Percentage';
};

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { ticker: string } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
);

export interface Storage {
  currentRestrictions: TransferCondition[];
  currentStats: BTreeSetStatType;
  needStat: boolean;
}

/**
 * @hidden
 */
export async function prepareAddTransferRestriction(
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  args: AddTransferRestrictionParams
): Promise<BigNumber> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        query,
        consts,
      },
    },
    storage: { needStat, currentStats, currentRestrictions },
    context,
  } = this;
  const { ticker, exemptedIdentities = [], type } = args;
  const rawTicker = stringToTicker(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const restrictionAmount = new BigNumber(currentRestrictions.length);
  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let value: BigNumber;
  let chainType: TransferRestrictionType;
  if (type === TransferRestrictionType.Count) {
    value = args.count;
    chainType = TransferRestrictionType.Count;
  } else {
    value = args.percentage;
    chainType = TransferRestrictionType.Percentage;
  }

  const exists = !!currentRestrictions.find(transferRestriction => {
    if (transferRestriction.isMaxInvestorCount && type === 'Count') {
      const currentCount = u64ToBigNumber(transferRestriction.asMaxInvestorCount);
      return currentCount.eq(value);
    } else if (transferRestriction.isMaxInvestorOwnership && type === 'Percentage') {
      const currentOwnership = permillToBigNumber(transferRestriction.asMaxInvestorOwnership);
      return currentOwnership.eq(value);
    }
    return false;
  });

  if (exists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Cannot add the same restriction more than once',
    });
  }

  const rawTransferCondition = transferRestrictionToPolymeshTransferCondition(
    { type: chainType, value },
    context
  );

  // BTreeSets need to be sorted
  const conditions = [...currentRestrictions, rawTransferCondition].sort();

  const transactions = [];

  const op =
    type === TransferRestrictionType.Count
      ? primitiveOpType(StatisticsOpType.Count, context)
      : primitiveOpType(StatisticsOpType.Balance, context);

  if (needStat) {
    const newStat = primitiveStatisticsStatType(op, context);
    currentStats.push(newStat);
    currentStats.sort().reverse(); // sort needed as it is a BTreeSet
    transactions.push(
      checkTxType({
        transaction: statistics.setActiveAssetStats,
        args: [{ Ticker: rawTicker }, currentStats],
      })
    );

    // If the stat restriction is a Count the actual value needs to be set. This is due to the potentially slow transaction of counting all holders for the chain
    if (type === TransferRestrictionType.Count) {
      // if an asset has many investors this could be slow and instead should be fetched from SubQuery
      // These should happen near the assets inception, so for now query the chain directly
      const holders = await query.asset.balanceOf.entries(rawTicker);
      const holderCount = new BigNumber(holders.length);
      const secondKey = primitive2ndKey(context);
      const statValue = [
        statUpdate(secondKey, bigNumberToU128(holderCount, context), context),
      ] as BTreeSetStatUpdate;

      transactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [{ Ticker: rawTicker }, newStat, statValue],
        })
      );
    }
  }

  if (exemptedIdentities.length) {
    const exemptedIds = await getExemptedIds(exemptedIdentities, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptedIds.length),
        args: [true, { asset: { Ticker: rawTicker }, op }, btreeIds],
      })
    );
  }
  transactions.push(
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [{ Ticker: rawTicker }, conditions as BTreeSetTransferCondition],
    })
  );

  this.addBatchTransaction({ transactions });
  return restrictionAmount.plus(1);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  { ticker, exemptedIdentities = [] }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const {
    storage: { needStat },
  } = this;

  const transactions = [TxTags.statistics.SetAssetTransferCompliance];

  if (exemptedIdentities.length) {
    transactions.push(TxTags.statistics.SetEntitiesExempt);
  }

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
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  args: AddTransferRestrictionParams
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

  const [{ requirements: currentRestrictions }, currentStats] = await Promise.all([
    statistics.assetTransferCompliances({ Ticker: rawTicker }),
    statistics.activeAssetStats({ Ticker: rawTicker }),
  ]);

  const needStat = !currentStats.find(s => {
    const stat = meshStatToStat(s);
    const cmpStat = stat.type === 'Balance' ? 'Percentage' : 'Count';
    return cmpStat === type;
  });

  return {
    currentRestrictions,
    needStat,
    currentStats,
  };
}

/**
 * @hidden
 */
export const addTransferRestriction = (): Procedure<
  AddTransferRestrictionParams,
  BigNumber,
  Storage
> => new Procedure(prepareAddTransferRestriction, getAuthorization, prepareStorage);
