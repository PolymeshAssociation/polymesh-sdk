import { Option } from '@polkadot/types';
import { AccountId, RewardDestination } from '@polkadot/types/interfaces';
import { PalletStakingNominations } from '@polkadot/types/lookup';

import {
  Account,
  bondPolyx,
  Context,
  Namespace,
  nominateValidators,
  setStakingController,
  setStakingPayee,
  updateBondedPolyx,
  withdrawUnbondedPolyx,
} from '~/internal';
import {
  BondPolyxParams,
  NoArgsProcedureMethod,
  NominateValidatorsParams,
  ProcedureMethod,
  SetStakingControllerParams,
  SetStakingPayeeParams,
  StakingCommission,
  StakingLedger,
  StakingNomination,
  StakingPayee,
  SubCallback,
  UnsubCallback,
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

    this.withdraw = createProcedureMethod(
      {
        getProcedureAndArgs: () => [withdrawUnbondedPolyx, undefined],
        voidArgs: true,
      },
      context
    );

    this.nominate = createProcedureMethod(
      {
        getProcedureAndArgs: args => [nominateValidators, { ...args } as const],
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
   *
   * @note the signing account cannot be a stash
   */
  public bond: ProcedureMethod<BondPolyxParams, void>;

  /**
   * Bond extra POLYX for staking
   *
   * @note this transaction must be signed by a stash
   */
  public bondExtra: ProcedureMethod<UpdatePolyxBondParams, void>;

  /**
   * Unbond POLYX for staking. The unbonded amount can be withdrawn after the lockup period
   */
  public unbond: ProcedureMethod<UpdatePolyxBondParams, void>;

  /**
   * Withdraw unbonded POLYX to free it for the stash account
   *
   * @note this transaction must be signed by a controller
   */
  public withdraw: NoArgsProcedureMethod<void>;

  /**
   * Nominate validators for the bonded POLYX
   *
   * @note this transaction must be signed by a controller
   */
  public nominate: ProcedureMethod<NominateValidatorsParams, void>;

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
   * @returns null unless the account is a controller
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
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async getPayee(): Promise<StakingPayee | null>;
  public async getPayee(callback: SubCallback<StakingPayee | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getPayee(
    callback?: SubCallback<StakingPayee | null>
  ): Promise<StakingPayee | null | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawAddress = stringToAccountId(this.parent.address, context);

    const assembleResult = (
      rawPayee: RewardDestination,
      controller: Account | null
    ): StakingPayee | null => {
      if (!controller) {
        return null;
      }

      return rewardDestinationToPayee(rawPayee, this.parent, controller, context);
    };

    if (callback) {
      let controller: Account | null;
      const contUnsub = await this.getController(newController => {
        controller = newController;
      });

      const payeeUnsub = await query.staking.payee(rawAddress, rawPayee => {
        const result = assembleResult(rawPayee, controller);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callback(result);
      });

      return () => {
        contUnsub();
        payeeUnsub();
      };
    }

    const [rawPayee, controller] = await Promise.all([
      query.staking.payee(rawAddress),
      this.getController(),
    ]);

    return assembleResult(rawPayee, controller);
  }

  /**
   * Fetch this account's current nominations
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @returns null unless the account is a controller
   */
  public async getNomination(): Promise<StakingNomination | null>;
  public async getNomination(
    callback: SubCallback<StakingNomination | null>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getNomination(
    callback?: SubCallback<StakingNomination | null>
  ): Promise<UnsubCallback | StakingNomination | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      parent: { address },
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const assembleResult = (
      rawNomination: Option<PalletStakingNominations>
    ): StakingNomination | null => {
      if (rawNomination.isNone) {
        return null;
      }

      return rawNominationToStakingNomination(rawNomination.unwrap(), context);
    };

    if (callback) {
      this.context.assertSupportsSubscription();

      const unsub = query.staking.nominators(rawAddress, rawNomination => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(rawNomination));
      });

      return unsub;
    }

    const rawNomination = await query.staking.nominators(rawAddress);

    return assembleResult(rawNomination);
  }

  /**
   * Fetch the controller associated to this account if there is one
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @note a stash can be its own controller
   * @returns null unless the account is a stash
   */
  public async getController(): Promise<Account | null>;
  public async getController(callback: SubCallback<Account | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getController(
    callback?: SubCallback<Account | null>
  ): Promise<Account | null | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawId = stringToAccountId(this.parent.address, context);

    const assembleResult = (controllerIdOpt: Option<AccountId>): Account | null => {
      if (controllerIdOpt.isNone) {
        return null;
      }

      const address = accountIdToString(controllerIdOpt.unwrap());

      return new Account({ address }, context);
    };

    if (callback) {
      this.context.assertSupportsSubscription();

      const unsub = query.staking.bonded(rawId, rawController => {
        const result = assembleResult(rawController);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callback(result);
      });

      return unsub;
    }

    const rawController = await query.staking.bonded(rawId);

    return assembleResult(rawController);
  }

  /**
   * @returns null unless the account is seeking nominations as a validator
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

    const commission = rawValidatorPrefToCommission(rawValidator);

    return {
      account: this.parent,
      ...commission,
    };
  }
}
