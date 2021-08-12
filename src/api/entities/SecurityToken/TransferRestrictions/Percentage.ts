import { TransferRestrictionBase } from '~/api/entities/SecurityToken/TransferRestrictions/TransferRestrictionBase';
import {
  AddPercentageTransferRestrictionParams,
  SetPercentageTransferRestrictionsParams,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  PercentageTransferRestriction,
  ProcedureMethod,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Percentage Transfer Restriction related functionality
 */
export class Percentage extends TransferRestrictionBase<TransferRestrictionType.Percentage> {
  protected type = TransferRestrictionType.Percentage as const;

  /**
   * Add a Percentage Transfer Restriction to this Security Token
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
