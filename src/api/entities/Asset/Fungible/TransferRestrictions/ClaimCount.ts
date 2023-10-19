import BigNumber from 'bignumber.js';

import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddClaimCountStatParams,
  AddClaimCountTransferRestrictionParams,
  ClaimCountTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveScopedCountParams,
  SetClaimCountTransferRestrictionsParams,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Claim Count Transfer Restriction related functionality
 */
export class ClaimCount extends TransferRestrictionBase<TransferRestrictionType.ClaimCount> {
  protected type = TransferRestrictionType.ClaimCount as const;

  /**
   * Add a ClaimCount Transfer Restriction to this Asset. This limits to total number of individual
   * investors that may hold the Asset scoped by some Claim. This can limit the number of holders that
   * are non accredited, or ensure all holders are of a certain nationality
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @throws if the appropriate count statistic (matching ClaimType and issuer) is not enabled for the Asset. {@link ClaimCount.enableStat} should be called with appropriate arguments before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddClaimCountTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Claim Count Transfer Restrictions on this Asset
   *
   * @note this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Claim Count Transfer Restriction
   * but not passed into this call then it will be removed
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
   * Enables an investor count statistic for the Asset to be scoped by a claim, which is required before creating restrictions
   *
   * The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
   * As such the initial values for the stat should be passed in.
   * For `Affiliate` and `Accredited` scoped stats the both the number of investors who have the Claim and who do not have the claim
   * should be given. For `Jurisdiction` scoped stats the amount of holders for each CountryCode need to be given.
   *
   * @note Currently there is a potential race condition if passing in counts values when the Asset is being traded.
   * It is recommended to call this method during the initial configuration of the Asset, before people are trading it.
   * Otherwise the Asset should be frozen, or the stat checked after being set to ensure the correct value is used. Future
   * versions of the chain may expose a new extrinsic to avoid this issue
   */
  public declare enableStat: ProcedureMethod<Omit<AddClaimCountStatParams, 'type'>, void>;

  /**
   * Disables a claim count statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction or is not set
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveScopedCountParams, 'type'>, void>;

  /**
   * Retrieve all active Claim Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<ClaimCountTransferRestriction>>;
}
