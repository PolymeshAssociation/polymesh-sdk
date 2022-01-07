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
  transferManagerToTransferRestriction,
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
      number
    >(
      {
        getProcedureAndArgs: args => [
          addTransferRestriction,
          ({ ...args, type: this.type, ticker } as unknown) as AddTransferRestrictionParams,
        ],
      },
      context
    );

    this.setRestrictions = createProcedureMethod<
      SetRestrictionsParams<T>,
      SetTransferRestrictionsParams,
      number,
      SetTransferRestrictionsStorage
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictions,
          ({ ...args, type: this.type, ticker } as unknown) as SetTransferRestrictionsParams,
        ],
      },
      context
    );

    this.removeRestrictions = createProcedureMethod<
      SetTransferRestrictionsParams,
      number,
      SetTransferRestrictionsStorage
    >(
      {
        getProcedureAndArgs: () => [
          setTransferRestrictions,
          ({
            restrictions: [],
            type: this.type,
            ticker,
          } as unknown) as SetTransferRestrictionsParams,
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
  public addRestriction: ProcedureMethod<AddRestrictionParams<T>, number>;

  /**
   * Sets all Transfer Restrictions of the corresponding type on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public setRestrictions: ProcedureMethod<SetRestrictionsParams<T>, number>;

  /**
   * Removes all Transfer Restrictions of the corresponding type from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public removeRestrictions: NoArgsProcedureMethod<number>;

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
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const activeTms = await statistics.activeTransferManagers(rawTicker);
    const filteredTms = activeTms.filter(tm => {
      if (this.type === TransferRestrictionType.Count) {
        return tm.isCountTransferManager;
      }

      return tm.isPercentageTransferManager;
    });

    const rawExemptedLists = await Promise.all(
      filteredTms.map(tm => statistics.exemptEntities.entries([rawTicker, tm]))
    );

    const restrictions = rawExemptedLists.map((list, index) => {
      const exemptedScopeIds = list.map(([{ args: [, scopeId] }]) => scopeIdToString(scopeId));
      const { value } = transferManagerToTransferRestriction(filteredTms[index]);
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

    const maxTransferManagers = u32ToBigNumber(
      consts.statistics.maxTransferManagersPerAsset
    ).toNumber();

    return {
      restrictions,
      availableSlots: maxTransferManagers - activeTms.length,
    } as GetReturnType<T>;
  }
}
