import BigNumber from 'bignumber.js';

import {
  AddAssetStatParams,
  AddCountStatParams,
  AddPercentStatParams,
} from '~/api/procedures/addAssetStat';
import { removeAssetStat, RemoveAssetStatParams } from '~/api/procedures/removeAssetStat';
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
    : AddPercentageTransferRestrictionParams,
  'type'
>;

type SetRestrictionsParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? SetCountTransferRestrictionsParams
    : SetPercentageTransferRestrictionsParams,
  'type'
>;

type SetAssetStatParams<T> = Omit<
  T extends TransferRestrictionType.Count ? AddCountStatParams : AddPercentStatParams,
  'type'
>;

type GetReturnType<T> = ActiveTransferRestrictions<
  T extends TransferRestrictionType.Count ? CountTransferRestriction : PercentageTransferRestriction
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
          { ...args, type: this.type, ticker } as unknown as SetTransferRestrictionsParams,
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
          } as unknown as SetTransferRestrictionsParams,
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
            type: this.type === TransferRestrictionType.Count ? StatType.Count : StatType.Balance,
            ticker,
          } as AddAssetStatParams,
        ],
      },
      context
    );

    this.disableStat = createProcedureMethod<RemoveAssetStatParams, void, RemoveAssetStatStorage>(
      {
        getProcedureAndArgs: () => [
          removeAssetStat,
          {
            type: this.type === TransferRestrictionType.Count ? StatType.Count : StatType.Balance,
            ticker,
          },
        ],
        voidArgs: true,
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
  public disableStat: NoArgsProcedureMethod<void>;

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
    const complianceRules = await statistics.assetTransferCompliances(tickerKey);
    const filteredRequirements = complianceRules.requirements.filter(requirement => {
      if (type === TransferRestrictionType.Count) {
        return requirement.isMaxInvestorCount;
      }

      return requirement.isMaxInvestorOwnership;
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
      const { value } = transferConditionToTransferRestriction(filteredRequirements[index]);
      let restriction;

      if (type === TransferRestrictionType.Count) {
        restriction = {
          count: value,
        };
      } else {
        restriction = {
          percentage: value,
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
      restrictions: restrictions,
      availableSlots: maxTransferConditions.minus(restrictions.length),
    } as GetReturnType<T>;
  }
}
