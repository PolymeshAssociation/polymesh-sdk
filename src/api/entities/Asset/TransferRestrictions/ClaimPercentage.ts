import BigNumber from 'bignumber.js';

import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddClaimPercentageStatParams,
  AddClaimPercentageTransferRestrictionParams,
  ClaimPercentageTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveScopedBalanceParams,
  SetClaimPercentageTransferRestrictionsParams,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Claim Percentage Transfer Restriction related functionality
 */
export class ClaimPercentage extends TransferRestrictionBase<TransferRestrictionType.ClaimPercentage> {
  protected type = TransferRestrictionType.ClaimPercentage as const;

  /**
   * Add a Percentage Transfer Restriction to this Asset. This can be used to limit the total amount of supply
   * investors who share a ClaimType may hold. For example a restriction can be made so Canadian investors must hold
   * at least 50% of the supply.
   *
   * @returns the total amount of restrictions after the procedure has run
   *
   * @throws if the appropriately scoped Balance statistic (by ClaimType and issuer) is not enabled for this Asset. {@link ClaimPercentage.enableStat} with appropriate arguments should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddClaimPercentageTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Claim Percentage Transfer Restrictions on this Asset
   *
   * @note this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Claim Percentage Transfer Restriction
   * but not passed into this call then it will be removed
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetClaimPercentageTransferRestrictionsParams, 'type'>,
    BigNumber
  >;

  /**
   * Removes all Claim Percentage Transfer Restrictions from this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare removeRestrictions: NoArgsProcedureMethod<BigNumber>;

  /**
   * Enables investor balance statistic for the Asset, which is required before creating restrictions
   * that limit the total ownership the Asset's supply
   */
  public declare enableStat: ProcedureMethod<Omit<AddClaimPercentageStatParams, 'type'>, void>;

  /**
   * Disables an investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction or is not set
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveScopedBalanceParams, 'type'>, void>;

  /**
   * Retrieve all active Claim Percentage Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<ClaimPercentageTransferRestriction>>;
}
