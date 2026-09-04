import { Option, u32, u64, u128 } from '@polkadot/types';
import { PalletStakingActiveEraInfo, PalletStakingEraRewardPoints } from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  Account,
  bondPolyx,
  chillStaking,
  Context,
  nominateValidators,
  PolymeshError,
  setStakingController,
  setStakingPayee,
  updateBondedPolyx,
  withdrawUnbondedPolyx,
} from '~/internal';
import {
  ActiveEraInfo,
  BondPolyxParams,
  ElectionPhase,
  EraExposure,
  EraNominators,
  EraProgress,
  EraRewardPoints,
  ErrorCode,
  NoArgsProcedureMethod,
  NominateValidatorsParams,
  PaginationOptions,
  PeriodProgress,
  ProcedureMethod,
  ResultSet,
  SetStakingPayeeParams,
  StakingCommission,
  StakingConstants,
  StakingEraInfo,
  SubCallback,
  UnsubCallback,
  UpdatePolyxBondParams,
} from '~/types';
import { MILLISECONDS_PER_YEAR } from '~/utils/constants';
import {
  accountIdToString,
  activeEraStakingToActiveEraInfo,
  balanceToBigNumber,
  bigNumberToU32,
  rawValidatorPrefToCommission,
  stringToAccountId,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAccount,
  createProcedureMethod,
  getSlotAtBlock,
  QueryMultiParam,
  requestMulti,
  requestPaginated,
} from '~/utils/internal';

/**
 * @hidden
 *
 * Assemble the exact slot-counted progress through a period, plus the time projection a countdown
 *   needs. Both are clamped: a period that has run long has not ended, and a progress above 1 or a
 *   negative countdown reads as broken
 */
function toPeriodProgress(
  elapsed: BigNumber,
  total: BigNumber,
  expectedBlockTime: BigNumber
): PeriodProgress {
  const capped = BigNumber.min(elapsed, total);
  const remaining = total.minus(capped).multipliedBy(expectedBlockTime);

  return {
    elapsed,
    total,
    progress: capped.dividedBy(total),
    remaining,
    end: new Date(new BigNumber(Date.now()).plus(remaining).toNumber()),
  };
}

/**
 * @hidden
 *
 * What one round of `eraProgress`'s multi query comes back with
 */
type EraProgressReads = [
  Option<PalletStakingActiveEraInfo>,
  Option<u32>,
  u32,
  u64,
  ITuple<[u32, u32]>
];

/**
 * @hidden
 *
 * Assemble the era and session progress from one round of chain reads, the session the era began
 *   in, and the slot the current epoch began in
 */
function assembleEraProgress(
  [rawActiveEra, rawCurrentEra, rawSession, rawSlot]: EraProgressReads,
  eraStartSession: BigNumber,
  epochStartSlot: BigNumber,
  { slotsPerSession, sessionsPerEra, expectedBlockTime }: StakingConstants
): EraProgress {
  const { index: rawEraIndex, start: rawStart } = rawActiveEra.unwrap();

  const era = u32ToBigNumber(rawEraIndex);
  const session = u32ToBigNumber(rawSession);

  const sessionElapsed = BigNumber.max(u64ToBigNumber(rawSlot).minus(epochStartSlot), 0);

  /* sessions of this era that are already behind the chain */
  const sessionsDone = BigNumber.max(session.minus(eraStartSession), 0);

  const eraElapsed = sessionsDone.multipliedBy(slotsPerSession).plus(sessionElapsed);

  return {
    era: {
      index: era,
      planned: rawCurrentEra.isSome ? u32ToBigNumber(rawCurrentEra.unwrap()) : era,
      start: rawStart.isSome ? new Date(u64ToBigNumber(rawStart.unwrap()).toNumber()) : null,
      progress: toPeriodProgress(
        eraElapsed,
        slotsPerSession.multipliedBy(sessionsPerEra),
        expectedBlockTime
      ),
    },
    session: {
      index: session,
      inEra: BigNumber.min(sessionsDone.plus(1), sessionsPerEra),
      perEra: sessionsPerEra,
      progress: toPeriodProgress(sessionElapsed, slotsPerSession, expectedBlockTime),
    },
  };
}

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

    this.rebond = createProcedureMethod(
      {
        getProcedureAndArgs: args => [updateBondedPolyx, { ...args, type: 'rebond' } as const],
      },
      context
    );

    this.chill = createProcedureMethod(
      {
        getProcedureAndArgs: () => [chillStaking, undefined],
        voidArgs: true,
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
        getProcedureAndArgs: () => [setStakingController, undefined],
        voidArgs: true,
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
   * Rebond POLYX that is currently unbonding, without waiting for the lockup period to elapse
   *
   * @note this transaction must be signed by a controller
   */
  public rebond: ProcedureMethod<UpdatePolyxBondParams, void>;

  /**
   * Stop nominating validators, without unbonding any POLYX
   *
   * @note the bonded POLYX stays bonded. Use `unbond` to begin withdrawing it
   * @note this transaction must be signed by a controller
   */
  public chill: NoArgsProcedureMethod<void>;

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
   * Allow for a stash account to update its controller so the stash becomes its own controller
   *
   * @note the transaction must be signed by a stash account
   */
  public setController: NoArgsProcedureMethod<void>;

  /**
   * Allow for a stash account to update where it's staking rewards are deposited
   *
   * @note the transaction must be signed by a controller account
   */
  public setPayee: ProcedureMethod<SetStakingPayeeParams, void>;

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
   * Retrieve the validators whose set is actually in force for the active era
   *
   * @returns the elected validators, in the chain's own order
   *
   * @note this is a different question from
   *   {@link api/client/Staking!Staking.getValidators | getValidators}, which lists every Account
   *   *declaring intent* to validate. Those declaring intent but not elected are the waiting set —
   *   subtract this result from `getValidators` to get it
   * @note bounded by {@link api/client/Staking!Staking.getValidatorCount | getValidatorCount}, so
   *   unlike the intent list this needs no pagination
   */
  public async getActiveValidators(): Promise<Account[]> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawValidators = await query.session.validators();

    return rawValidators.map(
      rawAddress => new Account({ address: accountIdToString(rawAddress) }, context)
    );
  }

  /**
   * Retrieve how many validators the chain aims to elect each era
   *
   * @note this is the target the election is run against, not how many are currently in force —
   *   read {@link api/client/Staking!Staking.getActiveValidators | getActiveValidators} for that.
   *   The two differ when fewer Accounts declare intent than there are slots
   */
  public async getValidatorCount(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    return u32ToBigNumber(await query.staking.validatorCount());
  }

  /**
   * Retrieve information about the staking eras the chain is tracking
   *
   * @returns Promise that resolves to the era information
   *
   * @note the chain tracks **two** era numbers and they are not interchangeable. `currentEra` is
   *   the latest era the chain has *planned* — a validator set has been elected for it, but the
   *   Session pallet may not have brought it into force. `activeEra` is the era whose validator set
   *   is in force and whose rewards and slashes are being processed. `currentEra` runs ahead of
   *   `activeEra` between an election and the session rotation that follows it, and the two are
   *   equal the rest of the time. Anything describing what the chain is doing now wants `activeEra`
   */
  public async eraInfo(): Promise<StakingEraInfo>;

  /**
   * Retrieve the current staking era information (with subscription support)
   *
   * @param callback - Callback function that receives era information updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
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
      // `erasTotalStake` is a `Balance`, so it needs the POLYX shift rather than a plain u128 read
      const totalStaked = balanceToBigNumber(rawTotalStaked);

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

  /**
   * Retrieve the chain constants that govern staking
   *
   * @note these come from the chain's metadata, so this makes no query
   */
  public getConstants(): StakingConstants {
    const {
      context: {
        polymeshApi: { consts },
      },
    } = this;

    const sessionsPerEra = u32ToBigNumber(consts.staking.sessionsPerEra);
    const slotsPerSession = u64ToBigNumber(consts.babe.epochDuration);
    const expectedBlockTime = u64ToBigNumber(consts.babe.expectedBlockTime);

    const eraDuration = expectedBlockTime
      .multipliedBy(slotsPerSession)
      .multipliedBy(sessionsPerEra);

    return {
      sessionsPerEra,
      slotsPerSession,
      expectedBlockTime,
      eraDuration,
      erasPerYear: MILLISECONDS_PER_YEAR.dividedBy(eraDuration),
      bondingDuration: u32ToBigNumber(consts.staking.bondingDuration),
      historyDepth: u32ToBigNumber(consts.staking.historyDepth),
      fixedYearlyReward: balanceToBigNumber(consts.validators.fixedYearlyReward),
      maxVariableInflationTotalIssuance: balanceToBigNumber(
        consts.validators.maxVariableInflationTotalIssuance
      ),
    };
  }

  /**
   * Retrieve how far through the staking cycle the chain is — which era and session are in force,
   *   and how far through each of them the chain has got
   *
   * @throws if there is no active era
   *
   * @note progress is counted in **slots**, which is how the chain measures a period, so
   *   `progress` is exact. The `remaining` and `end` projections come from `expectedBlockTime` and
   *   move as block production drifts
   */
  public async eraProgress(): Promise<EraProgress>;

  /**
   * Retrieve how far through the staking cycle the chain is, and subscribe to its advance
   *
   * @param callback - called on every block, since the slot the progress is counted in advances
   *   with each one. This is what drives a progress bar without polling
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async eraProgress(callback: SubCallback<EraProgress>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async eraProgress(
    callback?: SubCallback<EraProgress>
  ): Promise<EraProgress | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    type ProgressQueries = [
      typeof query.staking.activeEra,
      typeof query.staking.currentEra,
      typeof query.session.currentIndex,
      typeof query.babe.currentSlot,
      typeof query.babe.epochStart
    ];

    /* `babe.currentSlot` alone changes every block; the rest ride along on the same notification */
    const queries: QueryMultiParam<ProgressQueries> = [
      [query.staking.activeEra, undefined],
      [query.staking.currentEra, undefined],
      [query.session.currentIndex, undefined],
      [query.babe.currentSlot, undefined],
      [query.babe.epochStart, undefined],
    ];

    /*
     * `erasStartSessionIndex` is keyed by the active era, so it cannot join the multi query that
     *   reads the era itself. It changes once per era rather than once per block, so it is re-read
     *   only when the era does
     */
    let cachedFor: string | null = null;
    let startSession = new BigNumber(0);

    const readStartSession = async (era: BigNumber): Promise<BigNumber> => {
      if (cachedFor !== era.toString()) {
        const rawStartSession = await query.staking.erasStartSessionIndex(
          bigNumberToU32(era, context)
        );

        /* an era whose start the chain has pruned cannot anchor a count, so treat it as session 0 */
        startSession = rawStartSession.isSome
          ? u32ToBigNumber(rawStartSession.unwrap())
          : new BigNumber(0);
        cachedFor = era.toString();
      }

      return startSession;
    };

    /*
     * the slot an epoch began in is not stored anywhere — the runtime recomputes it from the
     *   genesis slot and the epoch index whenever it needs it, an identity that a chain which has
     *   skipped epochs no longer satisfies. What the chain does record is the *block* each epoch
     *   began on, and that block's header carries the BABE pre-digest naming the slot it was
     *   authored in. Reading it back gives an exact slot anchored inside the epoch itself.
     *
     * It costs two RPC round trips, paid once per rotation rather than once per block, and it
     *   reads a header rather than state, so a pruning node answers it as readily as an archive.
     *
     * Where the opening slots of an epoch produced no block the anchor is the first slot that
     *   did, so the count is short by however many were skipped at that boundary — a handful at
     *   most, and it cannot accumulate, since the next rotation re-anchors
     */
    let cachedForBlock: string | null = null;
    let epochStart = new BigNumber(0);

    const readEpochStartSlot = async (rawEpochStart: ITuple<[u32, u32]>): Promise<BigNumber> => {
      /* the chain writes `epochStart` on rotation, and treats epoch 0 as opening at block 1 */
      const startBlock = u32ToBigNumber(rawEpochStart[1]);
      const anchorBlock = startBlock.isZero() ? new BigNumber(1) : startBlock;

      if (cachedForBlock !== anchorBlock.toString()) {
        epochStart = await getSlotAtBlock(context, anchorBlock);
        cachedForBlock = anchorBlock.toString();
      }

      return epochStart;
    };

    const assertActiveEra = (raw: EraProgressReads): void => {
      if (raw[0].isNone) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'There is no active staking era',
        });
      }
    };

    if (callback) {
      context.assertSupportsSubscription();

      return requestMulti<ProgressQueries>(context, queries, async raw => {
        assertActiveEra(raw);

        const [eraStartSession, epochStartSlot] = await Promise.all([
          readStartSession(u32ToBigNumber(raw[0].unwrap().index)),
          readEpochStartSlot(raw[4]),
        ]);

        await callback(
          assembleEraProgress(raw, eraStartSession, epochStartSlot, this.getConstants())
        );
      });
    }

    const raw = await requestMulti<ProgressQueries>(context, queries);

    assertActiveEra(raw);

    const [eraStartSession, epochStartSlot] = await Promise.all([
      readStartSession(u32ToBigNumber(raw[0].unwrap().index)),
      readEpochStartSlot(raw[4]),
    ]);

    return assembleEraProgress(raw, eraStartSession, epochStartSlot, this.getConstants());
  }

  /**
   * Retrieve the reward points earned by each validator in an era
   *
   * @param era - defaults to the active era
   *
   * @note points are how the era's reward is split between validators. A validator that authored no
   *   blocks in the era is absent rather than present with zero
   */
  public async getEraRewardPoints(era?: BigNumber): Promise<EraRewardPoints>;

  /**
   * Retrieve the reward points earned by each validator in an era, and subscribe to them
   *
   * @param callback - called as points are credited. Points accrue block by block as validators
   *   author, so for the active era this is a live leaderboard
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note only the active era changes. Subscribing to a past era is allowed and simply calls back
   *   once, since the chain has finished writing it
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async getEraRewardPoints(callback: SubCallback<EraRewardPoints>): Promise<UnsubCallback>;

  /**
   * Retrieve the reward points earned by each validator in a specific era, and subscribe to them
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async getEraRewardPoints(
    era: BigNumber,
    callback: SubCallback<EraRewardPoints>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getEraRewardPoints(
    eraOrCallback?: BigNumber | SubCallback<EraRewardPoints>,
    maybeCallback?: SubCallback<EraRewardPoints>
  ): Promise<EraRewardPoints | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const era = BigNumber.isBigNumber(eraOrCallback) ? eraOrCallback : undefined;
    const callback = BigNumber.isBigNumber(eraOrCallback) ? maybeCallback : eraOrCallback;

    const rawEra = await this.asRawEra(era);

    const assembleResult = (rawPoints: PalletStakingEraRewardPoints): EraRewardPoints => {
      const { total, individual } = rawPoints;

      return {
        total: u32ToBigNumber(total),
        individual: [...individual.entries()].map(([rawAccountId, rawIndividualPoints]) => ({
          account: new Account({ address: accountIdToString(rawAccountId) }, context),
          points: u32ToBigNumber(rawIndividualPoints),
        })),
      };
    };

    if (callback) {
      context.assertSupportsSubscription();

      return query.staking.erasRewardPoints(rawEra, rawPoints => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(rawPoints));
      });
    }

    return assembleResult(await query.staking.erasRewardPoints(rawEra));
  }

  /**
   * Retrieve the total POLYX paid out to validators and their nominators for an era
   *
   * @param era - defaults to the active era
   *
   * @returns `null` for an era the chain has not paid out, i.e. one still running or older than the
   *   history depth
   */
  public async getEraValidatorReward(era?: BigNumber): Promise<BigNumber | null> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawEra = await this.asRawEra(era);

    const rawReward = await query.staking.erasValidatorReward(rawEra);

    return rawReward.isNone ? null : balanceToBigNumber(rawReward.unwrap());
  }

  /**
   * Retrieve the session an era started at
   *
   * @param era - defaults to the active era
   *
   * @returns `null` for an era outside the chain's history depth
   */
  public async getEraStartSession(era?: BigNumber): Promise<BigNumber | null> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawEra = await this.asRawEra(era);

    const rawIndex = await query.staking.erasStartSessionIndex(rawEra);

    return rawIndex.isNone ? null : u32ToBigNumber(rawIndex.unwrap());
  }

  /**
   * Retrieve how much POLYX was backing a validator in an era, and how it was split
   *
   * @param args.validator - the validator's Account or address
   * @param args.era - defaults to the active era
   *
   * @returns `null` if the Account was not in the era's validator set
   */
  public async getEraExposure(args: {
    validator: Account | string;
    era?: BigNumber;
  }): Promise<EraExposure | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const { validator, era } = args;

    const rawEra = await this.asRawEra(era);
    const rawAddress = stringToAccountId(asAccount(validator, context).address, context);

    const rawOverview = await query.staking.erasStakersOverview(rawEra, rawAddress);

    if (rawOverview.isNone) {
      return null;
    }

    const { total, own, nominatorCount, pageCount } = rawOverview.unwrap();

    return {
      total: balanceToBigNumber(total.unwrap()),
      own: balanceToBigNumber(own.unwrap()),
      nominatorCount: u32ToBigNumber(nominatorCount),
      pageCount: u32ToBigNumber(pageCount),
    };
  }

  /**
   * Retrieve one page of the nominators backing a validator in an era
   *
   * @param args.validator - the validator's Account or address
   * @param args.page - defaults to the first page. Read `pageCount` from
   *   {@link api/client/Staking!Staking.getEraExposure | getEraExposure} for how many there are
   * @param args.era - defaults to the active era
   *
   * @returns `null` if the page does not exist
   *
   * @note nominators are paged by the chain so that a payout fits in a block, which is why this is
   *   not returned as part of the exposure
   */
  public async getEraNominators(args: {
    validator: Account | string;
    page?: BigNumber;
    era?: BigNumber;
  }): Promise<EraNominators | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const { validator, page = new BigNumber(0), era } = args;

    const rawEra = await this.asRawEra(era);
    const rawAddress = stringToAccountId(asAccount(validator, context).address, context);
    const rawPage = bigNumberToU32(page, context);

    const rawExposure = await query.staking.erasStakersPaged(rawEra, rawAddress, rawPage);

    if (rawExposure.isNone) {
      return null;
    }

    const { pageTotal, others } = rawExposure.unwrap();

    return {
      pageTotal: balanceToBigNumber(pageTotal.unwrap()),
      nominators: others.map(({ who, value }) => ({
        account: new Account({ address: accountIdToString(who) }, context),
        value: balanceToBigNumber(value.unwrap()),
      })),
    };
  }

  /**
   * Retrieve the current phase of the validator election
   *
   * @note staking transactions behave differently while an election is open, so a UI should say
   *   when the phase is anything other than `Off`
   */
  public async getElectionPhase(): Promise<ElectionPhase>;

  /**
   * Retrieve the current phase of the validator election, and subscribe to it
   *
   * @param callback - called whenever the phase changes, which happens several times an era
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note this is the read that most benefits from a subscription — a warning that only appears on
   *   the next poll appears after the user has already acted
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async getElectionPhase(callback: SubCallback<ElectionPhase>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getElectionPhase(
    callback?: SubCallback<ElectionPhase>
  ): Promise<ElectionPhase | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    if (callback) {
      context.assertSupportsSubscription();

      return query.electionProviderMultiPhase.currentPhase(rawPhase => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(ElectionPhase[rawPhase.type]);
      });
    }

    const rawPhase = await query.electionProviderMultiPhase.currentPhase();

    return ElectionPhase[rawPhase.type];
  }

  /**
   * @hidden
   *
   * Resolve an optional era argument to the era to query, defaulting to the active one
   */
  private async asRawEra(era?: BigNumber): Promise<u32> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    if (era) {
      return bigNumberToU32(era, context);
    }

    const rawActiveEra = await query.staking.activeEra();

    if (rawActiveEra.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'There is no active staking era',
      });
    }

    return rawActiveEra.unwrap().index;
  }
}
