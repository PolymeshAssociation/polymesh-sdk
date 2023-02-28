import {
  Asset,
  Context,
  createAsset,
  Identity,
  PolymeshError,
  reserveTicker,
  TickerReservation,
} from '~/internal';
import {
  CreateAssetWithTickerParams,
  ErrorCode,
  GlobalMetadataKey,
  PaginationOptions,
  ProcedureMethod,
  ReserveTickerParams,
  ResultSet,
  SubCallback,
  TickerReservationStatus,
  UnsubCallback,
} from '~/types';
import {
  bytesToString,
  meshMetadataSpecToMetadataSpec,
  stringToIdentityId,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  createProcedureMethod,
  getDid,
  isPrintableAscii,
  requestPaginated,
} from '~/utils/internal';

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
        // eslint-disable-next-line node/no-callback-literal, @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
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
   * @param args.owner - defaults to the signing Identity
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
  public getTickerReservation(args: { ticker: string }): TickerReservation {
    const { ticker } = args;
    const { context } = this;

    return new TickerReservation({ ticker }, context);
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

  /**
   * Retrieve all the Assets on chain
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<Asset>> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetNames },
          },
        },
      },
      context,
    } = this;

    const { entries, lastKey: next } = await requestPaginated(assetNames, {
      paginationOpts,
    });

    const data: Asset[] = entries.map(
      ([
        {
          args: [rawTicker],
        },
      ]) => new Asset({ ticker: tickerToString(rawTicker) }, context)
    );

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs
   */
  public async getGlobalMetadataKeys(): Promise<GlobalMetadataKey[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetMetadataGlobalKeyToName, assetMetadataGlobalSpecs },
          },
        },
      },
    } = this;

    const [keyToNameEntries, specsEntries] = await Promise.all([
      assetMetadataGlobalKeyToName.entries(),
      assetMetadataGlobalSpecs.entries(),
    ]);

    const specsEntryMap = new Map(
      specsEntries.map(
        ([
          {
            args: [rawKeyId],
          },
          rawSpecs,
        ]) => [rawKeyId.toString(), rawSpecs]
      )
    );

    return keyToNameEntries.map(
      ([
        {
          args: [rawId],
        },
        rawName,
      ]) => {
        const rawSpecs = specsEntryMap.get(rawId.toString());

        return {
          id: u64ToBigNumber(rawId),
          name: bytesToString(rawName.unwrap()),
          specs: meshMetadataSpecToMetadataSpec(rawSpecs),
        };
      }
    );
  }
}
