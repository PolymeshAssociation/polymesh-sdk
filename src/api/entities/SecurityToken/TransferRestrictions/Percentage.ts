import { TransferRestrictionBase } from '~/api/entities/SecurityToken/TransferRestrictions/TransferRestrictionBase';
import {
  AddPercentageTransferRestrictionParams,
  SetPercentageTransferRestrictionsParams,
} from '~/internal';
import { ActiveTransferRestrictions, PercentageTransferRestriction } from '~/types';
import { ProcedureMethod, TransferRestrictionType } from '~/types/internal';

/**
 * Handles all Percentage Transfer Restriction related functionality
 */
export class Percentage extends TransferRestrictionBase<TransferRestrictionType.Percentage> {
  protected type = TransferRestrictionType.Percentage as const;

  /**
   * Add a Percentage Transfer Restriction to this Security Token
   *
   * @param args.percentage - limit on the proportion of the total supply of this Security Token that can be held by a single investor at once
   * @param args.exemptedScopeIds - array of Scope IDs that are exempted from the Restriction
   * @param args.exemptedIdentities - array of Identities (or DIDs) that are exempted from the Restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction!: ProcedureMethod<
    Omit<AddPercentageTransferRestrictionParams, 'type'>,
    number
  >;

  /**
   * Sets all Percentage Transfer Restrictions on this Security Token
   *
   * @param args.restrictions - array of Percentage Transfer Restrictions with their corresponding exemptions (if applicable)
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public setRestrictions!: ProcedureMethod<
    Omit<SetPercentageTransferRestrictionsParams, 'type'>,
    number
  >;

  /**
   * Removes all Percentage Transfer Restrictions from this Security Token
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public removeRestrictions!: ProcedureMethod<void, number>;

  /**
   * Retrieve all active Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed accross all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public get!: () => Promise<ActiveTransferRestrictions<PercentageTransferRestriction>>;
}
