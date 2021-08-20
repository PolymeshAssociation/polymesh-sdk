import { TransferRestrictionBase } from '~/api/entities/SecurityToken/TransferRestrictions/TransferRestrictionBase';
import { AddCountTransferRestrictionParams, SetCountTransferRestrictionsParams } from '~/internal';
import {
  ActiveTransferRestrictions,
  CountTransferRestriction,
  ProcedureMethod,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class Count extends TransferRestrictionBase<TransferRestrictionType.Count> {
  protected type = TransferRestrictionType.Count as const;

  /**
   * Add a Count Transfer Restriction to this Security Token
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction!: ProcedureMethod<Omit<AddCountTransferRestrictionParams, 'type'>, number>;

  /**
   * Sets all Count Transfer Restrictions on this Security Token
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public setRestrictions!: ProcedureMethod<
    Omit<SetCountTransferRestrictionsParams, 'type'>,
    number
  >;

  /**
   * Removes all Count Transfer Restrictions from this Security Token
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public removeRestrictions!: ProcedureMethod<void, number>;

  /**
   * Retrieve all active Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed accross all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public get!: () => Promise<ActiveTransferRestrictions<CountTransferRestriction>>;
}
