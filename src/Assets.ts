import {
  Asset,
  claimClassicTicker,
  ClaimClassicTickerParams,
  Context,
  createAsset,
  CreateAssetWithTickerParams,
  Identity,
  PolymeshError,
  reserveTicker,
  ReserveTickerParams,
  TickerReservation,
} from '~/internal';
import {
  ErrorCode,
  ProcedureMethod,
  SubCallback,
  TickerReservationStatus,
  UnsubCallback,
} from '~/types';
import { stringToIdentityId, stringToTicker, tickerToString } from '~/utils/conversion';
import { createProcedureMethod, getDid, isPrintableAscii } from '~/utils/internal';

/**
 * Handles all Asset related functionality
 */
export class Assets {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.reserveTicker = createProcedureMethod(
      {
        getProcedureAndArgs: args => [reserveTicker, args],
      },
      context
    );

    this.claimClassicTicker = createProcedureMethod(
      {
        getProcedureAndArgs: args => [claimClassicTicker, args],
      },
      context
    );

    this.createAsset = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createAsset, { reservationRequired: false, ...args }],
      },
      context
    );
  }

  /**
   * Reserve a ticker symbol under the ownership of the signing Identity to later use in the creation of an Asset.
   *   The ticker will expire after a set amount of time, after which other users can reserve it
   */
  public reserveTicker: ProcedureMethod<ReserveTickerParams, TickerReservation>;

  /**
   * Claim a ticker symbol that was reserved in Polymath Classic (Ethereum). The Ethereum account
   *   that owns the ticker must sign a special message that contains the DID of the Identity that will own the ticker
   *   in Polymesh, and provide the signed data to this call
   */
  public claimClassicTicker: ProcedureMethod<ClaimClassicTickerParams, TickerReservation>;

  /**
   * Create an Asset
   *
   * @note if ticker is already reserved, then required role:
   *   - Ticker Owner
   */
  public createAsset: ProcedureMethod<CreateAssetWithTickerParams, Asset>;

  /**
   * Check if a ticker hasn't been reserved
   *
   * @note can be subscribed to
   */
  public isTickerAvailable(args: { ticker: string }): Promise<boolean>;
  public isTickerAvailable(
    args: { ticker: string },
    callback: SubCallback<boolean>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async isTickerAvailable(
    args: { ticker: string },
    callback?: SubCallback<boolean>
  ): Promise<boolean | UnsubCallback> {
    const reservation = new TickerReservation(args, this.context);

    if (callback) {
      return reservation.details(({ status: reservationStatus }) => {
        // eslint-disable-next-line standard/no-callback-literal
        callback(reservationStatus === TickerReservationStatus.Free);
      });
    }
    const { status } = await reservation.details();

    return status === TickerReservationStatus.Free;
  }

  /**
   * Retrieve all the ticker reservations currently owned by an Identity. This doesn't include Assets that
   *   have already been launched
   *
   * @param args.owner - defaults to the current Identity
   *
   * @note reservations with unreadable characters in their tickers will be left out
   */
  public async getTickerReservations(args?: {
    owner: string | Identity;
  }): Promise<TickerReservation[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(did, context)
    );

    return entries.reduce<TickerReservation[]>((result, [key, relation]) => {
      if (relation.isTickerOwned) {
        const ticker = tickerToString(key.args[1]);

        if (isPrintableAscii(ticker)) {
          return [...result, new TickerReservation({ ticker }, context)];
        }
      }

      return result;
    }, []);
  }

  /**
   * Retrieve a Ticker Reservation
   *
   * @param args.ticker - Asset ticker
   */
  public async getTickerReservation(args: { ticker: string }): Promise<TickerReservation> {
    const { ticker } = args;
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const { owner, expiry } = await asset.tickers(stringToTicker(ticker, context));

    if (!owner.isEmpty) {
      if (!expiry.isNone) {
        return new TickerReservation({ ticker }, context);
      }

      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `${ticker} Asset has been created`,
      });
    }

    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `There is no reservation for ${ticker} ticker`,
    });
  }

  /**
   * Retrieve all of the Assets owned by an Identity
   *
   * @param args.owner - Identity representation or Identity ID as stored in the blockchain
   *
   * @note Assets with unreadable characters in their tickers will be left out
   */
  public async getAssets(args?: { owner: string | Identity }): Promise<Asset[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(did, context)
    );

    return entries.reduce<Asset[]>((result, [key, relation]) => {
      if (relation.isAssetOwned) {
        const ticker = tickerToString(key.args[1]);

        if (isPrintableAscii(ticker)) {
          return [...result, new Asset({ ticker }, context)];
        }
      }

      return result;
    }, []);
  }

  /**
   * Retrieve an Asset
   *
   * @param args.ticker - Asset ticker
   */
  public async getAsset(args: { ticker: string }): Promise<Asset> {
    const { ticker } = args;

    const asset = new Asset({ ticker }, this.context);
    const exists = await asset.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no Asset with ticker "${ticker}"`,
      });
    }

    return asset;
  }
}
