import { TransferRestrictionBase } from '~/api/entities/SecurityToken/TransferRestrictions/TransferRestrictionBase';
import { AddPercentageTransferRestrictionParams } from '~/internal';
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
   * @param args.exempted - array of Scope IDs that are exempted from the Restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction!: ProcedureMethod<
    Omit<AddPercentageTransferRestrictionParams, 'type'>,
    number
  >;

  /**
   * Retrieve all active Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed accross all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public get!: () => Promise<ActiveTransferRestrictions<PercentageTransferRestriction>>;
}
