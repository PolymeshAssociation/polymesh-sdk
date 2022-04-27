import { QueryableStorageEntry } from '@polkadot/api/types';
import { SecurityToken as MeshToken, TickerRegistration } from 'polymesh-types/types';

import {
  Asset,
  AuthorizationRequest,
  Context,
  createAsset,
  CreateAssetParams,
  Entity,
  Identity,
  reserveTicker,
  transferTickerOwnership,
  TransferTickerOwnershipParams,
} from '~/internal';
import { NoArgsProcedureMethod, ProcedureMethod, SubCallback, UnsubCallback } from '~/types';
import { QueryReturnType } from '~/types/utils';
import { identityIdToString, momentToDate, stringToTicker } from '~/utils/conversion';
import { assertTickerValid, createProcedureMethod } from '~/utils/internal';

import { TickerReservationDetails, TickerReservationStatus } from './types';

/**
 * Properties that uniquely identify a TickerReservation
 */
export interface UniqueIdentifiers {
  ticker: string;
}

/**
 * Represents a reserved Asset symbol in the Polymesh blockchain. Ticker reservations expire
 *   after a set length of time, after which they can be reserved by another Identity.
 *   A Ticker must be previously reserved by an Identity for that Identity to be able create an Asset with it
 */
export class TickerReservation extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
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

    assertTickerValid(ticker);

    this.ticker = ticker;

    this.extend = createProcedureMethod(
      {
        getProcedureAndArgs: () => [reserveTicker, { ticker, extendPeriod: true }],
        voidArgs: true,
      },
      context
    );

    this.createAsset = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createAsset, { ...args, ticker, reservationRequired: true }],
      },
      context
    );

    this.transferOwnership = createProcedureMethod(
      { getProcedureAndArgs: args => [transferTickerOwnership, { ticker, ...args }] },
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
      { owner_did: assetOwner }: MeshToken
    ): TickerReservationDetails => {
      const tickerOwned = !tickerOwner.isEmpty;
      const assetOwned = !assetOwner.isEmpty;

      let status: TickerReservationStatus;
      let expiryDate: Date | null = null;
      const owner = tickerOwned
        ? new Identity({ did: identityIdToString(tickerOwner) }, context)
        : null;

      if (assetOwned) {
        status = TickerReservationStatus.AssetCreated;
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
      return queryMulti<
        [QueryReturnType<typeof asset.tickers>, QueryReturnType<typeof asset.tokens>]
      >(
        [
          [asset.tickers as unknown as QueryableStorageEntry<'promise'>, rawTicker],
          [asset.tokens as unknown as QueryableStorageEntry<'promise'>, rawTicker],
        ],
        ([registration, token]) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
          callback(assembleResult(registration, token));
        }
      );
    }

    // NOTE @monitz87: the type assertions are necessary because queryMulti doesn't play nice with strict types
    const [tickerRegistration, meshAsset] = await queryMulti<
      [QueryReturnType<typeof asset.tickers>, QueryReturnType<typeof asset.tokens>]
    >([
      [asset.tickers as unknown as QueryableStorageEntry<'promise'>, rawTicker],
      [asset.tokens as unknown as QueryableStorageEntry<'promise'>, rawTicker],
    ]);

    return assembleResult(tickerRegistration, meshAsset);
  }

  /**
   * Extend the Reservation time period of the ticker for 60 days from now
   * to later use it in the creation of an Asset.
   *
   * @note required role:
   *   - Ticker Owner
   */
  public extend: NoArgsProcedureMethod<TickerReservation>;

  /**
   * Create an Asset using the reserved ticker
   *
   * @note required role:
   *   - Ticker Owner
   */
  public createAsset: ProcedureMethod<CreateAssetParams, Asset>;

  /**
   * Transfer ownership of the Ticker Reservation to another Identity. This generates an authorization request that must be accepted
   *   by the target
   *
   * @note this will create {@link AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Ticker Owner
   */
  public transferOwnership: ProcedureMethod<TransferTickerOwnershipParams, AuthorizationRequest>;

  /**
   * Determine whether this Ticker Reservation exists on chain
   */
  public async exists(): Promise<boolean> {
    const { ticker, context } = this;

    const tickerSize = await context.polymeshApi.query.asset.tickers.size(
      stringToTicker(ticker, context)
    );

    return !tickerSize.isZero();
  }

  /**
   * Return the Reservation's ticker
   */
  public toHuman(): string {
    return this.ticker;
  }
}
