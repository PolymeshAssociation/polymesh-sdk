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
   * Add a Percentage Transfer Restriction to this Asset. This limits the total percentage of the float
   * a single investor can acquire without getting an exemption to the restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @throws if the Balance statistic is not enabled for this Asset. enableStat should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddPercentageTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Percentage Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetPercentageTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Percentage Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Enables investor balance statistic for the Asset, which is required before creating restrictions
   * that limit the total ownership of a company. e.g. a 10% stake requires certain reporting requirements to be met
   * before an exemption to the TransferRestriction is granted
   */
  public declare enableStat: NoArgsProcedureMethod<void>;

  /**
   * Disables investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling stats will reduce gas fees for people transacting with it
   *
   * @throws if the stat is being used by a restriction
   */
  public declare disableStat: NoArgsProcedureMethod<void>;

  /**
   * Retrieve all active Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<PercentageTransferRestriction>>;
}
