import BigNumber from 'bignumber.js';

import { Account, Context } from '~/internal';
import {
  ActiveEraInfo,
  PaginationOptions,
  ResultSet,
  StakingCommission,
  StakingEraInfo,
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
   * TODO support subscription?
   * TODO bundle more info?
   */
  public async eraInfo(): Promise<StakingEraInfo> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    const [rawActiveEra, rawCurrentEra, rawPlannedSession] = await Promise.all([
      query.staking.activeEra(),
      query.staking.currentEra(),
      query.staking.currentPlannedSession(),
    ]);

    const rawTotalStaked = await query.staking.erasTotalStake(rawCurrentEra.unwrapOr(0));

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
  }
}
