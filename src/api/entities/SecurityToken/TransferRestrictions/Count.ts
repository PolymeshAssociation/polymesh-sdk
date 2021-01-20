import { TransferRestrictionBase } from '~/api/entities/SecurityToken/TransferRestrictions/TransferRestrictionBase';
import { AddCountTransferRestrictionParams } from '~/internal';
import { ActiveTransferRestrictions, CountTransferRestriction } from '~/types';
import { ProcedureMethod, TransferRestrictionType } from '~/types/internal';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class Count extends TransferRestrictionBase<TransferRestrictionType.Count> {
  protected type = TransferRestrictionType.Count as const;

  /**
   * Add a Count Transfer Restriction to this Security Token
   *
   * @param args.count - limit on the amount of different (unique) investors that can hold this Security Token at once
   * @param args.exempted - array of Scope IDs that are exempted from the Restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction!: ProcedureMethod<Omit<AddCountTransferRestrictionParams, 'type'>, number>;

  /**
   * Retrieve all active Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed accross all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public get!: () => Promise<ActiveTransferRestrictions<CountTransferRestriction>>;
}
