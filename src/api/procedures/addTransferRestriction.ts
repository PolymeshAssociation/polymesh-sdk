import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountTransferRestrictionInput,
  ClaimPercentageTransferRestrictionInput,
  ClaimRestrictionValue,
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  complianceConditionsToBtreeSet,
  scopeIdsToBtreeSetIdentityId,
  statisticsOpTypeToStatOpType,
  stringToIdentityId,
  stringToTickerKey,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
} from '~/utils/conversion';
import { checkTxType, getExemptedIds, neededStatTypeForRestrictionInput } from '~/utils/internal';

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: TransferRestrictionType.Count;
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: TransferRestrictionType.Percentage;
};

export type AddClaimCountTransferRestrictionParams = ClaimCountTransferRestrictionInput & {
  type: TransferRestrictionType.ClaimCount;
};

export type AddClaimPercentageTransferRestrictionParams =
  ClaimPercentageTransferRestrictionInput & {
    type: TransferRestrictionType.ClaimPercentage;
  };

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { ticker: string } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
  | AddClaimCountTransferRestrictionParams
  | AddClaimPercentageTransferRestrictionParams
);

export interface Storage {
  currentRestrictions: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
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
        consts,
      },
    },
    storage: { currentRestrictions },
    context,
  } = this;
  const { ticker, exemptedIdentities = [], type } = args;
  const tickerKey = stringToTickerKey(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const restrictionAmount = new BigNumber(currentRestrictions.size);
  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  const argsToClaimRestrictionValue = ({
    claim,
    issuer,
    min,
    max,
  }:
    | AddClaimCountTransferRestrictionParams
    | AddClaimPercentageTransferRestrictionParams): ClaimRestrictionValue => {
    return {
      claim,
      issuer,
      min,
      max,
    };
  };

  let value: BigNumber | ClaimRestrictionValue;
  let chainType: TransferRestrictionType;
  if (type === TransferRestrictionType.Count) {
    value = args.count;
    chainType = TransferRestrictionType.Count;
  } else if (type === TransferRestrictionType.Percentage) {
    value = args.percentage;
    chainType = TransferRestrictionType.Percentage;
  } else if (type === TransferRestrictionType.ClaimCount) {
    value = argsToClaimRestrictionValue(args);
    chainType = TransferRestrictionType.ClaimCount;
  } else {
    value = argsToClaimRestrictionValue(args);
    chainType = TransferRestrictionType.ClaimPercentage;
  }

  const rawTransferCondition = transferRestrictionToPolymeshTransferCondition(
    { type: chainType, value },
    context
  );

  if (currentRestrictions.has(rawTransferCondition)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Cannot add the same restriction more than once',
    });
  }
  const conditions = complianceConditionsToBtreeSet(
    [...currentRestrictions, rawTransferCondition],
    context
  );

  const transactions = [];
  transactions.push(
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [tickerKey, conditions],
    })
  );

  if (exemptedIdentities.length) {
    const op =
      type === TransferRestrictionType.Count
        ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
        : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);
    const exemptedIds = await getExemptedIds(exemptedIdentities, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
    const exemptKey = toExemptKey(tickerKey, op);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptedIds.length),
        args: [true, exemptKey, btreeIds],
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
  const transactions = [TxTags.statistics.SetAssetTransferCompliance];

  if (exemptedIdentities.length) {
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

  const tickerKey = stringToTickerKey(ticker, context);

  const [{ requirements: currentRestrictions }, currentStats] = await Promise.all([
    statistics.assetTransferCompliances(tickerKey),
    statistics.activeAssetStats(tickerKey),
  ]);

  const neededStat = neededStatTypeForRestrictionInput(type, context);
  const needStat = ![...currentStats].find(s => neededStat.eq(s));

  if (needStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The appropriate stat type for this restriction is not set for the Asset. Try calling enableStat in the namespace first',
    });
  }

  return {
    currentRestrictions,
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
