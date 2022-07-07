import { Option } from '@polkadot/types';
import { BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import { PalletCorporateActionsDistribution } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, flatten, remove } from 'lodash';

import {
  HumanReadable as CorporateActionHumanReadable,
  Params as CorporateActionParams,
  UniqueIdentifiers,
} from '~/api/entities/CorporateAction';
import {
  Checkpoint,
  CheckpointSchedule,
  claimDividends,
  Context,
  CorporateActionBase,
  DefaultPortfolio,
  Identity,
  modifyDistributionCheckpoint,
  NumberedPortfolio,
  payDividends,
  PolymeshError,
  reclaimDividendDistributionFunds,
} from '~/internal';
import { getHistoryOfPaymentEventsForCa, getWithholdingTaxesOfCa } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  CorporateActionKind,
  DistributionPayment,
  DividendDistributionDetails,
  ErrorCode,
  IdentityBalance,
  InputCaCheckpoint,
  ModifyCaCheckpointParams,
  NoArgsProcedureMethod,
  PayDividendsParams,
  ProcedureMethod,
  ResultSet,
  TargetTreatment,
} from '~/types';
import { Ensured, HumanReadableType, Modify, QueryReturnType, tuple } from '~/types/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_DECIMALS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  hashToString,
  stringToIdentityId,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  getIdentity,
  toHumanReadable,
  xor,
} from '~/utils/internal';

import { DistributionParticipant } from './types';

export interface HumanReadable extends CorporateActionHumanReadable {
  origin: HumanReadableType<DefaultPortfolio | NumberedPortfolio>;
  currency: string;
  perShare: string;
  maxAmount: string;
  expiryDate: string | null;
  paymentDate: string;
}

export interface DividendDistributionParams {
  origin: DefaultPortfolio | NumberedPortfolio;
  currency: string;
  perShare: BigNumber;
  maxAmount: BigNumber;
  expiryDate: null | Date;
  paymentDate: Date;
}

export type Params = CorporateActionParams & DividendDistributionParams;

const notExistsMessage = 'The Dividend Distribution no longer exists';

/**
 * Represents a Corporate Action via which an Asset issuer wishes to distribute dividends
 *   between a subset of the Asset Holders (targets)
 */
export class DividendDistribution extends CorporateActionBase {
  /**
   * Portfolio from which the dividends will be distributed
   */
  public origin: DefaultPortfolio | NumberedPortfolio;

  /**
   * ticker of the currency in which dividends are being distributed
   */
  public currency: string;

  /**
   * amount of `currency` to pay for each share held by the Asset Holders
   */
  public perShare: BigNumber;

  /**
   * maximum amount of `currency` to be distributed. Distributions are "first come, first served", so funds can be depleted before
   *   every Asset Holder receives their corresponding amount
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

  /**
   * type of dividend distribution being represented. The chain enforces it to be either PredictableBenefit or UnpredictableBenefit
   */
  protected declare kind:
    | CorporateActionKind.UnpredictableBenefit
    | CorporateActionKind.PredictableBenefit;

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

    super({ ...corporateActionArgs }, context);

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
      { getProcedureAndArgs: () => [claimDividends, { distribution: this }], voidArgs: true },
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
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Claim the Dividends corresponding to the signing Identity
   *
   * @note if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)
   */
  public claim: NoArgsProcedureMethod<void>;

  /**
   * Modify the Distribution's Checkpoint
   */
  public modifyCheckpoint: ProcedureMethod<
    Modify<
      ModifyCaCheckpointParams,
      {
        checkpoint: InputCaCheckpoint;
      }
    >,
    void
  >;

  /**
   * Transfer the corresponding share of the dividends to a list of Identities
   *
   * @note due to performance issues, we do not validate that the distribution has enough remaining funds to pay the corresponding amount to the supplied Identities
   * @note if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)
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
  public reclaimFunds: NoArgsProcedureMethod<void>;

  /**
   * Retrieve the Checkpoint associated with this Dividend Distribution. If the Checkpoint is scheduled and has not been created yet,
   *   the corresponding CheckpointSchedule is returned instead
   */
  public override async checkpoint(): Promise<Checkpoint | CheckpointSchedule> {
    const exists = await this.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const checkpoint = await super.checkpoint();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return checkpoint!;
  }

  /**
   * Retrieve whether the Distribution exists
   */
  public override async exists(): Promise<boolean> {
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
        message: notExistsMessage,
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
   * @note this request can take a lot of time with large amounts of Asset Holders
   * @note if the Distribution Checkpoint hasn't been created yet, the result will be an empty array.
   *   This is because the Distribution participants cannot be determined without a Checkpoint
   */
  public async getParticipants(): Promise<DistributionParticipant[]> {
    const {
      targets: { identities: targetIdentities, treatment },
      paymentDate,
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

    balances.forEach(({ identity, balance }) => {
      const isTarget = !!remove(clonedTargets, target => identity.isEqual(target)).length;
      if (balance.gt(0) && xor(isTarget, isExclusion)) {
        participants.push(this.assembleParticipant(identity, balance));
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
   * @param args.identity - defaults to the signing Identity
   *
   * @note if the Distribution Checkpoint hasn't been created yet, the result will be null.
   *   This is because the Distribution participant's corresponding payment cannot be determined without a Checkpoint
   */
  public async getParticipant(args?: {
    identity: string | Identity;
  }): Promise<DistributionParticipant | null> {
    const {
      id: localId,
      asset: { ticker },
      targets: { identities: targetIdentities, treatment },
      paymentDate,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const checkpoint = await this.checkpoint();

    if (checkpoint instanceof CheckpointSchedule) {
      return null;
    }

    const [identity, balance] = await Promise.all([
      getIdentity(args?.identity, context),
      checkpoint.balance(args),
    ]);

    const isTarget = !!targetIdentities.find(target => identity.isEqual(target));

    let participant: DistributionParticipant;

    const isExclusion = treatment === TargetTreatment.Exclude;

    if (balance.gt(0) && xor(isTarget, isExclusion)) {
      participant = this.assembleParticipant(identity, balance);
    } else {
      return null;
    }

    // participant can't be paid before the payment date
    if (paymentDate < new Date()) {
      return participant;
    }

    const rawDid = stringToIdentityId(identity.did, context);
    const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
    const holderPaid = await query.capitalDistribution.holderPaid([rawCaId, rawDid]);
    const paid = boolToBoolean(holderPaid);

    return { ...participant, paid };
  }

  /**
   * @hidden
   */
  private assembleParticipant(identity: Identity, balance: BigNumber): DistributionParticipant {
    const { defaultTaxWithholding, taxWithholdings, perShare } = this;

    let taxWithholdingPercentage = defaultTaxWithholding;

    const taxWithholding = taxWithholdings.find(({ identity: taxIdentity }) =>
      identity.isEqual(taxIdentity)
    );
    if (taxWithholding) {
      taxWithholdingPercentage = taxWithholding.percentage;
    }

    const amount = balance.multipliedBy(perShare);

    const amountAfterTax = amount
      .minus(
        amount.multipliedBy(taxWithholdingPercentage).dividedBy(100).decimalPlaces(MAX_DECIMALS)
      )
      .decimalPlaces(MAX_DECIMALS);

    return {
      identity,
      amount,
      taxWithholdingPercentage,
      amountAfterTax,
      paid: false,
    };
  }

  /**
   * @hidden
   */
  private fetchDistribution(): Promise<Option<PalletCorporateActionsDistribution>> {
    const {
      asset: { ticker },
      id,
      context,
    } = this;

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
    const {
      id,
      asset: { ticker },
      context,
    } = this;

    const taxPromise = context.queryMiddleware<Ensured<Query, 'getWithholdingTaxesOfCA'>>(
      getWithholdingTaxesOfCa({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CAId: { ticker, localId: id.toNumber() },
      })
    );

    const [exists, result] = await Promise.all([this.exists(), taxPromise]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { taxes } = result.data.getWithholdingTaxesOfCA!;

    return new BigNumber(taxes);
  }

  /**
   * Retrieve the payment history for this Distribution
   *
   * @note uses the middleware
   * @note supports pagination
   */
  public async getPaymentHistory(
    opts: { size?: BigNumber; start?: BigNumber } = {}
  ): Promise<ResultSet<DistributionPayment>> {
    const {
      id,
      asset: { ticker },
      context,
      context: {
        polymeshApi: {
          query: { system },
        },
      },
    } = this;
    const { size, start } = opts;

    const paymentsPromise = context.queryMiddleware<
      Ensured<Query, 'getHistoryOfPaymentEventsForCA'>
    >(
      getHistoryOfPaymentEventsForCa({
        CAId: { ticker, localId: id.toNumber() },
        fromDate: null,
        toDate: null,
        count: size?.toNumber(),
        skip: start?.toNumber(),
      })
    );

    const [exists, result] = await Promise.all([this.exists(), paymentsPromise]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const {
      data: { getHistoryOfPaymentEventsForCA: getHistoryOfPaymentEventsForCaResult },
    } = result;

    const { items, totalCount } = getHistoryOfPaymentEventsForCaResult;

    const count = new BigNumber(totalCount);
    const data: Omit<DistributionPayment, 'blockHash'>[] = [];
    const multiParams: BlockNumber[] = [];

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    items!.forEach(item => {
      const { blockId, datetime, eventDid: did, balance, tax } = item!;

      const blockNumber = new BigNumber(blockId);
      multiParams.push(bigNumberToU32(blockNumber, context));
      data.push({
        blockNumber,
        date: new Date(datetime),
        target: new Identity({ did }, context),
        amount: new BigNumber(balance).shiftedBy(-6),
        withheldTax: new BigNumber(tax).shiftedBy(-4),
      });
    });
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const next = calculateNextKey(count, size, start);

    let hashes: Hash[] = [];

    if (multiParams.length) {
      hashes = await system.blockHash.multi<QueryReturnType<typeof system.blockHash>>(multiParams);
    }

    return {
      data: data.map((payment, index) => ({
        ...payment,
        blockHash: hashToString(hashes[index]),
      })),
      next,
      count,
    };
  }

  /**
   * @hidden
   */
  private async getParticipantStatuses(
    participants: DistributionParticipant[]
  ): Promise<boolean[]> {
    const {
      asset: { ticker },
      id: localId,
      context: {
        polymeshApi: {
          query: { capitalDistribution },
        },
      },
      context,
    } = this;

    /*
     * For optimization, we separate the participants into chunks that can fit into one multi call
     * and then sequentially perform bunches of said multi requests in parallel
     */
    const participantChunks = chunk(participants, MAX_PAGE_SIZE.toNumber());
    const parallelCallChunks = chunk(participantChunks, MAX_CONCURRENT_REQUESTS);

    let paidStatuses: boolean[] = [];

    const caId = corporateActionIdentifierToCaId({ localId, ticker }, context);

    await P.each(parallelCallChunks, async callChunk => {
      const parallelMultiCalls = callChunk.map(participantChunk => {
        const multiParams = participantChunk.map(({ identity: { did } }) =>
          tuple(caId, stringToIdentityId(did, context))
        );

        return capitalDistribution.holderPaid.multi<
          QueryReturnType<typeof capitalDistribution.holderPaid>
        >(multiParams);
      });

      const results = await Promise.all(parallelMultiCalls);

      paidStatuses = [...paidStatuses, ...flatten(results).map(paid => boolToBoolean(paid))];
    });

    return paidStatuses;
  }

  /**
   * Return the Dividend Distribution's static data
   */
  public override toHuman(): HumanReadable {
    const { origin, currency, perShare, maxAmount, expiryDate, paymentDate } = this;

    const parentReadable = super.toHuman();

    return {
      ...toHumanReadable({ origin, currency, perShare, maxAmount, expiryDate, paymentDate }),
      ...parentReadable,
    };
  }
}
