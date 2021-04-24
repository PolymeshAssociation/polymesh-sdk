import { bool, Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, flatten, remove } from 'lodash';
import { Distribution } from 'polymesh-types/types';

import { Params as CorporateActionParams, UniqueIdentifiers } from '~/api/entities/CorporateAction';
import {
  Checkpoint,
  CheckpointSchedule,
  claimDividends,
  Context,
  CorporateAction,
  DefaultPortfolio,
  modifyDistributionCheckpoint,
  ModifyDistributionCheckpointParams,
  NumberedPortfolio,
  payDividends,
  PayDividendsParams,
  PolymeshError,
} from '~/internal';
import {
  CorporateActionKind,
  DistributionParticipant,
  DividendDistributionDetails,
  ErrorCode,
  IdentityBalance,
  TargetTreatment,
} from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { tuple } from '~/types/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  balanceToBigNumber,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  stringToIdentityId,
} from '~/utils/conversion';
import { createProcedureMethod, xor } from '~/utils/internal';

export interface DividendDistributionParams {
  origin: DefaultPortfolio | NumberedPortfolio;
  currency: string;
  perShare: BigNumber;
  maxAmount: BigNumber;
  expiryDate: null | Date;
  paymentDate: Date;
}

export type Params = Omit<CorporateActionParams, 'kind'> & DividendDistributionParams;

/**
 * Represents a Corporate Action via which a Security Token issuer wishes to distribute dividends
 *   between a subset of the Tokenholders (targets)
 */
export class DividendDistribution extends CorporateAction {
  /**
   * Portfolio from which the dividends will be distributed
   */
  public origin: DefaultPortfolio | NumberedPortfolio;

  /**
   * ticker of the currency in which dividends are being distibuted
   */
  public currency: string;

  /**
   * amount of `currency` to pay for each share the Tokenholder holds
   */
  public perShare: BigNumber;

  /**
   * maximum amount of `currency` to be distributed. Distributions are "first come, first served", so funds can be depleted before
   *   every Tokenholder receives their corresponding amount
   */
  public maxAmount: BigNumber;

  /**
   * date after which dividends can no longer be paid/reclaimed. A null value means the distribution never expires
   */
  public expiryDate: null | Date;

  /**
   * date starting from which dividends can be paid/reclaimed
   */
  public paymentDate: Date;

  protected kind!: CorporateActionKind.UnpredictableBenefit;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const {
      origin,
      currency,
      perShare,
      maxAmount,
      expiryDate,
      paymentDate,
      ...corporateActionArgs
    } = args;

    super({ ...corporateActionArgs, kind: CorporateActionKind.UnpredictableBenefit }, context);

    this.origin = origin;
    this.currency = currency;
    this.perShare = perShare;
    this.maxAmount = maxAmount;
    this.expiryDate = expiryDate;
    this.paymentDate = paymentDate;

    this.pay = createProcedureMethod(
      {
        getProcedureAndArgs: payDividendsArgs => [
          payDividends,
          { ...payDividendsArgs, distribution: this },
        ],
      },
      context
    );

    this.claim = createProcedureMethod(
      { getProcedureAndArgs: () => [claimDividends, { distribution: this }] },
      context
    );

    this.modifyCheckpoint = createProcedureMethod(
      {
        getProcedureAndArgs: modifyCheckpointArgs => [
          modifyDistributionCheckpoint,
          { distribution: this, ...modifyCheckpointArgs },
        ],
      },
      context
    );
  }

  /**
   * Claim the dividends corresponding to the current Identity
   */
  public claim: ProcedureMethod<void, void>;

  /**
   * Modify the Distribution's checkpoint
   */
  public modifyCheckpoint: ProcedureMethod<ModifyDistributionCheckpointParams, void>;

  /**
   * Transfer the corresponding share of the dividends to a list of Identities
   */
  public pay: ProcedureMethod<PayDividendsParams, void>;

  /**
   * Retrieve the Checkpoint associated with this Dividend Distribution. If the Checkpoint is scheduled and has not been created yet,
   *   the corresponding CheckpointSchedule is returned instead
   */
  public async checkpoint(): Promise<Checkpoint | CheckpointSchedule> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const checkpoint = (await super.checkpoint())!;

    return checkpoint;
  }

  /**
   * Retrieve whether the Distribution exists
   */
  public async exists(): Promise<boolean> {
    const distribution = await this.fetchDistribution();

    return distribution.isSome;
  }

  /**
   * Retrieve details associated with this Dividend Distribution
   */
  public async details(): Promise<DividendDistributionDetails> {
    const distribution = await this.fetchDistribution();

    if (distribution.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Dividend Distribution no longer exists',
      });
    }

    const { reclaimed, remaining } = distribution.unwrap();

    return {
      remainingFunds: balanceToBigNumber(remaining),
      fundsReclaimed: boolToBoolean(reclaimed),
    };
  }

  /**
   * Retrieve a comprehensive list of all Identities that are entitled to dividends in this Distribution (participants),
   *   the amount they are entitled to and whether they have been paid or not
   *
   * @note this request can take a lot of time with large amounts of TokenholdersgrowsZ
   * @note if the Distribution Checkpoint hasn't been created yet, the result will be an empty array.
   *   This is because the Distribution participants cannot be determined without a Checkpoint
   */
  public async getParticipants(): Promise<DistributionParticipant[]> {
    const {
      targets: { identities: targetIdentities, treatment },
      paymentDate,
      perShare,
    } = this;

    let balances: IdentityBalance[] = [];

    const checkpoint = await this.checkpoint();

    if (checkpoint instanceof CheckpointSchedule) {
      return [];
    }

    let allFetched = false;
    let start: string | undefined;

    while (!allFetched) {
      const { data, next } = await checkpoint.allBalances({ size: MAX_PAGE_SIZE, start });
      start = (next as string) || undefined;
      allFetched = !next;
      balances = [...balances, ...data];
    }

    const isExclusion = treatment === TargetTreatment.Exclude;

    const participants: DistributionParticipant[] = [];
    const clonedTargets = [...targetIdentities];
    balances.forEach(({ identity: { did }, identity, balance }) => {
      const isTarget = !!remove(clonedTargets, ({ did: targetDid }) => did === targetDid).length;

      if (balance.gt(0) && xor(isTarget, isExclusion)) {
        participants.push({
          identity,
          amount: balance.multipliedBy(perShare),
          paid: false,
        });
      }
    });

    // participants can't be paid before the payment date
    if (paymentDate < new Date()) {
      return participants;
    }

    const paidStatuses = await this.getParticipantStatuses(participants);

    return paidStatuses.map((paid, index) => ({ ...participants[index], paid }));
  }

  /**
   * @hidden
   */
  private fetchDistribution(): Promise<Option<Distribution>> {
    const { ticker, id, context } = this;

    return context.polymeshApi.query.capitalDistribution.distributions(
      corporateActionIdentifierToCaId({ ticker, localId: id }, context)
    );
  }

  /**
   * @hidden
   */
  private async getParticipantStatuses(
    participants: DistributionParticipant[]
  ): Promise<boolean[]> {
    const { ticker, id: localId, context } = this;

    /*
       For optimization, we separate the participants into chunks that can fit into one multi call
       and then sequentially perform bunches of said multi requests in parallel
     */
    const participantChunks = chunk(participants, MAX_PAGE_SIZE);
    const parallelCallChunks = chunk(participantChunks, MAX_CONCURRENT_REQUESTS);

    let paidStatuses: boolean[] = [];

    const caId = corporateActionIdentifierToCaId({ localId, ticker }, context);

    await P.each(parallelCallChunks, async callChunk => {
      const parallelMultiCalls = callChunk.map(participantChunk => {
        const multiParams = participantChunk.map(({ identity: { did } }) =>
          tuple(caId, stringToIdentityId(did, context))
        );

        return context.polymeshApi.query.capitalDistribution.holderPaid.multi<bool>(multiParams);
      });

      const results = await Promise.all(parallelMultiCalls);

      paidStatuses = [...paidStatuses, ...flatten(results).map(paid => boolToBoolean(paid))];
    });

    return paidStatuses;
  }
}
