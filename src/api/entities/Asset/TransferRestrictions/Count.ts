import BigNumber from 'bignumber.js';

import { AddCountStatParams } from '~/api/procedures/addAssetStat';
import { RemoveCountStatParams } from '~/api/procedures/removeAssetStat';
import {
  AddCountTransferRestrictionParams,
  SetCountTransferRestrictionsParams,
  TransferRestrictionBase,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  CountTransferRestriction,
  NoArgsProcedureMethod,
  ProcedureMethod,
  TransferRestrictionType,
} from '~/types';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class Count extends TransferRestrictionBase<TransferRestrictionType.Count> {
  protected type = TransferRestrictionType.Count as const;

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
   * Enables investor count statistic for the Asset, which is required before creating restrictions
   *
   * @note this method requires the current number of holders to be passed in. Currently there is a potential
   * race condition when passing in count. If a restriction such as limiting the number of investors is needed, then
   * it is recommended to call this method during the initial configuration of the Asset, before people are trading it.
   * Other options include checking after setting and retrying if that check isn't right, freezing the Asset, or to
   * wait for a future version of the chain that will prevent this race condition
   */
  public declare enableStat: ProcedureMethod<Pick<AddCountStatParams, 'count'>, void>;

  /**
   * Disables investor count statistic for the Asset. Since statistics introduce slight overhead to each transaction
   * involving the Asset, disabling unused stats will reduce gas fees for investors
   *
   * @throws if the stat is being used by a restriction
   */
  public declare disableStat: ProcedureMethod<Omit<RemoveCountStatParams, 'type'>, void>;

  /**

  /**
   * Retrieve all active Count Transfer Restrictions
   *
   * @note there is a maximum number of restrictions allowed across all types.
   *   The `availableSlots` property of the result represents how many more restrictions can be added
   *   before reaching that limit
   */
  public declare get: () => Promise<ActiveTransferRestrictions<CountTransferRestriction>>;
}
