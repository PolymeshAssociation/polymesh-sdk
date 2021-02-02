import { Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import { cancelSto, CancelStoParams, Context, Entity, PolymeshError } from '~/internal';
import { Fundraiser } from '~/polkadot/polymesh/types';
import { ErrorCode, SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { fundraiserToStoDetails, numberToU64, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { StoDetails } from './types';

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

    this.close = createProcedureMethod(args => [cancelSto, { ticker, ...args }], context);
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
  public close: ProcedureMethod<CancelStoParams, void>;
}
