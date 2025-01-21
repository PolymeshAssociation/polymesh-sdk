import { Option } from '@polkadot/types';
import { AccountId, RewardDestination } from '@polkadot/types/interfaces';
import { PalletStakingNominations } from '@polkadot/types/lookup';

import { Account, Namespace } from '~/internal';
import {
  StakingCommission,
  StakingLedger,
  StakingNomination,
  StakingPayee,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  accountIdToString,
  rawNominationToStakingNomination,
  rawStakingLedgerToStakingLedgerEntry,
  rawValidatorPrefToCommission,
  rewardDestinationToPayee,
  stringToAccountId,
} from '~/utils/conversion';

/**
 * Handles Account staking related functionality
 */
export class Staking extends Namespace<Account> {
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
