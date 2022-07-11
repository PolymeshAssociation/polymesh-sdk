import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { TransferCondition } from 'polymesh-types/types';

import { SetTransferRestrictionsParams } from '~/api/entities/Asset/TransferRestrictions/TransferRestrictionBase';
import { Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountRestrictionValue,
  ClaimCountTransferRestriction,
  ClaimCountTransferRestrictionInput,
  ClaimPercentageTransferRestriction,
  ClaimPercentageTransferRestrictionInput,
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
  stringToIdentityId,
  stringToTickerKey,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  assertStatIsSet,
  checkTxType,
  compareTransferRestrictionToInput,
  getExemptedIds,
  neededStatTypeForRestrictionInput,
} from '~/utils/internal';

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
    | ClaimPercentageTransferRestrictionInput[],
  currentRestrictions: TransferCondition[],
  type: TransferRestrictionType,
  context: Context
): [PolymeshPrimitivesTransferComplianceTransferCondition[], (string | Identity)[]] {
  const exemptions: (string | Identity)[] = [];

  let someDifference = restrictions.length !== currentRestrictions.length;
  const conditions: PolymeshPrimitivesTransferComplianceTransferCondition[] = [];
  restrictions.forEach(r => {
    let value: BigNumber | ClaimCountRestrictionValue;
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
    const condition = { type, value } as TransferRestriction;
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

  args.restrictions.forEach(restriction => {
    let claimIssuer;
    if (
      type === TransferRestrictionType.ClaimCount ||
      type === TransferRestrictionType.ClaimPercentage
    ) {
      const {
        claim: { type: claimType },
        issuer,
      } = restriction as ClaimCountTransferRestriction | ClaimPercentageTransferRestriction;
      claimIssuer = { claimType, issuer };
    }
    const neededStat = neededStatTypeForRestrictionInput({ type, claimIssuer }, context);
    assertStatIsSet(currentStats, neededStat);
  });

  const {
    transferRestrictions: { count, percentage, claimCount, claimPercentage },
  } = new Asset({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
    { restrictions: currentClaimCountRestrictions },
    { restrictions: currentClaimPercentageRestrictions },
  ] = await Promise.all([count.get(), percentage.get(), claimCount.get(), claimPercentage.get()]);

  const currentRestrictions: TransferRestriction[] = [];

  let occupiedSlots =
    currentCountRestrictions.length +
    currentPercentageRestrictions.length +
    currentClaimCountRestrictions.length +
    currentClaimPercentageRestrictions.length;
  if (type === TransferRestrictionType.Count) {
    occupiedSlots -= currentCountRestrictions.length;
  } else if (type === TransferRestrictionType.Percentage) {
    occupiedSlots -= currentPercentageRestrictions.length;
  } else if (type === TransferRestrictionType.ClaimCount) {
    occupiedSlots -= currentClaimCountRestrictions.length;
  } else {
    occupiedSlots -= currentClaimPercentageRestrictions.length;
  }

  if (type === TransferRestrictionType.Count) {
    currentCountRestrictions.forEach(({ count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value } as const;
      currentRestrictions.push(restriction);
    });
  } else if (type === TransferRestrictionType.Percentage) {
    currentPercentageRestrictions.forEach(({ percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value } as const;
      currentRestrictions.push(restriction);
    });
  } else if (type === TransferRestrictionType.ClaimCount) {
    currentClaimCountRestrictions.forEach(({ claim, min, max, issuer }) => {
      const restriction = { type, value: { claim, min, max, issuer } };
      currentRestrictions.push(restriction);
    });
  } else {
    currentClaimPercentageRestrictions.forEach(({ claim, min, max, issuer }) => {
      const restriction = { type, value: { claim, min, max, issuer } };
      currentRestrictions.push(restriction);
    });
  }

  const transformRestriction = (
    restriction: TransferRestriction
  ): PolymeshPrimitivesTransferComplianceTransferCondition => {
    return transferRestrictionToPolymeshTransferCondition(restriction, context);
  };
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
