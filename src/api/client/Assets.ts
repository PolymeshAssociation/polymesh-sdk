import { PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  Context,
  createAsset,
  createNftCollection,
  FungibleAsset,
  Identity,
  NftCollection,
  PolymeshError,
  registerCustomAssetType,
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
  RegisterCustomAssetTypeParams,
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
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAsset,
  assembleAssetQuery,
  asUuid,
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
  private readonly context: Context;

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

    this.registerCustomAssetType = createProcedureMethod(
      {
        getProcedureAndArgs: args => [registerCustomAssetType, args],
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
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);
    const rawDid = stringToIdentityId(did, context);

    const entries = await asset.tickersOwnedByUser.entries(rawDid);

    const rawTickers = entries.map(([key]) => key.args[1]);

    const rawAssetIds = await asset.tickerAssetId.multi(rawTickers);

    return rawAssetIds.reduce<TickerReservation[]>((result, rawAssetId, index) => {
      if (rawAssetId.isNone) {
        const ticker = tickerToString(rawTickers[index]);

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
   * Retrieve a FungibleAsset or NftCollection
   *
   * @note `getFungibleAsset` and `getNftCollection` are similar to this method, but return a more specific type
   */
  public async getAsset(args: { ticker: string }): Promise<Asset>;
  public async getAsset(args: { assetId: string }): Promise<Asset>;
  // eslint-disable-next-line require-jsdoc
  public async getAsset(args: { ticker?: string; assetId?: string }): Promise<Asset> {
    const { context } = this;
    const { ticker, assetId } = args;

    let assetIdValue = assetId;
    if (ticker) {
      assetIdValue = await getAssetIdForTicker(ticker, context);
    }

    return asAsset(assetIdValue!, context);
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
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);
    const rawDid = stringToIdentityId(did, context);

    const entries = await asset.securityTokensOwnedByUser.entries(rawDid);

    const ownedAssets: string[] = [];
    const rawAssetIds: PolymeshPrimitivesAssetAssetId[] = [];

    entries.forEach(([key]) => {
      const rawAssetId = key.args[1];
      rawAssetIds.push(rawAssetId);
      ownedAssets.push(assetIdToString(rawAssetId));
    });
    const ownedDetails = await asset.assets.multi(rawAssetIds);

    return assembleAssetQuery(ownedDetails, ownedAssets, context);
  }

  /**
   * @hidden
   */
  private async getIdFromAssetIdAndTicker(assetId?: string, ticker?: string): Promise<string> {
    const { context } = this;
    let assetIdValue: string;
    if (ticker) {
      assetIdValue = await getAssetIdForTicker(ticker, context);
    } else {
      assetIdValue = asUuid(assetId!);
    }
    return assetIdValue;
  }

  /**
   * Retrieve a FungibleAsset
   *
   * @param args.assetId - Unique Id of the Fungible Asset (for spec version 6.x, this is same as ticker)
   * @param args.ticker - Asset ticker
   * @param args.skipExistsCheck - when true, method will not check if the Asset exists
   */
  public async getFungibleAsset(args: {
    assetId: string;
    skipExistsCheck?: boolean;
  }): Promise<FungibleAsset>;

  // eslint-disable-next-line require-jsdoc
  public async getFungibleAsset(args: {
    ticker: string;
    skipExistsCheck?: boolean;
  }): Promise<FungibleAsset>;

  // eslint-disable-next-line require-jsdoc
  public async getFungibleAsset(args: {
    ticker?: string;
    assetId?: string;
    skipExistsCheck?: boolean;
  }): Promise<FungibleAsset> {
    const { ticker, assetId, skipExistsCheck = false } = args;

    const { context } = this;

    const assetIdValue = await this.getIdFromAssetIdAndTicker(assetId, ticker);

    const asset = new FungibleAsset({ assetId: assetIdValue }, context);

    if (!skipExistsCheck) {
      const exists = await asset.exists();

      if (!exists) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no Asset with ${ticker ? 'ticker' : 'asset ID'} "${
            ticker ?? assetId
          }"`,
        });
      }
    }

    return asset;
  }

  /**
   * Retrieve an NftCollection
   *
   * @param args.assetId - Unique Id of the NftCollection (for spec version 6.x, this is same as ticker)
   * @param args.ticker - NftCollection ticker
   * @param args.skipExistsCheck - when true, method will not check if the NftCollection exists
   */
  public async getNftCollection(args: {
    ticker: string;
    skipExistsCheck?: boolean;
  }): Promise<NftCollection>;

  // eslint-disable-next-line require-jsdoc
  public async getNftCollection(args: {
    assetId: string;
    skipExistsCheck?: boolean;
  }): Promise<NftCollection>;

  // eslint-disable-next-line require-jsdoc
  public async getNftCollection(args: {
    ticker?: string;
    assetId?: string;
    skipExistsCheck?: boolean;
  }): Promise<NftCollection> {
    const { ticker, assetId, skipExistsCheck = false } = args;

    const { context } = this;

    const assetIdValue = await this.getIdFromAssetIdAndTicker(assetId, ticker);

    const collection = new NftCollection({ assetId: assetIdValue }, context);

    if (!skipExistsCheck) {
      const exists = await collection.exists();

      if (!exists) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: `There is no NftCollection with ${ticker ? 'ticker' : 'asset ID'} "${
            ticker ?? assetId
          }"`,
        });
      }
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
          query: { asset },
        },
      },
      context,
    } = this;

    const { entries, lastKey: next } = await requestPaginated(asset.assetNames, {
      paginationOpts,
    });

    const assetIds: string[] = [];
    const rawAssetIds: (PolymeshPrimitivesTicker | PolymeshPrimitivesAssetAssetId)[] = [];

    entries.forEach(
      ([
        {
          args: [rawAssetId],
        },
      ]) => {
        rawAssetIds.push(rawAssetId);
        assetIds.push(assetIdToString(rawAssetId));
      }
    );

    const details = await asset.assets.multi(rawAssetIds);

    const data = assembleAssetQuery(details, assetIds, context);

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

  /**
   * Register a custom asset type
   */
  public registerCustomAssetType: ProcedureMethod<RegisterCustomAssetTypeParams, BigNumber>;

  /**
   * Gets the next custom Asset type Id
   */
  public async getNextCustomAssetTypeId(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { customTypeIdSequence },
          },
        },
      },
    } = this;

    const rawId = await customTypeIdSequence();

    return u32ToBigNumber(rawId).plus(1);
  }
}
