import { bool, BTreeSet, StorageKey, u128 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { setTransferRestrictionsExemptions } from '~/api/procedures/setTransferRestrictionExemptions';
import {
  Context,
  FungibleAsset,
  Identity,
  Namespace,
  SetAssetStatParams,
  setAssetStats,
  SetAssetStatsStorage,
  SetTransferExemptionsParams,
  SetTransferRestrictionParams,
  setTransferRestrictions,
  SetTransferRestrictionsStorage,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  AssetStat,
  ClaimType,
  CountryCode,
  JurisdictionValue,
  ProcedureMethod,
  SetTransferRestrictionStatParams,
  StatType,
  TransferRestrictionExemption,
  TransferRestrictionExemptionParams,
  TransferRestrictionParams,
  TransferRestrictionStatValues,
  TransferRestrictionType,
  TrustedFor,
} from '~/types';
import type { ExemptKey } from '~/types/internal';
import {
  assetComplianceToTransferRestrictions,
  assetIdToString,
  assetStatToStat,
  assetToMeshAssetId,
  exemptionToTransferExemption,
  getStat1stKey,
  getStat2ndKey,
  identityIdToString,
  meshClaimTypeToClaimType,
  meshStatToStatType,
  stringToAssetId,
  toExemptKey,
  transferRestrictionTypeToStatOpType,
  u128ToStatValue,
} from '~/utils/conversion';
import { createProcedureMethod, requestMulti } from '~/utils/internal';

/**
 * Handles all Transfer Restriction related functionality.
 */
export class TransferRestrictions extends Namespace<FungibleAsset> {
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.setRestrictions = createProcedureMethod<
      TransferRestrictionParams,
      SetTransferRestrictionParams,
      void,
      SetTransferRestrictionsStorage
    >(
      {
        getProcedureAndArgs: args => [setTransferRestrictions, { ...args, asset: parent }],
      },
      context
    );

    this.setStats = createProcedureMethod<
      SetTransferRestrictionStatParams,
      SetAssetStatParams,
      void,
      SetAssetStatsStorage
    >(
      {
        getProcedureAndArgs: args => [
          setAssetStats,
          {
            ...args,
            asset: parent,
          },
        ],
      },
      context
    );

    this.addExemptions = createProcedureMethod<
      TransferRestrictionExemptionParams,
      SetTransferExemptionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictionsExemptions,
          {
            ...args,
            asset: parent,
            isExempt: true,
          },
        ],
      },
      context
    );

    this.removeExemptions = createProcedureMethod<
      TransferRestrictionExemptionParams,
      SetTransferExemptionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictionsExemptions,
          {
            ...args,
            asset: parent,
            isExempt: false,
          },
        ],
      },
      context
    );
  }

  /**
   * Get all current restrictions for this asset.
   */
  public async getRestrictions(): Promise<ActiveTransferRestrictions> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const result = await statistics.assetTransferCompliances(rawAssetId);

    return assetComplianceToTransferRestrictions(result, context);
  }

  /**
   * Return active asset stats.
   */
  public async getStats(): Promise<AssetStat[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const rawStats = await statistics.activeAssetStats(rawAssetId);

    const stats = [...rawStats].map(stat => assetStatToStat(stat, context));

    return stats;
  }

  /**
   * @hidden
   */
  private assembleAssetMappings(
    activeStats: BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    rawAssetId: PolymeshPrimitivesAssetAssetId,
    context: Context
  ): {
    jurisdictionQueries: Promise<
      [
        StorageKey<
          [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
        >,
        u128
      ][]
    >[];
    jurisdictionMappings: {
      statType: StatType;
      issuer: Identity;
      claimType: TrustedFor;
    }[];
    nonJurisdictionQueries: [
      typeof statistics.assetStats,
      [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
    ][];
    nonJurisdictionMappings: {
      statType: StatType;
      issuer?: Identity;
      claimType?: TrustedFor;
    }[];
  } {
    const {
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
    } = this;
    const jurisdictionQueries: Promise<
      [
        StorageKey<
          [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
        >,
        u128
      ][]
    >[] = [];
    const jurisdictionMappings: {
      statType: StatType;
      issuer: Identity;
      claimType: TrustedFor;
    }[] = [];

    // Prepare non-jurisdiction queries using requestMulti
    const nonJurisdictionQueries: [
      typeof statistics.assetStats,
      [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
    ][] = [];

    const nonJurisdictionMappings: {
      statType: StatType;
      issuer?: Identity;
      claimType?: TrustedFor;
    }[] = [];

    for (const stat of activeStats) {
      const stat1stKey = getStat1stKey(rawAssetId, stat, context);
      const statType = meshStatToStatType(stat);

      if (stat.claimIssuer.isSome) {
        const [rawClaimClaimType, rawIssuer] = stat.claimIssuer.unwrap();
        const issuer = new Identity({ did: identityIdToString(rawIssuer) }, context);
        const claimType = meshClaimTypeToClaimType(rawClaimClaimType);
        const claimTypeForComparison = typeof claimType === 'object' ? claimType.type : claimType;

        if (claimTypeForComparison === ClaimType.Jurisdiction) {
          // Handle jurisdiction claims with entries query
          jurisdictionQueries.push(statistics.assetStats.entries(stat1stKey));
          jurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        } else if (
          claimTypeForComparison === ClaimType.Accredited ||
          claimTypeForComparison === ClaimType.Affiliate
        ) {
          // Handle Accredited and Affiliate claims with specific true/false queries only
          const trueStat2ndKey = getStat2ndKey(context, claimTypeForComparison, true);
          const falseStat2ndKey = getStat2ndKey(context, claimTypeForComparison, false);
          nonJurisdictionQueries.push(
            [statistics.assetStats, [stat1stKey, trueStat2ndKey]],
            [statistics.assetStats, [stat1stKey, falseStat2ndKey]]
          );
          nonJurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        } else {
          // Handle all other claim types (Custom, etc.) with NoClaimStat only
          const noClaimStat2ndKey = getStat2ndKey(context);
          nonJurisdictionQueries.push([statistics.assetStats, [stat1stKey, noClaimStat2ndKey]]);
          nonJurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        }
      } else {
        // Handle non-claim stats
        const noClaimStat2ndKey = getStat2ndKey(context);
        nonJurisdictionQueries.push([statistics.assetStats, [stat1stKey, noClaimStat2ndKey]]);
        nonJurisdictionMappings.push({
          statType,
        });
      }
    }

    return {
      jurisdictionQueries,
      jurisdictionMappings,
      nonJurisdictionQueries,
      nonJurisdictionMappings,
    };
  }

  /**
   * Process jurisdiction entries and extract jurisdiction values
   */
  private processJurisdictionEntries(
    entries:
      | [
          StorageKey<
            [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
          >,
          u128
        ][]
      | undefined,
    statType: StatType
  ): JurisdictionValue[] {
    const jurisdictionValues: JurisdictionValue[] = [];

    for (const [key, rawValue] of entries ?? []) {
      const secondKey = key.args[1];

      if (secondKey.isNoClaimStat) {
        // No jurisdiction claim
        jurisdictionValues.push({
          countryCode: null,
          value: u128ToStatValue(rawValue, statType),
        });
      } else if (secondKey.isClaim && secondKey.asClaim.isJurisdiction) {
        // Specific jurisdiction
        const countryCode = secondKey.asClaim.asJurisdiction.toString() as CountryCode;
        jurisdictionValues.push({
          countryCode,
          value: u128ToStatValue(rawValue, statType),
        });
      }
    }

    return jurisdictionValues;
  }

  /**
   * Process jurisdiction results and add them to the result array
   */
  private processJurisdictionResults(
    jurisdictionResults: [
      StorageKey<[PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]>,
      u128
    ][][],
    jurisdictionMappings: {
      statType: StatType;
      issuer: Identity;
      claimType: TrustedFor;
    }[],
    result: TransferRestrictionStatValues[]
  ): void {
    for (let index = 0; index < jurisdictionMappings.length; index++) {
      const mapping = jurisdictionMappings[index]!;
      const entries = jurisdictionResults[index];
      const { statType, issuer, claimType } = mapping;

      const jurisdictionValues = this.processJurisdictionEntries(entries, statType);
      const totalValue = jurisdictionValues.reduce(
        (sum, jv) => sum.plus(jv.value),
        new BigNumber(0)
      );

      result.push({
        type: statType,
        value: totalValue,
        claim: {
          issuer,
          claimType,
          value: jurisdictionValues,
        },
      });
    }
  }

  /**
   * Get claim type for comparison
   */
  private getClaimTypeForComparison(claimType: TrustedFor): ClaimType {
    return typeof claimType === 'object' ? claimType.type : claimType;
  }

  /**
   * Process accredited/affiliate claim types
   */
  private processAccreditedAffiliateClaim(
    statType: StatType,
    issuer: Identity,
    claimType: TrustedFor,
    nonJurisdictionResults: u128[],
    resultIndex: number
  ): { result: TransferRestrictionStatValues; newIndex: number } {
    const withClaimValue = u128ToStatValue(nonJurisdictionResults[resultIndex]!, statType);
    const withoutClaimValue = u128ToStatValue(nonJurisdictionResults[resultIndex + 1]!, statType);
    const totalValue = withClaimValue.plus(withoutClaimValue);

    return {
      result: {
        type: statType,
        value: totalValue,
        claim: {
          issuer,
          claimType,
          value: { withClaim: withClaimValue, withoutClaim: withoutClaimValue },
        },
      },
      newIndex: resultIndex + 2,
    };
  }

  /**
   * Process custom claim types
   */
  private processCustomClaim(
    statType: StatType,
    issuer: Identity,
    claimType: TrustedFor,
    nonJurisdictionResults: u128[],
    resultIndex: number
  ): { result: TransferRestrictionStatValues; newIndex: number } {
    return {
      result: {
        claim: {
          issuer,
          claimType,
        },
        type: statType,
        value: u128ToStatValue(nonJurisdictionResults[resultIndex]!, statType),
      },
      newIndex: resultIndex + 1,
    };
  }

  /**
   * Process non-jurisdiction results and add them to the result array
   */
  private processNonJurisdictionResults(
    nonJurisdictionMappings: {
      statType: StatType;
      issuer?: Identity;
      claimType?: TrustedFor;
    }[],
    nonJurisdictionResults: u128[],
    result: TransferRestrictionStatValues[]
  ): void {
    let resultIndex = 0;

    for (const mapping of nonJurisdictionMappings) {
      const { statType, issuer, claimType } = mapping;

      if (claimType && issuer) {
        const claimTypeForComparison = this.getClaimTypeForComparison(claimType);

        if (
          claimTypeForComparison === ClaimType.Accredited ||
          claimTypeForComparison === ClaimType.Affiliate
        ) {
          const { result: claimResult, newIndex } = this.processAccreditedAffiliateClaim(
            statType,
            issuer,
            claimType,
            nonJurisdictionResults,
            resultIndex
          );
          result.push(claimResult);
          resultIndex = newIndex;
        } else {
          const { result: claimResult, newIndex } = this.processCustomClaim(
            statType,
            issuer,
            claimType,
            nonJurisdictionResults,
            resultIndex
          );
          result.push(claimResult);
          resultIndex = newIndex;
        }
      } else {
        result.push({
          type: statType,
          value: u128ToStatValue(nonJurisdictionResults[resultIndex]!, statType),
        });
        resultIndex++;
      }
    }
  }

  /**
   * Get the values of all active transfer restrictions for this Asset
   * @returns an array of objects containing the values of all active transfer restrictions for this Asset
   */
  public async getValues(): Promise<TransferRestrictionStatValues[]> {
    const {
      parent,
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);
    const activeStats = await statistics.activeAssetStats(rawAssetId);

    if (activeStats.isEmpty) {
      return [];
    }

    const result: TransferRestrictionStatValues[] = [];

    const {
      jurisdictionQueries,
      jurisdictionMappings,
      nonJurisdictionQueries,
      nonJurisdictionMappings,
    } = this.assembleAssetMappings(activeStats, rawAssetId, context);

    const [jurisdictionResults, nonJurisdictionResults] = await Promise.all([
      Promise.all(jurisdictionQueries),
      nonJurisdictionQueries.length > 0 ? requestMulti(context, nonJurisdictionQueries) : [],
    ]);

    this.processJurisdictionResults(jurisdictionResults, jurisdictionMappings, result);
    this.processNonJurisdictionResults(nonJurisdictionMappings, nonJurisdictionResults, result);

    return result;
  }

  /**
   * @hidden
   * Stringify claimType for deduplication key generation
   */
  private stringifyClaimType(claimType: TrustedFor | null): string {
    if (claimType === null) {
      return 'null';
    }
    if (typeof claimType === 'object') {
      return JSON.stringify(claimType);
    }
    return String(claimType);
  }

  /**
   * @hidden
   * Build exempt keys map from active restrictions
   */
  private buildExemptKeysFromRestrictions(
    restrictions: ActiveTransferRestrictions,
    rawAssetId: PolymeshPrimitivesAssetAssetId,
    context: Context
  ): Map<
    string,
    { rawExemptKey: ExemptKey; statOpType: StatType; claimType?: ClaimType | undefined }
  > {
    const exemptKeysToQuery = new Map<
      string,
      { rawExemptKey: ExemptKey; statOpType: StatType; claimType?: ClaimType | undefined }
    >();

    for (const restriction of restrictions.restrictions) {
      const rawOpType = transferRestrictionTypeToStatOpType(restriction.type, context);
      const statOpType =
        restriction.type === TransferRestrictionType.Count ||
        restriction.type === TransferRestrictionType.ClaimCount
          ? StatType.Count
          : StatType.Balance;
      let claimType: ClaimType | undefined;

      if (
        restriction.type === TransferRestrictionType.ClaimCount ||
        restriction.type === TransferRestrictionType.ClaimPercentage
      ) {
        claimType = restriction.value.claim.type;
      }

      const rawExemptKey = toExemptKey(rawAssetId, rawOpType, claimType);
      const assetIdString = assetIdToString(rawAssetId);
      const keyString = JSON.stringify({
        assetId: assetIdString,
        op: statOpType,
        claimType: claimType?.toString() || null,
      });

      if (!exemptKeysToQuery.has(keyString)) {
        exemptKeysToQuery.set(keyString, { rawExemptKey, statOpType, claimType });
      }
    }

    return exemptKeysToQuery;
  }

  /**
   * @hidden
   * Process exemptions from storage and add to results if not already seen
   */
  private processExemptionsFromStorage(
    rawExemptions: [
      StorageKey<
        [
          PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
          PolymeshPrimitivesIdentityId
        ]
      >,
      bool
    ][],
    seenExemptions: Set<string>,
    allExemptions: TransferRestrictionExemption[],
    context: Context
  ): void {
    for (const [exemption] of rawExemptions) {
      const [rawExemptKeyFromStorage, rawIdentity] = exemption.args;
      const exemptKeyResult = exemptionToTransferExemption(rawExemptKeyFromStorage);
      const did = identityIdToString(rawIdentity);

      const claimTypeString = this.stringifyClaimType(exemptKeyResult.claimType);
      const exemptionKey = `${did}-${exemptKeyResult.assetId}-${exemptKeyResult.opType}-${claimTypeString}`;

      if (!seenExemptions.has(exemptionKey)) {
        seenExemptions.add(exemptionKey);
        allExemptions.push({
          exemptKey: exemptKeyResult,
          identity: new Identity({ did }, context),
        });
      }
    }
  }

  /**
   * Return identities with exemptions.
   */
  public async getExemptions(): Promise<TransferRestrictionExemption[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const restrictions = await this.getRestrictions();
    const exemptKeysToQuery = this.buildExemptKeysFromRestrictions(
      restrictions,
      rawAssetId,
      context
    );

    if (exemptKeysToQuery.size === 0) {
      return [];
    }

    const allExemptions: TransferRestrictionExemption[] = [];
    const seenExemptions = new Set<string>();

    for (const { rawExemptKey } of exemptKeysToQuery.values()) {
      const rawExemptions = await statistics.transferConditionExemptEntities.entries(rawExemptKey);
      this.processExemptionsFromStorage(rawExemptions, seenExemptions, allExemptions, context);
    }

    return allExemptions;
  }

  /**
   * Set all Transfer Restrictions on this Asset.
   *
   * Transfer Restrictions control ownership requirements based on investor statistics.
   * For example, TransferRestrictionType.Count can limit the number of investors.
   * TransferRestrictionType.Percentage can limit the maximum percentage an individual investor may hold.
   *
   * @note The relevant stat must be enabled by including it in setStats before the restriction can be created.
   */
  public setRestrictions: ProcedureMethod<TransferRestrictionParams, void>;

  /**
   * Set the enabled statistics for an Asset.
   *
   * Transfer Restrictions require the relevant stat to be enabled before they can be set.
   * Calling this method will override the currently enabled stats with the provided set,
   * which means it can also be used to remove previously enabled stats.
   *
   * @note If you attempt to remove a stat that is currently required by an active transfer restriction,
   * the chain will throw an error.
   *
   * @note Count-based stats must be given an initial value. The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
   * As such, the initial value for the stat should be passed in, which can be fetched with {@link api/entities/Asset/Fungible!FungibleAsset.investorCount | FungibleAsset.investorCount }.
   */
  public setStats: ProcedureMethod<SetTransferRestrictionStatParams, void>;

  /**
   * Exempt identities from Transfer Restrictions. These identities will not be subject to Transfer Restriction rules.
   */
  public addExemptions: ProcedureMethod<TransferRestrictionExemptionParams, void>;

  /**
   * Remove identities from Transfer Restriction exemptions.
   *
   * The given identities will no longer be exempt from Transfer Restrictions.
   */
  public removeExemptions: ProcedureMethod<TransferRestrictionExemptionParams, void>;
}
