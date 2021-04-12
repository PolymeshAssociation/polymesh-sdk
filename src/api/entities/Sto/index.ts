import { Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Fundraiser, FundraiserName } from 'polymesh-types/types';

import {
  closeSto,
  Context,
  Entity,
  Identity,
  investInSto,
  InvestInStoParams,
  modifyStoTimes,
  ModifyStoTimesParams,
  PolymeshError,
  toggleFreezeSto,
} from '~/internal';
import { investments } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { Ensured, ErrorCode, ResultSet, SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { fundraiserToStoDetails, numberToU64, stringToTicker } from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod } from '~/utils/internal';

import { Investment, StoDetails } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

/**
 * Represents a Security Token Offering in the Polymesh blockchain
 */
export class Sto extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * identifier number of the Offering
   */
  public id: BigNumber;

  /**
   * ticker of the Security Token being offered
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, ticker } = identifiers;

    this.id = id;
    this.ticker = ticker;

    this.freeze = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSto, { ticker, id, freeze: true }] },
      context
    );
    this.unfreeze = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSto, { ticker, id, freeze: false }] },
      context
    );
    this.close = createProcedureMethod(
      { getProcedureAndArgs: () => [closeSto, { ticker, id }] },
      context
    );
    this.modifyTimes = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyStoTimes, { ticker, id, ...args }] },
      context
    );
    this.invest = createProcedureMethod(
      { getProcedureAndArgs: args => [investInSto, { ticker, id, ...args }] },
      context
    );
  }

  /**
   * Retrieve the STO's details
   *
   * @note can be subscribed to
   */
  public details(): Promise<StoDetails>;
  public details(callback: SubCallback<StoDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(callback?: SubCallback<StoDetails>): Promise<StoDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
      id,
      ticker,
      context,
    } = this;

    const assembleResult = (
      rawFundraiser: Option<Fundraiser>,
      rawName: FundraiserName
    ): StoDetails => {
      if (rawFundraiser.isSome) {
        return fundraiserToStoDetails(rawFundraiser.unwrap(), rawName, context);
      } else {
        throw new PolymeshError({
          code: ErrorCode.FatalError,
          message: 'STO no longer exists',
        });
      }
    };

    const rawTicker = stringToTicker(ticker, context);
    const rawU64 = numberToU64(id, context);

    const fetchName = (): Promise<FundraiserName> => sto.fundraiserNames(rawTicker, rawU64);

    if (callback) {
      const fundraiserName = await fetchName();
      return sto.fundraisers(rawTicker, rawU64, fundraiserData => {
        callback(assembleResult(fundraiserData, fundraiserName));
      });
    }

    const [fundraiser, name] = await Promise.all([sto.fundraisers(rawTicker, rawU64), fetchName()]);

    return assembleResult(fundraiser, name);
  }

  /**
   * Close the STO
   */
  public close: ProcedureMethod<void, void>;

  /**
   * Freeze the STO
   *
   * @note required role:
   *   - Security Token Primary Issuance Agent
   */
  public freeze: ProcedureMethod<void, Sto>;

  /**
   * Unfreeze the STO
   *
   * @note required role:
   *   - Security Token Primary Issuance Agent
   */
  public unfreeze: ProcedureMethod<void, Sto>;

  /**
   * Modify the start/end time of the STO
   *
   * @param args.start - new start time (optional, will be left the same if not passed)
   * @param args.end - new end time (optional, will be left th same if not passed). A null value means the STO doesn't end
   *
   * @throws if:
   *   - Trying to modify the start time on an STO that already started
   *   - Trying to modify anything on an STO that already ended
   *   - Trying to change start or end time to a past date
   *
   * @note required role:
   *   - Security Token Primary Issuance Agent
   */
  public modifyTimes: ProcedureMethod<ModifyStoTimesParams, void>;

  /**
   * Invest in the STO
   *
   * @param args.purchasePortfolio - portfolio in which the purchased Tokens will be stored
   * @param args.fundingPortfolio - portfolio from which funds will be withdrawn to pay for the Tokens
   * @param args.purchaseAmount - amount of tokens to purchase
   * @param args.maxPrice - maximum price to pay per Token (optional)
   *
   * @note required roles:
   *   - Purchase Portfolio Custodian
   *   - Funding Portfolio Custodian
   */
  public invest: ProcedureMethod<InvestInStoParams, void>;

  /**
   * Retrieve all investments made on this STO
   *
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getInvestments(
    opts: {
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<Investment>> {
    const { context, id, ticker } = this;

    const { size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'investments'>>(
      investments({
        stoId: id.toNumber(),
        ticker: ticker,
        count: size,
        skip: start,
      })
    );

    const {
      data: { investments: investmentsResult },
    } = result;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { items, totalCount: count } = investmentsResult!;

    const data: Investment[] = [];
    let next = null;

    if (items) {
      items.forEach(item => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const { investor: did, offeringTokenAmount, raiseTokenAmount } = item!;
        /* eslint-enabled @typescript-eslint/no-non-null-assertion */

        data.push({
          investor: new Identity({ did }, context),
          soldAmount: new BigNumber(offeringTokenAmount).shiftedBy(-6),
          investedAmount: new BigNumber(raiseTokenAmount).shiftedBy(-6),
        });
      });

      next = calculateNextKey(count, size, start);
    }

    return {
      data,
      next,
      count,
    };
  }
}
