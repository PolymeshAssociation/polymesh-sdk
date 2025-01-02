import { Account, bondPolyx, Context, Namespace, unbondPolyx } from '~/internal';
import {
  BondPolyxParams,
  ProcedureMethod,
  StakingCommission,
  StakingLedgerEntry,
  StakingNomination,
  UnbondPolyxParams,
} from '~/types';
import {
  accountIdToString,
  rawNominationToStakingNomination,
  rawStakingLedgerToStakingLedgerEntry,
  rawValidatorPrefToCommission,
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
        getProcedureAndArgs: args => [
          bondPolyx,
          { ...args, payee: this.parent, controller: this.parent },
        ],
      },
      context
    );

    this.unbond = createProcedureMethod(
      {
        getProcedureAndArgs: args => [unbondPolyx, { ...args }],
      },
      context
    );
  }

  /**
   * Bond POLYX for staking
   */
  public bond: ProcedureMethod<BondPolyxParams, void>;

  /**
   * Unbond POLYX for staking. The unbonded amount can be withdrawn after the lockup period
   */
  public unbond: ProcedureMethod<UnbondPolyxParams, void>;

  /**
   * Fetch the ledger information for a controller account
   *
   * @note if a value is returned the account is a controller
   */
  public async getLedgerEntry(): Promise<StakingLedgerEntry | null> {
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
   * @note an account can be its own controller
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
