import BigNumber from 'bignumber.js';

import { Context, FungibleAsset, TransferRestrictionBase } from '~/internal';
import {
  ActiveTransferRestrictions,
  AddCountStatParams,
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
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);
    this.investorCount = parent.investorCount.bind(parent);
  }

  protected type = TransferRestrictionType.Count as const;

  /**
   * Add a Count Transfer Restriction to this Asset. This limits to total number of individual
   * investors that may hold the Asset. In some jurisdictions once a threshold of investors is
   * passed, different regulations may apply. Count Transfer Restriction can ensure such limits are not exceeded
   *
   * @returns the total amount of restrictions after the procedure has run
   *
   * @throws if a count statistic is not enabled for the Asset. {@link api/entities/Asset/TransferRestrictions/Count!Count.enableStat | Count.enableStat } should be called before this method
   */
  public declare addRestriction: ProcedureMethod<
    Omit<AddCountTransferRestrictionParams, 'type'>,
    BigNumber
  >;

  /**
   * Sets all Count Transfer Restrictions on this Asset
   *
   * @note this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Count Transfer Restriction
   * but not passed into this call then it will be removed
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
   * Enables an investor count statistic for the Asset, which is required before creating restrictions
   *
   * The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
   * As such the initial value for the stat should be passed in, which can be fetched with {@link api/entities/Asset/TransferRestrictions/Count!Count.investorCount | Count.investorCount }
   *
   * @note Currently there is a potential race condition if passing in counts values when the Asset is being traded.
   * It is recommended to call this method during the initial configuration of the Asset, before people are trading it.
   * Otherwise the Asset should be frozen, or the stat checked after being set to ensure the correct value is used. Future
   * versions of the chain may expose a new extrinsic to avoid this issue
   */
  public declare enableStat: ProcedureMethod<Pick<AddCountStatParams, 'count'>, void>;

  /**
   * Disables the investor count statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors when they transact with the Asset
   *
   * @throws if the stat is being used by a restriction or is not set
   */
  public declare disableStat: NoArgsProcedureMethod<void>;

  /**

  /**
   * Retrieve all active Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<CountTransferRestriction>>;

  /**
   * Returns the count of individual holders of the Asset
   *
   * @note This value can be used to initialize `enableStat`. If used for this purpose there is a potential race condition
   * if Asset transfers happen between the time of check and time of use. Either pause Asset transfers, or check after stat
   * creation and try again if a race occurred. Future versions of the chain should introduce an extrinsic to avoid this issue
   */
  public investorCount: () => Promise<BigNumber>;
}
