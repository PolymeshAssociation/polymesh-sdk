import { BTreeSetStatType } from '@polkadot/types/lookup';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { AddCountStatInput, ClaimType, ErrorCode, Identity, StatType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  bigNumberToU128,
  claimIssuerToMeshClaimIssuer,
  createStat2ndKey,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  statUpdate,
  statUpdatesToBtreeStatUpdate,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, compareStatsToInput } from '~/utils/internal';

export type AddStatParamsBase = {
  claimIssuer?: {
    claimType: ClaimType;
    issuer: Identity;
  };
};

export type AddCountStatParams = AddCountStatInput &
  AddStatParamsBase & {
    type: StatType.Count;
  };

export type AddBalanceStatParams = AddStatParamsBase & {
  type: StatType.Balance;
};

export type AddAssetStatParams = { ticker: string } & (AddCountStatParams | AddBalanceStatParams);

export interface Storage {
  currentStats: BTreeSetStatType;
}

/**
 * @hidden
 */
export async function prepareAddAssetStat(
  this: Procedure<AddAssetStatParams, void, Storage>,
  args: AddAssetStatParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
      },
    },
    storage: { currentStats },
    context,
  } = this;
  const { ticker, type, claimIssuer } = args;

  const tickerKey = stringToTickerKey(ticker, context);

  const op =
    type === StatType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const transactions = [];

  const rawClaimIssuer = claimIssuer
    ? claimIssuerToMeshClaimIssuer(claimIssuer, context)
    : undefined;
  // need to pass claim issuer as well
  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  currentStats.push(newStat);
  currentStats.sort().reverse();

  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, currentStats],
    })
  );

  // Count stats need the user to provide the initial value for the counter
  // if (args.type === StatType.Count) {
  //   const holderCount = args.count;
  //   const secondKey = createStat2ndKey(context); // this wont work for something like claimIssuer or accredited
  //   const stat = statUpdate(secondKey, bigNumberToU128(holderCount, context), context);
  //   const statValue = statUpdatesToBtreeStatUpdate([stat], context);
  //   transactions.push(
  //     checkTxType({
  //       transaction: statistics.batchUpdateAssetStats,
  //       args: [tickerKey, newStat, statValue],
  //     })
  //   );
  // }

  this.addBatchTransaction({ transactions });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddAssetStatParams, void, Storage>,
  { type, ticker }: AddAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
  if (type === StatType.Count) {
    transactions.push(TxTags.statistics.BatchUpdateAssetStats);
  }
  const asset = new Asset({ ticker }, this.context);
  return {
    permissions: {
      transactions,
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<AddAssetStatParams, void, Storage>,
  args: AddAssetStatParams
): Promise<Storage> {
  const {
    context,
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
  } = this;
  const { ticker } = args;

  const tickerKey = stringToTickerKey(ticker, context);
  const currentStats = await statistics.activeAssetStats(tickerKey);
  const needStat = !currentStats.find(s => compareStatsToInput(s, args));

  if (!needStat) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });
  }

  return {
    currentStats,
  };
}

/**
 * @hidden
 */
export const addAssetStat = (): Procedure<AddAssetStatParams, void, Storage> =>
  new Procedure(prepareAddAssetStat, getAuthorization, prepareStorage);
