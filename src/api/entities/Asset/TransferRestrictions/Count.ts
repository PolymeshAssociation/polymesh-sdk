import BigNumber from 'bignumber.js';

import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddCountTransferRestrictionParams,
  CountTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetCountTransferRestrictionsParams,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class Count extends TransferRestrictionBase<TransferRestrictionType.Count> {
  protected type = TransferRestrictionType.Count as const;

  /**
   * Add a Count Transfer Restriction to this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddCountTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Count Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetCountTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Count Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Retrieve all active Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<CountTransferRestriction>>;
}
