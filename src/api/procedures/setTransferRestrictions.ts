import { bool, StorageKey } from '@polkadot/types';
import {
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTransferComplianceTransferCondition,
  PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { entries, flatten, forEach } from 'lodash';

import { SetTransferRestrictionsParams } from '~/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase';
import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountRestrictionValue,
  ClaimCountTransferRestriction,
  ClaimCountTransferRestrictionInput,
  ClaimPercentageTransferRestriction,
  ClaimPercentageTransferRestrictionInput,
  ClaimType,
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  StatClaimType,
  TransferRestriction,
  TransferRestrictionType,
  TxTag,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  complianceConditionsToBtreeSet,
  identitiesToBtreeSet,
  identityIdToString,
  meshClaimTypeToClaimType,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  transferRestrictionTypeToStatOpType,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  asIdentity,
  assertStatIsSet,
  checkTxType,
  compareTransferRestrictionToInput,
  getAssetIdForStats,
  neededStatTypeForRestrictionInput,
  requestMulti,
} from '~/utils/internal';

/**
 * @hidden
 */
type ClaimKey = StatClaimType | 'None';
export type ExemptionRecords = Record<ClaimKey, Identity[]>;
export const newExemptionRecord = (): ExemptionRecords => ({
  Accredited: [],
  Affiliate: [],
  Jurisdiction: [],
  None: [],
});

/**
 * @hidden
 * @param toInsertId - Identity to insert into the exemption records
 * @param exemptionRecords - records that will be mutated if the Identity should be added
 * @param claimType - type of Claim the Identity is exempt from
 * @param filterSet - set of Identities that should not be added into exemption records if given
 */
export const addExemptionIfNotPresent = (
  toInsertId: Identity,
  exemptionRecords: ExemptionRecords,
  claimType: ClaimKey,
  filterSet: Identity[] = []
): void => {
  const found = filterSet.some(currentId => currentId.did === toInsertId.did);
  if (!found) {
    exemptionRecords[claimType].push(toInsertId);
  }
};

export interface Storage {
  currentExemptions: ExemptionRecords;
  filteredRestrictions: PolymeshPrimitivesTransferComplianceTransferCondition[];
  currentTypeRestrictions: PolymeshPrimitivesTransferComplianceTransferCondition[];
  occupiedSlots: BigNumber;
}

/**
 * @hidden
 * Checks if the input restrictions are valid
 */
function assertInputValid(
  inputRestrictions:
    | CountTransferRestrictionInput[]
    | PercentageTransferRestrictionInput[]
    | ClaimCountTransferRestrictionInput[]
    | ClaimPercentageTransferRestrictionInput[],
  type: TransferRestrictionType
): void {
  if (
    [TransferRestrictionType.Percentage, TransferRestrictionType.Count].includes(type) &&
    inputRestrictions.length > 1
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only one of provided Transfer Type Restriction can be set at a time',
      data: { type },
    });
  }

  if (type === TransferRestrictionType.ClaimCount) {
    const seenJurisdictions = new Set<string>();
    const seenClaimTypes = new Set<string>();

    inputRestrictions.forEach(restriction => {
      const { claim } = restriction as ClaimCountTransferRestrictionInput;

      if (claim.type === ClaimType.Jurisdiction) {
        // cannot add two claims with same country code restrictions will result in internal error
        if (seenJurisdictions.has(claim.countryCode || 'none')) {
          throw new PolymeshError({
            code: ErrorCode.ValidationError,
            message: 'Duplicate Jurisdiction CountryCode found in input',
            data: { countryCode: claim.countryCode },
          });
        }
        seenJurisdictions.add(claim.countryCode ?? 'none');
      } else {
        // cannot add two ClaimType.Accredited or ClaimType.Affiliate restrictions will result in internal error
        if (seenClaimTypes.has(claim.type)) {
          throw new PolymeshError({
            code: ErrorCode.ValidationError,
            message: 'Duplicate ClaimType found in input',
            data: { claimType: claim.type },
          });
        }
        seenClaimTypes.add(claim.type);
      }
    });
  }
}

/**
 * @hidden
 *
 * Calculates the smallest change needed to get to the requested state from the current state.
 * While clearing and building the restrictions would be simpler, it would be inefficient use of gas fees
 */
function transformInput(
  inputRestrictions:
    | CountTransferRestrictionInput[]
    | PercentageTransferRestrictionInput[]
    | ClaimCountTransferRestrictionInput[]
    | ClaimPercentageTransferRestrictionInput[],
  currentRestrictions: PolymeshPrimitivesTransferComplianceTransferCondition[],
  currentExemptions: ExemptionRecords,
  type: TransferRestrictionType,
  context: Context
): {
  conditions: PolymeshPrimitivesTransferComplianceTransferCondition[];
  toSetExemptions: ExemptionRecords;
  toRemoveExemptions: ExemptionRecords;
} {
  const toSetExemptions = newExemptionRecord();
  const toRemoveExemptions = newExemptionRecord();

  let needDifferentConditions = inputRestrictions.length !== currentRestrictions.length;
  const conditions: PolymeshPrimitivesTransferComplianceTransferCondition[] = [];
  const inputExemptions = newExemptionRecord();

  // for each restriction check if we need to make a condition and track all exemptions
  inputRestrictions.forEach(restriction => {
    let value: BigNumber | ClaimCountRestrictionValue | ClaimPercentageTransferRestriction;
    let claimType: StatClaimType | undefined;
    if ('count' in restriction) {
      value = restriction.count;
    } else if ('percentage' in restriction) {
      value = restriction.percentage;
    } else {
      value = restriction;
      claimType = restriction.claim.type;
    }

    const condition = { type, value } as TransferRestriction;

    const compareConditions = (
      transferCondition: PolymeshPrimitivesTransferComplianceTransferCondition
    ): boolean => compareTransferRestrictionToInput(transferCondition, condition);

    if (!needDifferentConditions) {
      needDifferentConditions = ![...currentRestrictions].find(compareConditions);
    }

    const rawCondition = transferRestrictionToPolymeshTransferCondition(condition, context);
    conditions.push(rawCondition);

    restriction.exemptedIdentities?.forEach(exemption => {
      const key = claimType || 'None';
      const id = asIdentity(exemption, context);
      addExemptionIfNotPresent(id, inputExemptions, key);
    });
  });

  // calculate exemptions to add — for each input exemption check if it already exists
  forEach(inputExemptions, (toAddIds, cType) => {
    const key = cType as ClaimKey;
    const currentIds = currentExemptions[key];
    toAddIds.forEach(id => {
      addExemptionIfNotPresent(id, toSetExemptions, key, currentIds);
    });
  });

  // calculate exemptions to remove — for each current exemption check if it was in the input
  forEach(currentExemptions, (currentIds, cType) => {
    const key = cType as ClaimKey;
    const given = inputExemptions[key];
    currentIds.forEach(id => {
      addExemptionIfNotPresent(id, toRemoveExemptions, key, given);
    });
  });

  const sizeOf = (obj: Record<string, unknown>): number =>
    flatten(entries(obj).map(([, identities]) => identities)).length;

  const needDifferentExemptions = sizeOf(toSetExemptions) > 0 || sizeOf(toRemoveExemptions) > 0;
  if (!needDifferentConditions && !needDifferentExemptions) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: inputRestrictions.length
        ? 'The restrictions and exemptions are already in place'
        : 'No restrictions to remove',
    });
  }

  return { conditions, toSetExemptions, toRemoveExemptions };
}

/**
 * @hidden
 */
export async function prepareSetTransferRestrictions(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  args: SetTransferRestrictionsParams
): Promise<BatchTransactionSpec<BigNumber, unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        consts,
      },
    },
    storage: { occupiedSlots, currentExemptions, filteredRestrictions, currentTypeRestrictions },
    context,
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
    restrictions,
    type,
    asset,
  } = args;
  const rawAssetId = getAssetIdForStats(asset, context);

  assertInputValid(restrictions, type);

  const { conditions, toSetExemptions, toRemoveExemptions } = transformInput(
    restrictions,
    currentTypeRestrictions,
    currentExemptions,
    type,
    context
  );

  const maxTransferConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);
  const finalCount = occupiedSlots.plus(newRestrictionAmount);

  if (finalCount.isGreaterThan(maxTransferConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Cannot set more Transfer Restrictions than there are slots available',
      data: {
        availableSlots: maxTransferConditions.minus(occupiedSlots),
      },
    });
  }

  const transactions = [];
  const op = transferRestrictionTypeToStatOpType(type, context);

  transactions.push(
    checkTxType({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transaction: statistics.setAssetTransferCompliance as any, // NOSONAR
      args: [
        rawAssetId, // if we do not add the current restrictions (filteredRestrictions), then they will be removed
        complianceConditionsToBtreeSet([...filteredRestrictions, ...conditions], context),
      ],
    })
  );

  const pushExemptions = (exemptions: ExemptionRecords, exempt: boolean): void => {
    forEach(exemptions, (exempted, claimType) => {
      if (exempted.length === 0) {
        return;
      }
      const rawClaimType = claimType === 'None' ? undefined : (claimType as ClaimType);
      const exemptKey = toExemptKey(context, rawAssetId, op, rawClaimType);
      const exemptedBtreeSet = identitiesToBtreeSet(exempted, context);
      const rawExempt = booleanToBool(exempt, context);

      transactions.push(
        checkTxType({
          transaction: statistics.setEntitiesExempt,
          feeMultiplier: new BigNumber(exemptedBtreeSet.size),
          args: [rawExempt, exemptKey, exemptedBtreeSet],
        })
      );
    });
  };

  pushExemptions(toSetExemptions, true);
  pushExemptions(toRemoveExemptions, false);

  return { transactions, resolver: finalCount };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  { asset, restrictions }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  const transactions: TxTag[] = [TxTags.statistics.SetAssetTransferCompliance];

  const needExemptionsPermission = restrictions.some(r => r.exemptedIdentities?.length);
  if (needExemptionsPermission) {
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
  const { asset, type } = args;

  const rawAssetId = getAssetIdForStats(asset, context);

  const [currentStats, { requirements: currentRestrictions }] = await requestMulti<
    [typeof statistics.activeAssetStats, typeof statistics.assetTransferCompliances]
  >(context, [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [statistics.activeAssetStats, rawAssetId as any], // NOSONAR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [statistics.assetTransferCompliances, rawAssetId as any], // NOSONAR
  ]);

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

  const filteredRestrictions = [...currentRestrictions].filter(requirement => {
    if (type === TransferRestrictionType.Count) {
      return !requirement.isMaxInvestorCount;
    } else if (type === TransferRestrictionType.Percentage) {
      return !requirement.isMaxInvestorOwnership;
    } else if (type === TransferRestrictionType.ClaimCount) {
      return !requirement.isClaimCount;
    } else {
      return !requirement.isClaimOwnership;
    }
  });
  const currentTypeRestrictions = [...currentRestrictions].filter(requirement => {
    if (type === TransferRestrictionType.Count) {
      return requirement.isMaxInvestorCount;
    } else if (type === TransferRestrictionType.Percentage) {
      return requirement.isMaxInvestorOwnership;
    } else if (type === TransferRestrictionType.ClaimCount) {
      return requirement.isClaimCount;
    } else {
      return requirement.isClaimOwnership;
    }
  });

  const op = transferRestrictionTypeToStatOpType(type, context);

  const claimTypes =
    type === TransferRestrictionType.Count || type === TransferRestrictionType.Percentage
      ? [undefined]
      : [ClaimType.Accredited, ClaimType.Affiliate, ClaimType.Jurisdiction];
  const exemptionFetchers: Promise<
    [
      StorageKey<
        [
          PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
          PolymeshPrimitivesIdentityId
        ]
      >,
      bool
    ][]
  >[] = [];

  claimTypes.forEach(claimType => {
    exemptionFetchers.push(
      statistics.transferConditionExemptEntities.entries(
        toExemptKey(context, rawAssetId, op, claimType)
      )
    );
  });
  const rawCurrentExemptions = flatten(await Promise.all(exemptionFetchers));
  const currentExemptions = newExemptionRecord();

  rawCurrentExemptions.forEach(
    ([
      {
        args: [{ claimType: rawClaimType }, rawDid],
      },
    ]) => {
      const did = identityIdToString(rawDid);
      let claimType: ClaimKey = 'None';
      if (rawClaimType.isSome) {
        claimType = meshClaimTypeToClaimType(rawClaimType.unwrap()) as ClaimKey;
      }
      const identity = new Identity({ did }, context);
      addExemptionIfNotPresent(identity, currentExemptions, claimType);
    }
  );

  return {
    occupiedSlots: new BigNumber(filteredRestrictions.length),
    currentTypeRestrictions,
    filteredRestrictions,
    currentExemptions,
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
