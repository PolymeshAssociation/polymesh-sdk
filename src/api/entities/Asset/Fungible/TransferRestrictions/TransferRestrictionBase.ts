import { PolymeshPrimitivesStatisticsStatType } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  addAssetStat,
  addTransferRestriction,
  AddTransferRestrictionParams,
  Context,
  FungibleAsset,
  Identity,
  Namespace,
  removeAssetStat,
  setTransferRestrictions,
  SetTransferRestrictionsStorage,
} from '~/internal';
import {
  ActiveStats,
  AddAssetStatParams,
  AddRestrictionParams,
  ClaimCountRestrictionValue,
  ClaimPercentageRestrictionValue,
  GetTransferRestrictionReturnType,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveAssetStatParams,
  RemoveBalanceStatParams,
  RemoveCountStatParams,
  RemoveScopedBalanceParams,
  RemoveScopedCountParams,
  SetAssetStatParams,
  SetClaimCountTransferRestrictionsParams,
  SetClaimPercentageTransferRestrictionsParams,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
  SetRestrictionsParams,
  StatType,
  TransferRestrictionType,
} from '~/types';
import {
  assetToMeshAssetId,
  identityIdToString,
  meshClaimTypeToClaimType,
  meshStatToStatType,
  stringToAssetId,
  transferConditionToTransferRestriction,
  transferRestrictionTypeToStatOpType,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

export type SetTransferRestrictionsParams = { asset: FungibleAsset } & (
  | SetCountTransferRestrictionsParams
  | SetPercentageTransferRestrictionsParams
  | SetClaimCountTransferRestrictionsParams
  | SetClaimPercentageTransferRestrictionsParams
);

export type RemoveAssetStatParamsBase<T> = Omit<
  T extends TransferRestrictionType.Count
    ? RemoveCountStatParams
    : T extends TransferRestrictionType.Percentage
    ? RemoveBalanceStatParams
    : T extends TransferRestrictionType.ClaimCount
    ? RemoveScopedCountParams
    : RemoveScopedBalanceParams,
  'type'
>;

const restrictionTypeToStatType = {
  [TransferRestrictionType.Count]: StatType.Count,
  [TransferRestrictionType.Percentage]: StatType.Balance,
  [TransferRestrictionType.ClaimCount]: StatType.ScopedCount,
  [TransferRestrictionType.ClaimPercentage]: StatType.ScopedBalance,
};

/**
 * Base class for managing Transfer Restrictions
 */
export abstract class TransferRestrictionBase<
  T extends TransferRestrictionType
> extends Namespace<FungibleAsset> {
  protected abstract type: T;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.addRestriction = createProcedureMethod<
      AddRestrictionParams<T>,
      AddTransferRestrictionParams,
      BigNumber
    >(
      {
        getProcedureAndArgs: args => [
          addTransferRestriction,
          { ...args, type: this.type, asset: parent } as unknown as AddTransferRestrictionParams,
        ],
      },
      context
    );

    this.setRestrictions = createProcedureMethod<
      SetRestrictionsParams<T>,
      SetTransferRestrictionsParams,
      BigNumber,
      SetTransferRestrictionsStorage
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictions,
          { ...args, type: this.type, asset: parent } as SetTransferRestrictionsParams,
        ],
      },
      context
    );

    this.removeRestrictions = createProcedureMethod<
      SetTransferRestrictionsParams,
      BigNumber,
      SetTransferRestrictionsStorage
    >(
      {
        getProcedureAndArgs: () => [
          setTransferRestrictions,
          {
            restrictions: [],
            type: this.type,
            asset: parent,
          } as SetTransferRestrictionsParams,
        ],
        voidArgs: true,
      },
      context
    );

    this.enableStat = createProcedureMethod<SetAssetStatParams<T>, AddAssetStatParams, void>(
      {
        getProcedureAndArgs: args => [
          addAssetStat,
          {
            ...args,
            type: restrictionTypeToStatType[this.type],
            asset: parent,
          } as AddAssetStatParams,
        ],
      },
      context
    );

    this.disableStat = createProcedureMethod<
      RemoveAssetStatParamsBase<T>,
      RemoveAssetStatParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          removeAssetStat,
          {
            ...args,
            type: restrictionTypeToStatType[this.type],
            asset: parent,
          } as RemoveAssetStatParams,
        ],
      },
      context
    );
  }

  /**
   * Add a Transfer Restriction of the corresponding type to this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction: ProcedureMethod<AddRestrictionParams<T>, BigNumber>;

  /**
   * Sets all Transfer Restrictions of the corresponding type on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public setRestrictions: ProcedureMethod<SetRestrictionsParams<T>, BigNumber>;

  /**
   * Removes all Transfer Restrictions of the corresponding type from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Enables statistic of the corresponding type for this Asset, which are required for restrictions to be created
   */
  public enableStat: ProcedureMethod<SetAssetStatParams<T>, void>;

  /**
   * Removes an Asset statistic
   *
   * @throws if the statistic is being used or is not set
   */
  public disableStat: ProcedureMethod<RemoveAssetStatParamsBase<T>, void>;

  /**
   * Retrieve all active Transfer Restrictions of the corresponding type
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public async get(): Promise<GetTransferRestrictionReturnType<T>> {
    const {
      parent,
      context: {
        polymeshApi: {
          query: { statistics },
          consts,
        },
      },
      context,
      type,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const { requirements } = await statistics.assetTransferCompliances(rawAssetId);

    const existingRequirementCount = [...requirements].length;

    const filteredRequirements = [...requirements].filter(requirement => {
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

    const rawAssetKey = { assetId: rawAssetId };
    const rawExemptedLists = await Promise.all(
      filteredRequirements.map(req => {
        const { value } = transferConditionToTransferRestriction(req, context);

        if (req.isClaimCount) {
          const { claim } = value as ClaimCountRestrictionValue;
          return statistics.transferConditionExemptEntities.entries({
            ...rawAssetKey,
            op: transferRestrictionTypeToStatOpType(TransferRestrictionType.ClaimCount, context),
            claimType: claim.type,
          });
        } else if (req.isClaimOwnership) {
          const { claim } = value as ClaimPercentageRestrictionValue;
          return statistics.transferConditionExemptEntities.entries({
            ...rawAssetKey,
            op: transferRestrictionTypeToStatOpType(
              TransferRestrictionType.ClaimPercentage,
              context
            ),
            claimType: claim.type,
          });
        } else {
          return statistics.transferConditionExemptEntities.entries({
            ...rawAssetKey,
            op: transferRestrictionTypeToStatOpType(type, context),
          });
        }
      })
    );

    const restrictions = rawExemptedLists.map((list, index) => {
      const exemptedIds = list.map(
        ([
          {
            args: [, scopeId],
          },
        ]) => identityIdToString(scopeId) // `ScopeId` and `PolymeshPrimitivesIdentityId` are the same type, so this is fine
      );
      const { value } = transferConditionToTransferRestriction(
        filteredRequirements[index],
        context
      );
      let restriction;

      if (type === TransferRestrictionType.Count) {
        restriction = {
          count: value,
        };
      } else if (type === TransferRestrictionType.Percentage) {
        restriction = {
          percentage: value,
        };
      } else {
        const { min, max, claim, issuer } = value as ClaimCountRestrictionValue;
        restriction = {
          min,
          max,
          claim,
          issuer,
        };
      }

      if (exemptedIds.length) {
        return {
          ...restriction,
          exemptedIds,
        };
      }
      return restriction;
    });

    const maxTransferConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

    return {
      restrictions,
      availableSlots: maxTransferConditions.minus(existingRequirementCount),
    } as GetTransferRestrictionReturnType<T>;
  }

  /**
   * Retrieve all active Transfer Restrictions of the corresponding type
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public async getStat(): Promise<ActiveStats> {
    const {
      parent,
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      type,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);
    const currentStats = await statistics.activeAssetStats(rawAssetId);

    let isSet = false;
    const claims: ActiveStats['claims'] = [];

    const pushClaims = (stat: PolymeshPrimitivesStatisticsStatType): void => {
      const [rawClaimType, rawIssuer] = stat.claimIssuer.unwrap();
      const claimType = meshClaimTypeToClaimType(rawClaimType);
      const issuer = new Identity({ did: identityIdToString(rawIssuer) }, context);

      if (typeof claimType === 'object') {
        claims.push({
          claimType: claimType.type,
          customClaimTypeId: claimType.customClaimTypeId,
          issuer,
        });
      } else {
        claims.push({ claimType, issuer });
      }
    };

    [...currentStats].forEach(stat => {
      const statType = meshStatToStatType(stat);

      if (type === TransferRestrictionType.ClaimCount && statType === StatType.ScopedCount) {
        isSet = true;
        pushClaims(stat);
      } else if (
        type === TransferRestrictionType.ClaimPercentage &&
        statType === StatType.ScopedBalance
      ) {
        isSet = true;
        pushClaims(stat);
      } else if (type === TransferRestrictionType.Percentage && statType === StatType.Balance) {
        isSet = true;
      } else if (type === TransferRestrictionType.Count && statType === StatType.Count) {
        isSet = true;
      }
    });

    return {
      isSet,
      ...(claims.length ? { claims } : {}),
    };
  }
}
