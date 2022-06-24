import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  AddAssetStatParams,
  AddBalanceStatParams,
  AddClaimCountStatParams,
  AddClaimOwnershipStatParams,
  AddCountStatParams,
} from '~/api/procedures/addAssetStat';
import {
  AddClaimCountTransferRestrictionParams,
  AddClaimOwnershipTransferRestrictionParams,
} from '~/api/procedures/addTransferRestriction';
import { removeAssetStat, RemoveAssetStatParams } from '~/api/procedures/removeAssetStat';
import {
  SetClaimCountTransferRestrictionsParams,
  SetClaimOwnershipTransferRestrictionsParams,
} from '~/api/procedures/setTransferRestrictions';
import {
  addAssetStat,
  AddAssetStatStorage,
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  addTransferRestriction,
  AddTransferRestrictionParams,
  AddTransferRestrictionStorage,
  Asset,
  Context,
  Namespace,
  RemoveAssetStatStorage,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
  setTransferRestrictions,
  SetTransferRestrictionsParams,
  SetTransferRestrictionsStorage,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  ClaimCountTransferRestriction,
  ClaimOwnershipTransferRestriction,
  ClaimRestrictionValue,
  CountTransferRestriction,
  NoArgsProcedureMethod,
  PercentageTransferRestriction,
  ProcedureMethod,
  StatType,
  TransferRestrictionType,
} from '~/types';
import {
  scopeIdToString,
  stringToTickerKey,
  transferConditionToTransferRestriction,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

type AddRestrictionParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? AddCountTransferRestrictionParams
    : T extends TransferRestrictionType.Percentage
    ? AddPercentageTransferRestrictionParams
    : T extends TransferRestrictionType.ClaimCount
    ? AddClaimCountTransferRestrictionParams
    : AddClaimOwnershipTransferRestrictionParams,
  'type'
>;

type SetRestrictionsParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? SetCountTransferRestrictionsParams
    : T extends TransferRestrictionType.Percentage
    ? SetPercentageTransferRestrictionsParams
    : T extends TransferRestrictionType.ClaimCount
    ? SetClaimCountTransferRestrictionsParams
    : SetClaimOwnershipTransferRestrictionsParams,
  'type'
>;

type SetAssetStatParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? AddCountStatParams
    : T extends TransferRestrictionType.Percentage
    ? AddBalanceStatParams
    : T extends TransferRestrictionType.ClaimCount
    ? AddClaimCountStatParams
    : AddClaimOwnershipStatParams,
  'type'
>;

type GetReturnType<T> = ActiveTransferRestrictions<
  T extends TransferRestrictionType.Count
    ? CountTransferRestriction
    : T extends TransferRestrictionType.Percentage
    ? PercentageTransferRestriction
    : T extends TransferRestrictionType.ClaimCount
    ? ClaimCountTransferRestriction
    : ClaimOwnershipTransferRestriction
>;

/**
 * Base class for managing Transfer Restrictions
 */
export abstract class TransferRestrictionBase<
  T extends TransferRestrictionType
> extends Namespace<Asset> {
  protected abstract type: T;

  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.addRestriction = createProcedureMethod<
      AddRestrictionParams<T>,
      AddTransferRestrictionParams,
      BigNumber,
      AddTransferRestrictionStorage
    >(
      {
        getProcedureAndArgs: args => [
          addTransferRestriction,
          { ...args, type: this.type, ticker } as unknown as AddTransferRestrictionParams,
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
          { ...args, type: this.type, ticker } as SetTransferRestrictionsParams,
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
            ticker,
          } as SetTransferRestrictionsParams,
        ],
        voidArgs: true,
      },
      context
    );

    this.enableStat = createProcedureMethod<
      SetAssetStatParams<T>,
      AddAssetStatParams,
      void,
      AddAssetStatStorage
    >(
      {
        getProcedureAndArgs: args => [
          addAssetStat,
          {
            ...args,
            type: this.statType(),
            ticker,
          } as AddAssetStatParams,
        ],
      },
      context
    );

    this.disableStat = createProcedureMethod<
      RemoveAssetStatParams,
      RemoveAssetStatParams,
      void,
      RemoveAssetStatStorage
    >(
      {
        getProcedureAndArgs: args => [
          removeAssetStat,
          {
            ...args,
            type: this.type === TransferRestrictionType.Count ? StatType.Count : StatType.Balance, // need better type lookup
            ticker,
          },
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
   * Removes an Asset Stat
   *
   * @throws if the Stat is being used
   */
  public disableStat: ProcedureMethod<RemoveAssetStatParams, void>;

  /**
   * Retrieve all active Transfer Restrictions of the corresponding type
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public async get(): Promise<GetReturnType<T>> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { statistics },
          consts,
        },
      },
      context,
      type,
    } = this;
    const tickerKey = stringToTickerKey(ticker, context);
    const { requirements } = await statistics.assetTransferCompliances(tickerKey);
    const filteredRequirements = [...requirements].filter(requirement => {
      if (type === TransferRestrictionType.Count) {
        return requirement.isMaxInvestorCount;
      } else if (type === TransferRestrictionType.Percentage) {
        return requirement.isMaxInvestorOwnership;
      } else if (type === TransferRestrictionType.ClaimCount) {
        return requirement.isMaxInvestorOwnership;
      } else {
        return requirement.isClaimOwnership;
      }
    });

    const rawExemptedLists = await Promise.all(
      filteredRequirements.map(() =>
        statistics.transferConditionExemptEntities.entries({ asset: tickerKey })
      )
    );

    const restrictions = rawExemptedLists.map((list, index) => {
      const exemptedIds = list.map(
        ([
          {
            args: [, scopeId],
          },
        ]) => scopeIdToString(scopeId) // `ScopeId` and `IdentityId` are the same type, so this is fine
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
      } else if (type === TransferRestrictionType.ClaimCount) {
        const { min, max, claim, issuer } = value as ClaimRestrictionValue;
        restriction = {
          min,
          max,
          claim,
          issuer,
        };
      } else {
        const { min, max, claim, issuer } = value as ClaimRestrictionValue;
        restriction = { min, max, claim, issuer };
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
      restrictions: restrictions,
      availableSlots: maxTransferConditions.minus(restrictions.length),
    } as GetReturnType<T>;
  }

  /**
   * @hidden
   */
  private statType(): StatType {
    const { type } = this;
    if (type === TransferRestrictionType.Count) {
      return StatType.Count;
    } else if (type === TransferRestrictionType.Percentage) {
      return StatType.Balance;
    } else if (type === TransferRestrictionType.ClaimCount) {
      return StatType.ScopedCount;
    } else {
      return StatType.ScopedBalance;
    }
  }
}
