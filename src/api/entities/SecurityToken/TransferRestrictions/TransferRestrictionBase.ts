import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  addTransferRestriction,
  AddTransferRestrictionParams,
  Context,
  Namespace,
  SecurityToken,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
  setTransferRestrictions,
  SetTransferRestrictionsParams,
  SetTransferRestrictionsStorage,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  CountTransferRestriction,
  PercentageTransferRestriction,
} from '~/types';
import { ProcedureMethod, TransferRestrictionType } from '~/types/internal';
import { MAX_TRANSFER_MANAGERS } from '~/utils/constants';
import {
  scopeIdToString,
  stringToTicker,
  transferManagerToTransferRestriction,
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
> extends Namespace<SecurityToken> {
  protected abstract type: T;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.addRestriction = createProcedureMethod<
      AddRestrictionParams<T>,
      AddTransferRestrictionParams,
      number
    >(
      args => [
        addTransferRestriction,
        ({ ...args, type: this.type, ticker } as unknown) as AddTransferRestrictionParams,
      ],
      context
    );

    this.setRestrictions = createProcedureMethod<
      SetRestrictionsParams<T>,
      SetTransferRestrictionsParams,
      number,
      SetTransferRestrictionsStorage
    >(
      args => [
        setTransferRestrictions,
        ({ ...args, type: this.type, ticker } as unknown) as SetTransferRestrictionsParams,
      ],
      context
    );

    this.removeRestrictions = createProcedureMethod<
      void,
      SetTransferRestrictionsParams,
      number,
      SetTransferRestrictionsStorage
    >(
      () => [
        setTransferRestrictions,
        ({ restrictions: [], type: this.type, ticker } as unknown) as SetTransferRestrictionsParams,
      ],
      context
    );
  }

  /**
   * Add a Transfer Restriction of the corresponding type to this Security Token
   *
   * @param args.exempted - array of Scope IDs that are exempted from the Restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @note required role:
   *   - Security Token Owner
   */
  public addRestriction: ProcedureMethod<AddRestrictionParams<T>, number>;

  /**
   * Sets all Transfer Restrictions of the corresponding type on this Security Token
   *
   * @param args.restrictions - array of Transfer Restrictions with their corresponding exemptions (if applicable)
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @note required role:
   *   - Security Token Owner
   */
  public setRestrictions: ProcedureMethod<SetRestrictionsParams<T>, number>;

  /**
   * Removes all Transfer Restrictions of the corresponding type from this Security Token
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @note required role:
   *   - Security Token Owner
   */
  public removeRestrictions: ProcedureMethod<void, number>;

  /**
   * Retrieve all active Transfer Restrictions of the corresponding type
   *
   * @note there is a maximum number of restrictions allowed accross all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public async get(): Promise<GetReturnType<T>> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { statistics },
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

    return {
      restrictions,
      availableSlots: MAX_TRANSFER_MANAGERS - activeTms.length,
    } as GetReturnType<T>;
  }
}
