import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  AddClaimCountTransferRestrictionParams,
  AddClaimPercentageTransferRestrictionParams,
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  ErrorCode,
  TransferRestriction,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  complianceConditionsToBtreeSet,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  transferRestrictionTypeToStatOpType,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  assertStatIsSet,
  checkTxType,
  getAssetIdForStats,
  getExemptedBtreeSet,
  neededStatTypeForRestrictionInput,
  requestMulti,
} from '~/utils/internal';

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { asset: FungibleAsset } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
  | AddClaimCountTransferRestrictionParams
  | AddClaimPercentageTransferRestrictionParams
);

/**
 * @hidden
 */
export async function prepareAddTransferRestriction(
  this: Procedure<AddTransferRestrictionParams, BigNumber>,
  args: AddTransferRestrictionParams
): Promise<BatchTransactionSpec<BigNumber, unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        query: { statistics: statisticsQuery },
        consts,
      },
    },
    context,
  } = this;
  const { asset, exemptedIdentities = [], type } = args;
  const rawAssetId = getAssetIdForStats(asset, context);

  let claimIssuer;
  if (
    type === TransferRestrictionType.ClaimCount ||
    type === TransferRestrictionType.ClaimPercentage
  ) {
    const {
      claim: { type: cType },
      issuer,
    } = args;
    claimIssuer = { claimType: cType, issuer };
  }

  const [currentStats, { requirements: currentRestrictions }] = await requestMulti<
    [typeof statisticsQuery.activeAssetStats, typeof statisticsQuery.assetTransferCompliances]
  >(context, [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [statisticsQuery.activeAssetStats, rawAssetId as any], // NOSONAR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [statisticsQuery.assetTransferCompliances, rawAssetId as any], // NOSONAR
  ]);

  const neededStat = neededStatTypeForRestrictionInput({ type, claimIssuer }, context);
  assertStatIsSet(currentStats, neededStat);
  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const restrictionAmount = new BigNumber(currentRestrictions.size);

  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let restriction: TransferRestriction;
  let claimType;

  if (type === TransferRestrictionType.Count) {
    const value = args.count;
    restriction = { type, value };
  } else if (type === TransferRestrictionType.Percentage) {
    const value = args.percentage;
    restriction = { type, value };
  } else if (type === TransferRestrictionType.ClaimCount) {
    const { min, max: maybeMax, issuer, claim } = args;
    restriction = { type, value: { min, max: maybeMax, issuer, claim } };
    claimType = claim.type;
  } else {
    const { min, max, issuer, claim } = args;
    restriction = { type, value: { min, max, issuer, claim } };
    claimType = claim.type;
  }

  const rawTransferCondition = transferRestrictionToPolymeshTransferCondition(restriction, context);
  const hasRestriction = !![...currentRestrictions].find(r => r.eq(rawTransferCondition));

  if (hasRestriction) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: [rawAssetId as any, conditions], // NOSONAR
    })
  );

  if (exemptedIdentities.length) {
    const op = transferRestrictionTypeToStatOpType(type, context);
    const exemptedIdBtreeSet = await getExemptedBtreeSet(exemptedIdentities, context);
    const exemptKey = toExemptKey(context, rawAssetId, op, claimType);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptedIdBtreeSet.size),
        args: [true, exemptKey, exemptedIdBtreeSet],
      })
    );
  }

  return { transactions, resolver: restrictionAmount.plus(1) };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, BigNumber>,
  { asset, exemptedIdentities = [] }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetAssetTransferCompliance];

  if (exemptedIdentities.length) {
    transactions.push(TxTags.statistics.SetEntitiesExempt);
  }

  return {
    permissions: {
      assets: [asset],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addTransferRestriction = (): Procedure<AddTransferRestrictionParams, BigNumber> =>
  new Procedure(prepareAddTransferRestriction, getAuthorization);
