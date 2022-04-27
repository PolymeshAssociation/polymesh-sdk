import { U8aFixed } from '@polkadot/types';
import {
  BTreeSetStatType,
  BTreeSetStatUpdate,
  BTreeSetTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { StatisticsType } from '~/api/entities/Asset/TransferRestrictions/types';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { TransferCondition } from '~/polkadot/types';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestriction,
  TransferRestrictionType,
  TxTags,
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
  scopeIdsToBtreeSetIdentityId,
  statUpdate,
  stringToIdentityId,
  stringToScopeId,
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
  currentExemptions: [TransferCondition, U8aFixed[]][];
  needStat: boolean;
  currentStats: BTreeSetStatType;
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
    storage: { needStat, currentStats },
    context,
  } = this;
  const { ticker, exemptedIdentities = [], type } = args;
  const rawTicker = stringToTicker(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const { requirements: currentTransferRestrictions } =
    await query.statistics.assetTransferCompliances({ Ticker: rawTicker });
  const restrictionAmount = new BigNumber(currentTransferRestrictions.length);

  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let value: BigNumber;
  let inputType: TransferRestrictionType;

  if (type === 'Count') {
    value = args.count;
    inputType = TransferRestrictionType.Count;
  } else if (type === 'Percentage') {
    value = args.percentage;
    inputType = TransferRestrictionType.Percentage;
  } else {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Unknown type: ${type}`,
    });
  }

  const exists = !!currentTransferRestrictions.find(transferRestriction => {
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
    { type: inputType, value },
    context
  );

  const newTransferConditions = [...currentTransferRestrictions, rawTransferCondition];

  const transactions = [
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [{ Ticker: rawTicker }, newTransferConditions as BTreeSetTransferCondition],
    }),
  ];

  if (needStat) {
    const op =
      type === TransferRestrictionType.Count
        ? primitiveOpType(StatisticsType.Count, context)
        : primitiveOpType(StatisticsType.Balance, context);
    const newStat = opToStatType(op, context);
    currentStats.push(newStat);

    // it seems to error if the stats transaction is in the same block as the rest

    // transactions.unshift(
    //   checkTxType({
    //     transaction: statistics.setActiveAssetStats,
    //     args: [{ Ticker: rawTicker }, currentStats],
    //   })
    // );

    this.addTransaction({
      transaction: statistics.setActiveAssetStats,
      args: [{ Ticker: rawTicker }, currentStats],
    });

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

      // transactions.unshift(
      //   checkTxType({
      //     transaction: statistics.batchUpdateAssetStats,
      //     args: [{ Ticker: rawTicker }, newStat, statValue],
      //   })
      // );

      this.addTransaction({
        transaction: statistics.batchUpdateAssetStats,
        args: [{ Ticker: rawTicker }, newStat, statValue],
      });
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
        args: [true, { asset: { Ticker: rawTicker } }, btreeIds],
      })
    );
  }

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
  const currentStats = await statistics.activeAssetStats({ Ticker: rawTicker });
  const needStat =
    !currentStats.find(s => meshStatToStat(s).type === 'Count') &&
    type === TransferRestrictionType.Count;

  const currentRestrictions: TransferRestriction[] = [];
  const currentExemptions: [TransferRestriction, string[]][] = [];

  /*
   * we're using `defusePromise` here because we KNOW the exempted ID promises are being
   * awaited later and errors WILL be caught
   */

  const transformRestriction = (restriction: TransferRestriction): TransferCondition =>
    transferRestrictionToPolymeshTransferCondition(restriction, context);

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
    currentExemptions: currentExemptions.map(transformExemptions),
    currentRestrictions: currentRestrictions.map(transformRestriction),
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
