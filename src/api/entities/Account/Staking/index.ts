import {
  Account,
  bondPolyx,
  Context,
  Namespace,
  setStakingController,
  setStakingPayee,
  updateBondedPolyx,
} from '~/internal';
import {
  BondPolyxParams,
  ProcedureMethod,
  SetStakingControllerParams,
  SetStakingPayeeParams,
  StakingCommission,
  StakingLedger,
  StakingNomination,
  StakingPayee,
  UpdatePolyxBondParams,
} from '~/types';
import {
  accountIdToString,
  rawNominationToStakingNomination,
  rawStakingLedgerToStakingLedgerEntry,
  rawValidatorPrefToCommission,
  rewardDestinationToPayee,
  stringToAccountId,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Staking related functionality
 */
export class Staking extends Namespace<Account> {
  /**
   * @hidden
   */
  constructor(parent: Account, context: Context) {
    super(parent, context);

    this.bond = createProcedureMethod(
      {
        getProcedureAndArgs: args => [bondPolyx, { ...args }],
      },
      context
    );

    this.unbond = createProcedureMethod(
      {
        getProcedureAndArgs: args => [updateBondedPolyx, { ...args, type: 'unbond' } as const],
      },
      context
    );

    this.bondExtra = createProcedureMethod(
      {
        getProcedureAndArgs: args => [updateBondedPolyx, { ...args, type: 'bondExtra' } as const],
      },
      context
    );

    this.setController = createProcedureMethod(
      {
        getProcedureAndArgs: args => [setStakingController, args],
      },
      context
    );

    this.setPayee = createProcedureMethod(
      {
        getProcedureAndArgs: args => [setStakingPayee, args],
      },
      context
    );
  }

  /**
   * Bond POLYX for staking
   */
  public bond: ProcedureMethod<BondPolyxParams, void>;

  /**
   * Bond extra POLYX for staking
   */
  public bondExtra: ProcedureMethod<UpdatePolyxBondParams, void>;

  /**
   * Unbond POLYX for staking. The unbonded amount can be withdrawn after the lockup period
   */
  public unbond: ProcedureMethod<UpdatePolyxBondParams, void>;

  /**
   * Allow for a stash account to update its controller
   *
   * @note the transaction must be signed by a stash account
   */
  public setController: ProcedureMethod<SetStakingControllerParams, void>;

  /**
   * Allow for a stash account to update where it's staking rewards are deposited
   *
   * @note the transaction must be signed by a controller account
   */
  public setPayee: ProcedureMethod<SetStakingPayeeParams, void>;

  /**
   * Fetch the ledger information for a stash account
   *
   * @note null is returned unless the account is a controller
   */
  public async getLedger(): Promise<StakingLedger | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawAddress = stringToAccountId(this.parent.address, context);

    const rawEntry = await query.staking.ledger(rawAddress);

    if (rawEntry.isNone) {
      return null;
    }

    return rawStakingLedgerToStakingLedgerEntry(rawEntry.unwrap(), context);
  }

  /**
   * Fetch the payee that will receive a stash account's rewards
   *
   * @note null is returned when the account is not a stash
   */
  public async getPayee(): Promise<StakingPayee | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawAddress = stringToAccountId(this.parent.address, context);

    const [rawPayee, controller] = await Promise.all([
      query.staking.payee(rawAddress),
      this.getController(),
    ]);

    if (!controller) {
      return null;
    }

    return rewardDestinationToPayee(rawPayee, this.parent, controller, context);
  }

  /**
   * Fetch this account's current nominations
   *
   * @note a value returned implies the account is a controller account
   *
   * TODO support subscription
   */
  public async getNomination(): Promise<StakingNomination | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      parent: { address },
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const rawNomination = await query.staking.nominators(rawAddress);

    if (rawNomination.isNone) {
      return null;
    }

    return rawNominationToStakingNomination(rawNomination.unwrap(), context);
  }

  /**
   * Fetch the controller associated to this account if there is one
   *
   * @note if this is set it implies this account is a stash account
   * @note a stash can be its own controller
   *
   * TODO support subscription
   */
  public async getController(): Promise<Account | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawId = stringToAccountId(this.parent.address, context);

    const rawController = await query.staking.bonded(rawId);

    if (rawController.isNone) {
      return null;
    }

    const address = accountIdToString(rawController.unwrap());

    return new Account({ address }, context);
  }

  /**
   * @returns this Account's desire to be a validator and their expected commission
   */
  public async getCommission(): Promise<StakingCommission | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      parent: { address },
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const rawValidator = await query.staking.validators(rawAddress);

    if (rawValidator.isEmpty) {
      return null;
    }

    return rawValidatorPrefToCommission(rawValidator);
  }
}
