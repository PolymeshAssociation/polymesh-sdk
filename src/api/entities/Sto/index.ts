import { Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import {
  closeSto,
  Context,
  Entity,
  investInSto,
  InvestInStoParams,
  modifyStoTimes,
  ModifyStoTimesParams,
  PolymeshError,
  toggleFreezeSto,
} from '~/internal';
import { Fundraiser } from '~/polkadot/polymesh/types';
import { ErrorCode, StoDetails, SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { fundraiserToStoDetails, numberToU64, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

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
      () => [toggleFreezeSto, { ticker, id, freeze: true }],
      context
    );
    this.unfreeze = createProcedureMethod(
      () => [toggleFreezeSto, { ticker, id, freeze: false }],
      context
    );
    this.close = createProcedureMethod(() => [closeSto, { ticker, id }], context);
    this.modifyTimes = createProcedureMethod(
      args => [modifyStoTimes, { ticker, id, ...args }],
      context
    );
    this.invest = createProcedureMethod(args => [investInSto, { ticker, id, ...args }], context);
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

    const assembleResult = (rawFundraiser: Option<Fundraiser>): StoDetails => {
      if (rawFundraiser.isSome) {
        return fundraiserToStoDetails(rawFundraiser.unwrap(), context);
      } else {
        throw new PolymeshError({
          code: ErrorCode.FatalError,
          message: 'STO no longer exists',
        });
      }
    };

    const rawTicker = stringToTicker(ticker, context);
    const rawU64 = numberToU64(id, context);

    if (callback) {
      return sto.fundraisers(rawTicker, rawU64, fundraiserData => {
        callback(assembleResult(fundraiserData));
      });
    }

    const fundraiser = await sto.fundraisers(rawTicker, rawU64);

    return assembleResult(fundraiser);
  }

  /**
   * Close the STO
   */
  public close: ProcedureMethod<void, void>;

  /**
   * Freeze the STO
   */
  public freeze: ProcedureMethod<void, Sto>;

  /**
   * Unfreeze the STO
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
   */
  public modifyTimes: ProcedureMethod<ModifyStoTimesParams, void>;

  /**
   * Invest in the STO
   *
   * @param args.investmentPortfolio -
   * @param args.fundingPortfolio -
   * @param args.investmentAmount -
   * @param args.maxPrice -
   *
   * @note required roles:
   *   -
   */
  public invest: ProcedureMethod<InvestInStoParams, void>;
}
