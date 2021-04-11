import { QueryableStorageEntry } from '@polkadot/api/types';
import { SecurityToken as MeshToken, TickerRegistration } from 'polymesh-types/types';

import {
  Context,
  createSecurityToken,
  CreateSecurityTokenParams,
  Entity,
  Identity,
  reserveTicker,
  SecurityToken,
} from '~/internal';
import { SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { identityIdToString, momentToDate, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { TickerReservationDetails, TickerReservationStatus } from './types';

/**
 * Properties that uniquely identify a TickerReservation
 */
export interface UniqueIdentifiers {
  ticker: string;
}

/**
 * Represents a reserved token symbol in the Polymesh chain. Ticker reservations expire
 *   after a set length of time, after which they can be reserved by another Identity.
 *   A Ticker must be previously reserved by an Identity for that Identity to be able create a Security Token with it
 */
export class TickerReservation extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

  /**
   * reserved ticker
   */
  public ticker: string;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;

    this.extend = createProcedureMethod(
      { getProcedureAndArgs: () => [reserveTicker, { ticker, extendPeriod: true }] },
      context
    );

    this.createToken = createProcedureMethod(
      { getProcedureAndArgs: args => [createSecurityToken, { ...args, ticker }] },
      context
    );
  }

  /**
   * Retrieve the Reservation's owner, expiry date and status
   *
   * @note can be subscribed to
   */
  public details(): Promise<TickerReservationDetails>;
  public details(callback: SubCallback<TickerReservationDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<TickerReservationDetails>
  ): Promise<TickerReservationDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
          queryMulti,
        },
      },
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = (
      { owner: tickerOwner, expiry }: TickerRegistration,
      { owner_did: tokenOwner }: MeshToken
    ): TickerReservationDetails => {
      const tickerOwned = !tickerOwner.isEmpty;
      const tokenOwned = !tokenOwner.isEmpty;

      let status: TickerReservationStatus;
      let expiryDate: Date | null = null;
      const owner = tickerOwned
        ? new Identity({ did: identityIdToString(tickerOwner) }, context)
        : null;

      if (tokenOwned) {
        status = TickerReservationStatus.TokenCreated;
      } else if (tickerOwned) {
        status = TickerReservationStatus.Reserved;
        if (expiry.isSome) {
          expiryDate = momentToDate(expiry.unwrap());

          if (expiryDate < new Date()) {
            status = TickerReservationStatus.Free;
          }
        }
      } else {
        status = TickerReservationStatus.Free;
      }

      return {
        owner,
        expiryDate,
        status,
      };
    };

    if (callback) {
      // NOTE @monitz87: the type assertions are necessary because queryMulti doesn't play nice with strict types
      return queryMulti<[TickerRegistration, MeshToken]>(
        [
          [(asset.tickers as unknown) as QueryableStorageEntry<'promise'>, rawTicker],
          [(asset.tokens as unknown) as QueryableStorageEntry<'promise'>, rawTicker],
        ],
        ([registration, token]) => {
          callback(assembleResult(registration, token));
        }
      );
    }

    // NOTE @monitz87: the type assertions are necessary because queryMulti doesn't play nice with strict types
    const [tickerRegistration, securityToken] = await queryMulti<[TickerRegistration, MeshToken]>([
      [(asset.tickers as unknown) as QueryableStorageEntry<'promise'>, rawTicker],
      [(asset.tokens as unknown) as QueryableStorageEntry<'promise'>, rawTicker],
    ]);

    return assembleResult(tickerRegistration, securityToken);
  }

  /**
   * Extend the Reservation time period of the ticker for 60 days from now
   * to later use it in the creation of a Security Token.
   *
   * @note required role:
   *   - Ticker Owner
   */
  public extend: ProcedureMethod<void, TickerReservation>;

  /**
   * Create a Security Token using the reserved ticker
   *
   * @note the issuer DID will be set as the primary issuance agent
   *
   * @param args.totalSupply - amount of tokens that will be minted on creation
   * @param args.isDivisible - whether a single token can be divided into decimal parts
   * @param args.tokenType - type of security that the token represents (i.e. Equity, Debt, Commodity, etc)
   * @param args.tokenIdentifiers - domestic or international alphanumeric security identifiers for the token (ISIN, CUSIP, etc)
   * @param args.fundingRound - (optional) funding round in which the token currently is (Series A, Series B, etc)
   *
   * @note required role:
   *   - Ticker Owner
   */
  public createToken: ProcedureMethod<CreateSecurityTokenParams, SecurityToken>;
}
