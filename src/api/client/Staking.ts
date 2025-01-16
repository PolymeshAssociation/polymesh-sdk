import { Option, u32, u128 } from '@polkadot/types';
import { PalletStakingActiveEraInfo } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Account, Context } from '~/internal';
import {
  ActiveEraInfo,
  PaginationOptions,
  ResultSet,
  StakingCommission,
  StakingEraInfo,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  accountIdToString,
  activeEraStakingToActiveEraInfo,
  rawValidatorPrefToCommission,
  u32ToBigNumber,
  u128ToBigNumber,
} from '~/utils/conversion';
import { requestPaginated } from '~/utils/internal';

/**
 * Handles Staking related functionality
 */
export class Staking {
  private readonly context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Return information about nomination targets
   *
   * @note supports pagination
   */
  public async getValidators(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<StakingCommission>> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const { entries: rawValidators, lastKey: next } = await requestPaginated(
      query.staking.validators,
      {
        paginationOpts,
      }
    );

    const data = rawValidators.map(
      ([
        {
          args: [rawAddress],
        },
        rawValidatorPref,
      ]) => {
        const address = accountIdToString(rawAddress);
        const account = new Account({ address }, context);

        const { commission, blocked } = rawValidatorPrefToCommission(rawValidatorPref);

        return {
          account,
          commission,
          blocked,
        };
      }
    );

    return {
      next,
      data,
    };
  }

  /**
   * Retrieve the current staking era
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async eraInfo(): Promise<StakingEraInfo>;
  public async eraInfo(callback: SubCallback<StakingEraInfo>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async eraInfo(
    callback?: SubCallback<StakingEraInfo>
  ): Promise<StakingEraInfo | UnsubCallback> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const assembleResult = (
      rawActiveEra: Option<PalletStakingActiveEraInfo>,
      rawCurrentEra: Option<u32>,
      rawPlannedSession: u32,
      rawTotalStaked: u128
    ): StakingEraInfo => {
      let activeEra: ActiveEraInfo;
      if (rawActiveEra.isNone) {
        activeEra = { index: new BigNumber(0), start: new BigNumber(0) };
      } else {
        activeEra = activeEraStakingToActiveEraInfo(rawActiveEra.unwrap());
      }

      let currentEra: BigNumber;
      if (rawCurrentEra.isNone) {
        currentEra = new BigNumber(0);
      } else {
        currentEra = u32ToBigNumber(rawCurrentEra.unwrap());
      }

      const plannedSession = u32ToBigNumber(rawPlannedSession);
      const totalStaked = u128ToBigNumber(rawTotalStaked);

      return {
        activeEra: activeEra.index,
        activeEraStart: activeEra.start,
        currentEra,
        plannedSession,
        totalStaked,
      };
    };

    if (callback) {
      context.assertSupportsSubscription();

      let rawActiveEra: Option<PalletStakingActiveEraInfo>;
      let rawCurrentEra: Option<u32> = context.createType('Option<u32>', undefined); // workaround "no use before defined" rule
      let rawPlannedSession: u32;
      let rawTotalStaked: u128;

      let initialized = false;

      const callCb = (): void => {
        if (!initialized) {
          return;
        }

        const result = assembleResult(
          rawActiveEra,
          rawCurrentEra,
          rawPlannedSession,
          rawTotalStaked
        );

        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(result);
      };

      const [activeUnsub, currentUnsub, plannedUnsub] = await Promise.all([
        query.staking.activeEra(activeEra => {
          rawActiveEra = activeEra;

          callCb();
        }),
        query.staking.currentEra(async currentEra => {
          rawCurrentEra = currentEra;
          rawTotalStaked = await query.staking.erasTotalStake(rawCurrentEra.unwrapOr(0));

          callCb();
        }),
        query.staking.currentPlannedSession(plannedSession => {
          rawPlannedSession = plannedSession;

          callCb();
        }),
      ]);

      rawTotalStaked = await query.staking.erasTotalStake(rawCurrentEra.unwrapOr(0));

      const unsub = (): void => {
        activeUnsub();
        currentUnsub();
        plannedUnsub();
      };

      initialized = true;
      callCb();

      return unsub;
    }

    const [rawActiveEra, rawCurrentEra, rawPlannedSession] = await Promise.all([
      query.staking.activeEra(),
      query.staking.currentEra(),
      query.staking.currentPlannedSession(),
    ]);

    const rawTotalStaked = await query.staking.erasTotalStake(rawCurrentEra.unwrapOr(0));

    return assembleResult(rawActiveEra, rawCurrentEra, rawPlannedSession, rawTotalStaked);
  }
}
