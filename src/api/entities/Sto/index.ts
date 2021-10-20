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
import {
  Ensured,
  ErrorCode,
  NoArgsProcedureMethod,
  ProcedureMethod,
  ResultSet,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { fundraiserToStoDetails, numberToU64, stringToTicker } from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, toHumanReadable } from '~/utils/internal';

import { Investment, StoDetails } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

interface HumanReadable {
  id: string;
  ticker: string;
}

/**
 * Represents a Security Token Offering in the Polymesh blockchain
 */
export class Sto extends Entity<UniqueIdentifiers, HumanReadable> {
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
      {
        getProcedureAndArgs: () => [toggleFreezeSto, { ticker, id, freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeSto, { ticker, id, freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.close = createProcedureMethod(
      { getProcedureAndArgs: () => [closeSto, { ticker, id }], voidArgs: true },
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
  public close: NoArgsProcedureMethod<void>;

  /**
   * Freeze the STO
   */
  public freeze: NoArgsProcedureMethod<Sto>;

  /**
   * Unfreeze the STO
   */
  public unfreeze: NoArgsProcedureMethod<Sto>;

  /**
   * Modify the start/end time of the STO
   *
   * @throws if:
   *   - Trying to modify the start time on an STO that already started
   *   - Trying to modify anything on an STO that already ended
   *   - Trying to change start or end time to a past date
   */
  public modifyTimes: ProcedureMethod<ModifyStoTimesParams, void>;

  /**
   * Invest in the STO
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

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const { items, totalCount: count } = investmentsResult!;

    const data: Investment[] = [];

    items!.forEach(item => {
      const { investor: did, offeringTokenAmount, raiseTokenAmount } = item!;

      data.push({
        investor: new Identity({ did }, context),
        soldAmount: new BigNumber(offeringTokenAmount).shiftedBy(-6),
        investedAmount: new BigNumber(raiseTokenAmount).shiftedBy(-6),
      });
    });
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Determine whether this STO exists on chain
   */
  public async exists(): Promise<boolean> {
    const { ticker, id, context } = this;

    const fundraiser = await context.polymeshApi.query.sto.fundraisers(
      stringToTicker(ticker, context),
      numberToU64(id, context)
    );

    return fundraiser.isSome;
  }

  /**
   * Return the Sto's ID and Token ticker
   */
  public toJson(): HumanReadable {
    const { ticker, id } = this;

    return toHumanReadable({
      ticker,
      id,
    });
  }
}
