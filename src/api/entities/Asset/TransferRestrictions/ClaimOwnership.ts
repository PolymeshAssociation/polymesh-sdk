import BigNumber from 'bignumber.js';

import { AddClaimOwnershipTransferRestrictionParams } from '~/api/procedures/addTransferRestriction';
import { RemoveAssetStatParams } from '~/api/procedures/removeAssetStat';
import { SetClaimOwnershipTransferRestrictionsParams } from '~/api/procedures/setTransferRestrictions';
import { TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  ClaimOwnershipStatInput,
  ClaimOwnershipTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Percentage Transfer Restriction related functionality
 */
export class ClaimOwnership extends TransferRestrictionBase<TransferRestrictionType.ClaimOwnership> {
  protected type = TransferRestrictionType.ClaimOwnership as const;

  /**
   * Add a Percentage Transfer Restriction to this Asset. This limits the total percentage of the float
   * a single investor can acquire without an exemption
   *
   * @note the result is the total amount of restrictions after the procedure has run
   *
   * @throws if the Balance statistic is not enabled for this Asset. enableStat should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddClaimOwnershipTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Percentage Transfer Restrictions on this Asset
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public declare setRestrictions: ProcedureMethod<
    Omit<SetClaimOwnershipTransferRestrictionsParams, 'type'>,
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
  public declare enableStat: ProcedureMethod<Omit<ClaimOwnershipStatInput, 'type'>, void>;

  /**
   * Disables investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveAssetStatParams, 'type'>, void>;

  /**
   * Retrieve all active ClaimOwnership Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<ClaimOwnershipTransferRestriction>>;
}
