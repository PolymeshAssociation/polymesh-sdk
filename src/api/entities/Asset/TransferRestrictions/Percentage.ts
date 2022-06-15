import BigNumber from 'bignumber.js';

import { AddPercentStatParams } from '~/api/procedures/addAssetStat';
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
   * Enables investor ownership percentage statistic for the Asset, which is required before creating restrictions
   * that limit the total ownership of a company. e.g. a 10% stake requires certain reporting requirements to be met
   * before an exemption to the TransferRestriction is granted
   *
   * @note the params currently require a single empty object as the sole argument
   */
  public declare enableStat: ProcedureMethod<Omit<AddPercentStatParams, 'type'>, void>;

  /**
   * Retrieve all active Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<PercentageTransferRestriction>>;
}
