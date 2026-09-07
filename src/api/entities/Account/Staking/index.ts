import { Option } from '@polkadot/types';
import { AccountId, RewardDestination } from '@polkadot/types/interfaces';
import { PalletStakingNominations } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Account, Namespace, PolymeshError } from '~/internal';
import {
  AccountExposure,
  ErrorCode,
  StakingCommission,
  StakingLedger,
  StakingNomination,
  StakingPayee,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  accountIdToString,
  balanceToBigNumber,
  bigNumberToBalance,
  bigNumberToU32,
  rawNominationToStakingNomination,
  rawStakingLedgerToStakingLedgerEntry,
  rawValidatorPrefToCommission,
  rewardDestinationToPayee,
  stringToAccountId,
  u32ToBigNumber,
} from '~/utils/conversion';
import { asRawEra, requestPaginated } from '~/utils/internal';

/**
 * Handles Account staking related functionality
 */
export class Staking extends Namespace<Account> {
  /**
   * Fetch the ledger information for a stash account
   *
   * @returns The staking ledger information or null if the account is not a controller
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
   * @returns The payee account or null if the account is not a stash
   */
  public async getPayee(): Promise<StakingPayee | null>;

  /**
   * Fetch the payee that will receive a stash account's rewards
   *
   * @param callback - Callback function that can be used to listen for changes to the staking payee
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @returns The payee account or null if the account is not a stash
   */
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
      rawPayee: RewardDestination | null,
      controller: Account | null
    ): StakingPayee | null => {
      if (!controller || !rawPayee) {
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
        const payee = rawPayee.unwrapOr(null);
        const result = assembleResult(payee, controller);

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

    return assembleResult(rawPayee.unwrapOr(null), controller);
  }

  /**
   * Fetch this account's current nominations
   *
   * @returns The nomination details or null if the account is not a controller
   */
  public async getNomination(): Promise<StakingNomination | null>;

  /**
   * Fetch this account's current nominations
   *
   * @param callback - Callback function that can be used to listen for changes to the nominations
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @returns The nomination details or null if the account is not a controller
   */
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
   * @note a stash can be its own controller
   * @returns The controller account or null if the account is not a stash
   */
  public async getController(): Promise<Account | null>;

  /**
   * Fetch the controller associated to this account if there is one
   *
   * @param callback - Callback function that can be used to listen for changes to the controller
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @note a stash can be its own controller
   * @returns The controller account or null if the account is not a stash
   */
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
   * Fetch the commission settings for this validator account
   *
   * @param args.era - read the commission the Account was elected for in a past era, rather than
   *   the one it is currently advertising. Defaults to the current settings
   *
   * @returns The commission details, or `null` if the Account is not seeking nominations as a
   *   validator — or, when an `era` is given, was not in that era's validator set
   *
   * @note the two are different questions. Without an `era` this reads what the Account is
   *   advertising *now*, which it can change at any time. With one it reads what it was actually
   *   elected on, which is fixed for that era and is what its rewards were calculated against
   */
  public async getCommission(args?: { era?: BigNumber }): Promise<StakingCommission | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      parent: { address },
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const era = args?.era;

    const rawValidator = era
      ? await query.staking.erasValidatorPrefs(bigNumberToU32(era, context), rawAddress)
      : await query.staking.validators(rawAddress);

    if (rawValidator.isEmpty) {
      return null;
    }

    const commission = rawValidatorPrefToCommission(rawValidator);

    return {
      account: this.parent,
      ...commission,
    };
  }

  /**
   * Fetch the validators this Account's stake backed in an era, and how much each one carried
   *
   * @param args.era - defaults to the active era
   *
   * @returns one entry per validator backed, or an empty array where the Account backed none. A
   *   validator's own self-bond is not included — read that as `own` from
   *   {@link api/client/Staking!Staking.getEraExposure | getEraExposure}
   *
   * @throws if the era has no exposure recorded, such as one outside the chain's history depth
   *
   * @note an era's assignments are fixed when it is elected, so this can name a validator the
   *   Account no longer nominates. {@link getNomination} reads intent; this reads what the election
   *   assigned
   *
   * @note reads every exposure page in the era, so it costs one paged storage request over the
   *   whole validator set
   */
  public async getExposure(args?: { era?: BigNumber }): Promise<AccountExposure[]> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      parent: { address },
    } = this;

    const rawEra = await asRawEra(args?.era, context);

    const { entries } = await requestPaginated(query.staking.erasStakersPaged, { arg: rawEra });

    if (!entries.length) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No exposure is recorded for that era',
        data: { era: rawEra.toString() },
      });
    }

    return entries.flatMap(([key, rawPage]) => {
      const validatorAddress = accountIdToString(key.args[1]);

      return rawPage
        .unwrap()
        .others.filter(({ who }) => accountIdToString(who) === address)
        .map(({ value }) => ({
          validator: new Account({ address: validatorAddress }, context),
          value: balanceToBigNumber(value.unwrap()),
        }));
    });
  }

  /**
   * Fetch how many validators this Account may nominate
   *
   * @param args.bonded - the total POLYX that will be bonded, for bonding and nominating in one
   *   batch. Defaults to what the Account has bonded now, or to the chain's minimum nominator bond
   *   where it has none
   *
   * @note the chain derives the cap from the amount bonded, so it is read rather than assumed. On
   *   Polymesh v8 it is always 16 whatever the bond, but that is a runtime setting and can change
   */
  public async getNominationQuota(args?: { bonded?: BigNumber }): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: { call, query },
      },
    } = this;

    let bonded = args?.bonded;

    if (!bonded) {
      const ledger = await this.getLedger();

      bonded = ledger ? ledger.active : balanceToBigNumber(await query.staking.minNominatorBond());
    }

    const rawQuota = await call.stakingApi.nominationsQuota(bigNumberToBalance(bonded, context));

    return u32ToBigNumber(rawQuota);
  }
}
