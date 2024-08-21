import { PalletAssetSecurityToken, PalletAssetTickerRegistration } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec';

import {
  AuthorizationRequest,
  Context,
  createAsset,
  Entity,
  FungibleAsset,
  Identity,
  reserveTicker,
  transferTickerOwnership,
} from '~/internal';
import {
  CreateAssetParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SubCallback,
  TickerReservationDetails,
  TickerReservationStatus,
  TransferTickerOwnershipParams,
  UnsubCallback,
} from '~/types';
import {
  identityIdToString,
  meshAssetToAssetId,
  momentToDate,
  stringToTicker,
} from '~/utils/conversion';
import { assertTickerValid, createProcedureMethod, requestMulti } from '~/utils/internal';

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
   * @note can be subscribed to, if connected to node using a web socket
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
        },
        isV6,
      },
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = (
      reservationOpt: Option<PalletAssetTickerRegistration>,
      tokenOpt: Option<PalletAssetSecurityToken>,
      assetId: string
    ): TickerReservationDetails => {
      let owner: Identity | null = null;
      let status = TickerReservationStatus.Free;
      let expiryDate: Date | null = null;

      if (tokenOpt.isSome) {
        status = TickerReservationStatus.AssetCreated;
        const rawOwnerDid = tokenOpt.unwrap().ownerDid;
        owner = new Identity({ did: identityIdToString(rawOwnerDid) }, context);
      } else if (reservationOpt.isSome) {
        const { owner: rawOwnerDid, expiry } = reservationOpt.unwrap();
        owner = new Identity({ did: identityIdToString(rawOwnerDid) }, context);

        expiryDate = expiry.isSome ? momentToDate(expiry.unwrap()) : null;
        if (!expiryDate || expiryDate > new Date()) {
          status = TickerReservationStatus.Reserved;
        }
      }

      return {
        owner,
        expiryDate,
        status,
        assetId,
      };
    };

    let tokensStorage = asset.securityTokens;
    let tickerRegistrationStorage = asset.uniqueTickerRegistration;
    let rawAssetId = rawTicker;

    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tickerRegistrationStorage = (asset as any).tickers;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokensStorage = (asset as any).tokens;
    } else {
      const meshAssetId = await asset.tickerAssetID(rawTicker);
      rawAssetId = meshAssetId.unwrapOrDefault();
    }

    if (callback) {
      context.assertSupportsSubscription();

      return requestMulti<[typeof tickerRegistrationStorage, typeof tokensStorage]>(
        context,
        [
          [tickerRegistrationStorage, rawTicker],
          [tokensStorage, rawAssetId],
        ],
        ([registration, token]) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
          callback(assembleResult(registration, token, meshAssetToAssetId(rawAssetId, context)));
        }
      );
    }

    const [tickerRegistration, meshAsset] = await requestMulti<
      [typeof tickerRegistrationStorage, typeof tokensStorage]
    >(context, [
      [tickerRegistrationStorage, rawTicker],
      [tokensStorage, rawAssetId],
    ]);

    return assembleResult(tickerRegistration, meshAsset, meshAssetToAssetId(rawAssetId, context));
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
  public createAsset: ProcedureMethod<CreateAssetParams, FungibleAsset>;

  /**
   * Transfer ownership of the Ticker Reservation to another Identity. This generates an authorization request that must be accepted
   *   by the target
   *
   * @note this will create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Ticker Owner
   */
  public transferOwnership: ProcedureMethod<TransferTickerOwnershipParams, AuthorizationRequest>;

  /**
   * Determine whether this Ticker Reservation exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      ticker,
      context: {
        polymeshApi: {
          query: { asset },
        },
        isV6,
      },
      context,
    } = this;

    let tickerRegistrationStorage = asset.uniqueTickerRegistration;

    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tickerRegistrationStorage = (asset as any).tickers;
    }
    const tickerSize = await tickerRegistrationStorage.size(stringToTicker(ticker, context));

    return !tickerSize.isZero();
  }

  /**
   * Return the Reservation's ticker
   */
  public toHuman(): string {
    return this.ticker;
  }
}
