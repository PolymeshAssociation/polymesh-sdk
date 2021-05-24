import { bool, Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, flatten, remove } from 'lodash';

import { Params as CorporateActionParams, UniqueIdentifiers } from '~/api/entities/CorporateAction';
import {
  Checkpoint,
  CheckpointSchedule,
  claimDividends,
  Context,
  CorporateAction,
  DefaultPortfolio,
  Identity,
  modifyDistributionCheckpoint,
  ModifyDistributionCheckpointParams,
  NumberedPortfolio,
  payDividends,
  PayDividendsParams,
  PolymeshError,
  reclaimDividendDistributionFunds,
} from '~/internal';
import { getWithholdingTaxesOfCa } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { Distribution } from '~/polkadot';
import {
  CorporateActionKind,
  DividendDistributionDetails,
  Ensured,
  ErrorCode,
  IdentityBalance,
  ProcedureMethod,
  TargetTreatment,
} from '~/types';
import { tuple } from '~/types/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  balanceToBigNumber,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  stringToIdentityId,
} from '~/utils/conversion';
import { createProcedureMethod, getDid, xor } from '~/utils/internal';

import { DistributionParticipant } from './types';

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

    this.reclaimFunds = createProcedureMethod(
      {
        getProcedureAndArgs: () => [reclaimDividendDistributionFunds, { distribution: this }],
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
   * Reclaim any remaining funds back to the origin Portfolio. This can only be done after the Distribution has expired
   *
   * @note withheld taxes are also reclaimed in the same transaction
   *
   * @note required roles:
   *   - Origin Portfolio Custodian
   */
  public reclaimFunds: ProcedureMethod<void, void>;

  /**
   * Retrieve the Checkpoint associated with this Dividend Distribution. If the Checkpoint is scheduled and has not been created yet,
   *   the corresponding CheckpointSchedule is returned instead
   */
  public async checkpoint(): Promise<Checkpoint | CheckpointSchedule> {
    const checkpoint = await super.checkpoint();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return checkpoint!;
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
   * @note this request can take a lot of time with large amounts of Tokenholders
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
   * Retrieve an Identity that is entitled to dividends in this Distribution (participant),
   *   the amount it is entitled to and whether it has been paid or not
   *
   * @param args.identity - defaults to the current Identity
   *
   * @note if the Distribution Checkpoint hasn't been created yet, the result will be null.
   *   This is because the Distribution participant's corresponding payment cannot be determined without a Checkpoint
   */
  public async getParticipant(args?: {
    identity: string | Identity;
  }): Promise<DistributionParticipant | null> {
    const {
      id: localId,
      ticker,
      targets: { identities: targetIdentities, treatment },
      paymentDate,
      perShare,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const checkpoint = await this.checkpoint();

    if (checkpoint instanceof CheckpointSchedule) {
      return null;
    }

    const isExclusion = treatment === TargetTreatment.Exclude;

    const [did, balance] = await Promise.all([
      getDid(args?.identity, context),
      checkpoint.balance(args),
    ]);

    const identity = new Identity({ did }, context);

    const isTarget = !!targetIdentities.find(({ did: targetDid }) => did === targetDid);

    let participant: DistributionParticipant;

    if (balance.gt(0) && xor(isTarget, isExclusion)) {
      participant = {
        identity,
        amount: balance.multipliedBy(perShare),
        paid: false,
      };
    } else {
      return null;
    }

    // participant can't be paid before the payment date
    if (paymentDate < new Date()) {
      return participant;
    }

    const rawDid = stringToIdentityId(did, context);
    const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
    const holderPaid = await query.capitalDistribution.holderPaid([rawCaId, rawDid]);
    const paid = boolToBoolean(holderPaid);

    return { ...participant, paid };
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
   * Retrieve the amount of taxes that have been withheld up to this point in this Distribution
   *
   * @note uses the middleware
   */
  public async getWithheldTax(): Promise<BigNumber> {
    const { id, ticker, context } = this;

    const result = await context.queryMiddleware<Ensured<Query, 'getWithholdingTaxesOfCA'>>(
      getWithholdingTaxesOfCa({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CAId: { ticker, localId: id.toNumber() },
        fromDate: null,
        toDate: null,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { taxes } = result.data.getWithholdingTaxesOfCA!;

    return new BigNumber(taxes);
  }

  /**
   * @hidden
   */
  private async getParticipantStatuses(
    participants: DistributionParticipant[]
  ): Promise<boolean[]> {
    const { ticker, id: localId, context } = this;

    /*
     * For optimization, we separate the participants into chunks that can fit into one multi call
     * and then sequentially perform bunches of said multi requests in parallel
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
