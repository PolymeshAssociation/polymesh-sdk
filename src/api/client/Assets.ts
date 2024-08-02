import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { U8aFixed } from '@polkadot/types-codec';

import {
  Context,
  createAsset,
  createNftCollection,
  FungibleAsset,
  Identity,
  NftCollection,
  PolymeshError,
  reserveTicker,
  TickerReservation,
} from '~/internal';
import {
  Asset,
  CreateAssetWithTickerParams,
  CreateNftCollectionParams,
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
  assetIdToString,
  bytesToString,
  meshMetadataSpecToMetadataSpec,
  stringToIdentityId,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAsset,
  assembleAssetQuery,
  createProcedureMethod,
  getAssetIdForTicker,
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

    this.createNftCollection = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createNftCollection, args],
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
  public createAsset: ProcedureMethod<CreateAssetWithTickerParams, FungibleAsset>;

  /**
   * Create an NftCollection
   *
   * @note if ticker is already reserved, then required role:
   *   - Ticker Owner
   */
  public createNftCollection: ProcedureMethod<CreateNftCollectionParams, NftCollection>;

  /**
   * Check if a ticker hasn't been reserved
   *
   * @note can be subscribed to, if connected to node using a web socket
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
    const { context } = this;

    const reservation = new TickerReservation(args, context);

    if (callback) {
      context.assertSupportsSubscription();
      return reservation.details(({ status: reservationStatus }) => {
        // eslint-disable-next-line n/no-callback-literal, @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
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
        polymeshApi: {
          query: { asset },
        },
        isV6,
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);
    const rawDid = stringToIdentityId(did, context);

    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries = await (asset as any).assetOwnershipRelations.entries(rawDid);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (entries as any[]).reduce<TickerReservation[]>((result, [key, relation]) => {
        if (relation.isTickerOwned) {
          const ticker = tickerToString(key.args[1]);

          if (isPrintableAscii(ticker)) {
            return [...result, new TickerReservation({ ticker }, context)];
          }
        }

        return result;
      }, []);
    }

    const entries = await asset.tickersOwnedByUser.entries(rawDid);

    return entries.map(([key]) => {
      const ticker = tickerToString(key.args[1]);
      return new TickerReservation({ ticker }, context);
    });
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
   * Retrieve a FungibleAsset or NftCollection
   *
   * @note `getFungibleAsset` and `getNftCollection` are similar to this method, but return a more specific type
   */
  public async getAsset(args: { ticker: string }): Promise<Asset> {
    const { context } = this;
    const { ticker } = args;

    return asAsset(ticker, context);
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
        polymeshApi: {
          query: { asset },
        },
        isV6,
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);
    const rawDid = stringToIdentityId(did, context);

    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries = await (asset as any).assetOwnershipRelations.entries(rawDid);

      const ownedTickers: string[] = [];
      const rawTickers: PolymeshPrimitivesTicker[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries as any[]).forEach(([key, relation]) => {
        if (relation.isAssetOwned) {
          const rawTicker = key.args[1];
          const ticker = tickerToString(rawTicker);
          if (isPrintableAscii(ticker)) {
            ownedTickers.push(ticker);
            rawTickers.push(rawTicker);
          }
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ownedDetails = await (asset as any).tokens.multi(rawTickers);

      return assembleAssetQuery(ownedDetails, ownedTickers, context);
    }

    const entries = await asset.securityTokensOwnedByuser.entries(rawDid);

    const ownedAssets: string[] = [];
    const rawAssetIds: U8aFixed[] = [];

    entries.forEach(([key]) => {
      const rawAssetId = key.args[1];
      const ticker = assetIdToString(rawAssetId);
      if (isPrintableAscii(ticker)) {
        ownedAssets.push(ticker);
        rawAssetIds.push(rawAssetId);
      }
    });
    const ownedDetails = await asset.securityTokens.multi(rawAssetIds);

    return assembleAssetQuery(ownedDetails, ownedAssets, context);
  }

  /**
   * Retrieve a FungibleAsset
   *
   * @param args.ticker - Asset ticker
   * @param args.assetId - Unique Id of the Asset (for spec version 6.x, this is same as ticker)
   */
  public async getFungibleAsset(args: { assetId: string }): Promise<FungibleAsset>;
  public async getFungibleAsset(args: { ticker: string }): Promise<FungibleAsset>;
  // eslint-disable-next-line require-jsdoc
  public async getFungibleAsset(args: {
    ticker?: string;
    assetId?: string;
  }): Promise<FungibleAsset> {
    const { ticker, assetId } = args;

    const {
      context,
      context: { isV6 },
    } = this;

    let asset: FungibleAsset;
    if (isV6) {
      const id = (assetId || ticker)!;
      asset = new FungibleAsset({ assetId: id }, context);
      const exists = await asset.exists();

      if (!exists) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no Asset with ticker "${id}"`,
        });
      }

      return asset;
    }

    if (ticker) {
      const id = await getAssetIdForTicker(ticker, context);
      if (!id.length) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no Asset with ticker "${ticker}"`,
        });
      }
      asset = new FungibleAsset({ assetId: id }, context);
    } else {
      asset = new FungibleAsset({ assetId: assetId! }, context);
    }

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
   * Retrieve an NftCollection
   *
   * @param args.ticker - NftCollection ticker
   */
  public async getNftCollection(args: { ticker: string }): Promise<NftCollection>;
  public async getNftCollection(args: { assetId: string }): Promise<NftCollection>;

  // eslint-disable-next-line require-jsdoc
  public async getNftCollection(args: {
    ticker?: string;
    assetId?: string;
  }): Promise<NftCollection> {
    const { ticker, assetId } = args;

    const {
      context,
      context: { isV6 },
    } = this;

    let collection: NftCollection;
    if (isV6) {
      const id = (assetId || ticker)!;
      collection = new NftCollection({ assetId: id }, context);
      const exists = await collection.exists();

      if (!exists) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no NftCollection with ticker "${id}"`,
        });
      }

      return collection;
    }

    if (ticker) {
      const id = await getAssetIdForTicker(ticker, context);
      if (!id.length) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no NftCollection with ticker "${ticker}"`,
        });
      }
      collection = new NftCollection({ assetId: id }, context);
    } else {
      collection = new NftCollection({ assetId: assetId! }, context);
    }

    const exists = await collection.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no NftCollection with ticker "${ticker}"`,
      });
    }

    return collection;
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
            asset: { assetNames, securityTokens },
          },
        },
      },
      context,
    } = this;

    const { entries, lastKey: next } = await requestPaginated(assetNames, {
      paginationOpts,
    });

    const tickers: string[] = [];
    const rawTickers: PolymeshPrimitivesTicker[] = [];

    entries.forEach(
      ([
        {
          args: [rawTicker],
        },
      ]) => {
        rawTickers.push(rawTicker);
        tickers.push(tickerToString(rawTicker));
      }
    );

    const details = await securityTokens.multi(rawTickers);

    const data = assembleAssetQuery(details, tickers, context);

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
