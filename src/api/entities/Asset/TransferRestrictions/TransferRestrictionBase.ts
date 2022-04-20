import BigNumber from 'bignumber.js';

import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  addTransferRestriction,
  AddTransferRestrictionParams,
  Asset,
  Context,
  Namespace,
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
  TransferRestrictionType,
} from '~/types';
import {
  scopeIdToString,
  stringToTicker,
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
      BigNumber
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

    const rawTicker = stringToTicker(ticker, context);
    const complianceRules = await statistics.assetTransferCompliances(rawTicker);
    const filteredRequirements = complianceRules.requirements.filter(requirement => {
      if (type === TransferRestrictionType.Count) {
        return requirement.isMaxInvestorCount;
      }

      return requirement.isMaxInvestorOwnership;
    });

    const rawExemptedLists = await Promise.all(
      filteredRequirements.map(() => statistics.transferConditionExemptEntities.entries(rawTicker))
    );

    // const exemptList = await statistics.transferConditionExemptEntities.entries(rawTicker);

    const restrictions = rawExemptedLists.map((list, index) => {
      const exemptedScopeIds = list.map(
        ([
          {
            args: [, scopeId],
          },
        ]) => scopeIdToString(scopeId)
      );
      const { value } = transferConditionToTransferRestriction(filteredRequirements[index]);
      let restriction;

      if (this.type === TransferRestrictionType.Count) {
        restriction = {
          count: value,
        };
      } else {
        restriction = {
          percentage: value,
        };
      }

      if (exemptedScopeIds.length) {
        return {
          ...restriction,
          exemptedScopeIds,
        };
      }
      return restriction;
    });

    const maxTransferConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

    return {
      restrictions: Object.values(restrictions),
      availableSlots: maxTransferConditions.minus(Object.keys(restrictions).length),
    } as GetReturnType<T>;
  }
}
