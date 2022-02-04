import BigNumber from 'bignumber.js';

import {
  AddPercentageTransferRestrictionParams,
  SetPercentageTransferRestrictionsParams,
  TransferRestrictionBase,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  NoArgsProcedureMethod,
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
   * Add a Percentage Transfer Restriction to this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction!: ProcedureMethod<
    Omit<AddPercentageTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Percentage Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public setRestrictions!: ProcedureMethod<
    Omit<SetPercentageTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Percentage Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public removeRestrictions!: NoArgsProcedureMethod<BigNumber>;

  /**
   * Retrieve all active Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public get!: () => Promise<ActiveTransferRestrictions<PercentageTransferRestriction>>;
}
