import BigNumber from 'bignumber.js';

import { RemoveBalanceStatParams } from '~/api/procedures/removeAssetStat';
import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddClaimPercentageTransferRestrictionParams,
  ClaimPercentageStatInput,
  ClaimPercentageTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetClaimPercentageTransferRestrictionsParams,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Percentage Transfer Restriction related functionality
 */
export class ClaimPercentage extends TransferRestrictionBase<TransferRestrictionType.ClaimPercentage> {
  protected type = TransferRestrictionType.ClaimPercentage as const;

  /**
   * Add a Percentage Transfer Restriction to this Asset. This limits the total percentage of the float
   * a single investor can acquire without an exemption
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @throws if the Balance statistic is not enabled for this Asset. enableStat should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddClaimPercentageTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Percentage Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetClaimPercentageTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Claim Ownership Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Enables investor balance statistic for the Asset, which is required before creating restrictions
   * that limit the total ownership of a company
   */
  public declare enableStat: ProcedureMethod<Omit<ClaimPercentageStatInput, 'type'>, void>;

  /**
   * Disables investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveBalanceStatParams, 'type'>, void>;

  /**
   * Retrieve all active ClaimPercentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<ClaimPercentageTransferRestriction>>;
}
