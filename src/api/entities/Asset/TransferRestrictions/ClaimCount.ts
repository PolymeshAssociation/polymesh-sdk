import BigNumber from 'bignumber.js';

import { AddClaimCountStatParams } from '~/api/procedures/addAssetStat';
import { RemoveCountStatParams } from '~/api/procedures/removeAssetStat';
import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddClaimCountTransferRestrictionParams,
  ClaimCountTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetClaimCountTransferRestrictionsParams,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class ClaimCount extends TransferRestrictionBase<TransferRestrictionType.ClaimCount> {
  protected type = TransferRestrictionType.ClaimCount as const;

  /**
   * Add a Count Transfer Restriction to this Asset. This limits to total number of individual
   * investors that may hold a particular Asset. In some jurisdictions once a threshold of investors is
   * passed, different regulations may apply, and this can ensure the limits are not exceeded
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @throws if a count statistic is not enabled for the Asset. enableStat should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddClaimCountTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Claim Count Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetClaimCountTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Claim Count Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Enables investor count statistic for the Asset scope by a claim, which is required before creating restrictions
   *
   * The number of investors need to be passed in, as the chain will not calculate the initial value for that stat,
   * it only increments / decrements the counters as transactions happen.
   * For `Affiliate` and `Accredited` scoped stats the number of investor who are and are not
   * need to be given. For `Jurisdiction` the amount of holders for each CountryCode need to be given.
   *
   * @note Currently there is a potential race condition when passing in count when the Asset is being traded.
   * It is recommended to call this method during the initial configuration of the Asset, before people are trading it.
   * Otherwise the Asset should be frozen, or the stat checked after being set to ensure the correct value is used. Future
   * versions of the chain may expose a new extrinsic to avoid this issue
   */
  public declare enableStat: ProcedureMethod<Omit<AddClaimCountStatParams, 'type'>, void>;

  /**
   * Disables investor count statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveCountStatParams, 'type'>, void>;

  /**
   * Retrieve all active ClaimCount Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<ClaimCountTransferRestriction>>;
}
