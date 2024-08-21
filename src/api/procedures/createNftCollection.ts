import { Bytes, u32 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetID, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { addManualFees } from '~/api/procedures/utils';
import {
  BaseAsset,
  Context,
  FungibleAsset,
  NftCollection,
  PolymeshError,
  Procedure,
  TickerReservation,
} from '~/internal';
import {
  CollectionKeyInput,
  CreateNftCollectionParams,
  ErrorCode,
  GlobalCollectionKeyInput,
  KnownNftType,
  LocalCollectionKeyInput,
  MetadataType,
  RoleType,
  TickerReservationStatus,
  TxTag,
  TxTags,
} from '~/types';
import {
  BatchTransactionSpec,
  InternalNftType,
  ProcedureAuthorization,
  TxWithArgs,
} from '~/types/internal';
import {
  assetDocumentToDocument,
  assetToMeshAssetId,
  bigNumberToU32,
  booleanToBool,
  collectionKeysToMetadataKeys,
  internalAssetTypeToAssetType,
  internalNftTypeToNftType,
  metadataSpecToMeshMetadataSpec,
  nameToAssetName,
  securityIdentifierToAssetIdentifier,
  stringToBytes,
  stringToTicker,
} from '~/utils/conversion';
import { checkTxType, isAllowedCharacters, optionize } from '~/utils/internal';

/**
 * @hidden
 */
function assertTickerOk(ticker: string): void {
  if (!isAllowedCharacters(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New Tickers can only contain alphanumeric values "_", "-", ".", and "/"',
    });
  }
}

/**
 * @hidden
 */
export type Params = CreateNftCollectionParams;

/**
 * @hidden
 */
export interface Storage {
  /**
   * fetched custom asset type ID and raw value in bytes.
   * A null value means the type is not custom
   */
  customTypeData: {
    rawId: u32;
    rawValue: Bytes;
  } | null;

  needsLocalMetadata: boolean;
  status?: TickerReservationStatus;
  /**
   * @note in case of V6, this will be same as ticker
   */
  assetId: string;
  isAssetCreated: boolean;
}

/**
 * @hidden
 */
function isLocalMetadata(value: CollectionKeyInput): value is LocalCollectionKeyInput {
  return value.type === MetadataType.Local;
}

/**
 * @hidden
 */
function isGlobalMetadata(value: CollectionKeyInput): value is GlobalCollectionKeyInput {
  return value.type === MetadataType.Global;
}

/**
 * @hidden
 */
function getInternalNftType(
  customTypeData: Storage['customTypeData'],
  nftType: Params['nftType']
): InternalNftType {
  return customTypeData ? { Custom: customTypeData.rawId } : (nftType as KnownNftType);
}

/**
 * @hidden
 */
async function getCreateAssetTxAndFees(
  context: Context,
  storage: Storage,
  args: Params,
  rawAssetId: PolymeshPrimitivesAssetAssetID | PolymeshPrimitivesTicker
): Promise<TxWithArgs<unknown[]>> {
  const {
    polymeshApi: { tx },
    isV6,
  } = context;

  const { customTypeData, status, assetId } = storage;

  const { ticker, nftType, name, securityIdentifiers = [], fundingRound } = args;

  let fee: BigNumber | undefined;

  if (isV6 && status === TickerReservationStatus.Free) {
    fee = await addManualFees(
      new BigNumber(0),
      [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset],
      context
    );
  }

  const internalNftType = getInternalNftType(customTypeData, nftType);
  const rawName = nameToAssetName(name ?? ticker ?? assetId, context);
  const rawNameTickerArgs = isV6 ? [rawName, rawAssetId] : [rawName];
  const rawDivisibility = booleanToBool(false, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(stringToBytes)(fundingRound, context);

  const rawAssetType = internalAssetTypeToAssetType({ NonFungible: internalNftType }, context);

  return checkTxType({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: tx.asset.createAsset as any,
    fee,
    args: [...rawNameTickerArgs, rawDivisibility, rawAssetType, rawIdentifiers, rawFundingRound],
  });
}

/**
 * @hidden
 */
function getTickerRelatedTx(
  ticker: string,
  status: TickerReservationStatus,
  rawAssetId: PolymeshPrimitivesAssetAssetID,
  context: Context
): TxWithArgs<unknown[]>[] {
  const {
    polymeshApi: { tx },
  } = context;
  const rawTicker = stringToTicker(ticker, context);
  const transactions = [];
  if (status === TickerReservationStatus.Free) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.registerUniqueTicker,
        args: [rawTicker],
      })
    );
  }

  if (status !== TickerReservationStatus.AssetCreated) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.linkTickerToAssetId,
        args: [rawTicker, rawAssetId],
      })
    );
  }

  return transactions;
}

/**
 * @hidden
 */
export async function prepareCreateNftCollection(
  this: Procedure<Params, NftCollection, Storage>,
  args: Params
): Promise<BatchTransactionSpec<NftCollection, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
    storage: { customTypeData, status, assetId, isAssetCreated },
    storage,
  } = this;
  const { ticker, nftType, collectionKeys, documents } = args;

  let transactions = [];

  if (ticker) {
    assertTickerOk(ticker);
  }

  const internalNftType = getInternalNftType(customTypeData, nftType);

  const nftCollection = new NftCollection({ assetId }, context);
  const rawAssetId = assetToMeshAssetId(nftCollection, context);
  const rawType = internalNftTypeToNftType(internalNftType, context);

  let nextLocalId = new BigNumber(1);

  if (isAssetCreated) {
    /**
     * assets can be created with type Nft, but not have a created collection,
     * we handle this case to prevent a ticker getting stuck if it was initialized via non SDK methods
     */
    const asset = new FungibleAsset({ assetId }, context);
    let nonFungible;
    [{ nonFungible }, nextLocalId] = await Promise.all([
      asset.details(),
      asset.metadata.getNextLocalId(),
    ]);
    if (!nonFungible) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Only assets with type NFT can be turned into NFT collections',
      });
    }
  } else {
    transactions.push(await getCreateAssetTxAndFees(context, storage, args, rawAssetId));
  }

  if (!isV6 && ticker && status) {
    transactions = [...transactions, ...getTickerRelatedTx(ticker, status, rawAssetId, context)];
  }

  const globalMetadataKeys = collectionKeys.filter(isGlobalMetadata);
  const localMetadataKeys = collectionKeys.filter(isLocalMetadata);

  localMetadataKeys.forEach(localKey => {
    const { name: metaName, spec } = localKey;
    const rawMetadataName = stringToBytes(metaName, context);
    const rawSpec = metadataSpecToMeshMetadataSpec(spec, context);

    transactions.push(
      checkTxType({
        transaction: tx.asset.registerAssetMetadataLocalType,
        args: [rawAssetId, rawMetadataName, rawSpec],
      })
    );
  });

  const keyValues = [
    ...globalMetadataKeys,
    ...localMetadataKeys.map((key, index) => {
      return {
        type: MetadataType.Local,
        id: nextLocalId.plus(index),
      };
    }),
  ];

  const rawCollectionKeys = collectionKeysToMetadataKeys(keyValues, context);

  if (documents?.length) {
    const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));

    const feeMultiplier = new BigNumber(rawDocuments.length);

    transactions.push(
      checkTxType({
        transaction: tx.asset.addDocuments,
        feeMultiplier,
        args: [rawDocuments, rawAssetId],
      })
    );
  }

  transactions.push(
    checkTxType({
      transaction: tx.nft.createNftCollection,
      args: [rawAssetId, rawType, rawCollectionKeys],
    })
  );

  return {
    transactions,
    resolver: nftCollection,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, NftCollection, Storage>,
  { ticker, documents }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { status, needsLocalMetadata, isAssetCreated, assetId },
    context,
    context: { isV6 },
  } = this;

  const transactions: TxTag[] = [TxTags.nft.CreateNftCollection];

  if (!isAssetCreated) {
    transactions.push(TxTags.asset.CreateAsset);
  }

  if (!isV6) {
    if (status === TickerReservationStatus.Free) {
      transactions.push(TxTags.asset.RegisterUniqueTicker);
    }
    if (status !== TickerReservationStatus.AssetCreated) {
      transactions.push(TxTags.asset.LinkTickerToAssetId);
    }
  }

  if (needsLocalMetadata) {
    transactions.push(TxTags.asset.RegisterAssetMetadataLocalType);
  }

  if (documents?.length) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  const permissions = {
    transactions,
    assets: [],
    portfolios: [],
  };

  if (ticker && status && status === TickerReservationStatus.Reserved) {
    return {
      permissions,
      roles: [{ type: RoleType.TickerOwner, ticker }],
    };
  }

  if (isAssetCreated) {
    return {
      permissions: {
        ...permissions,
        assets: [new BaseAsset({ assetId }, context)],
      },
    };
  }

  return { permissions };
}

/**
 * @hidden
 */
async function prepareStorageForCustomType(
  nftType: string | BigNumber,
  context: Context
): Promise<Storage['customTypeData']> {
  let customTypeData: Storage['customTypeData'];

  if (nftType instanceof BigNumber) {
    const rawId = bigNumberToU32(nftType, context);
    const rawValue = await context.polymeshApi.query.asset.customTypes(rawId);

    if (rawValue.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'createNftCollection was given a custom type ID that does not have an corresponding value',
        data: { nftType },
      });
    }

    customTypeData = {
      rawId,
      rawValue,
    };
  } else if (!values<string>(KnownNftType).includes(nftType)) {
    const rawValue = stringToBytes(nftType, context);
    const rawId = await context.polymeshApi.query.asset.customTypesInverse(rawValue);
    if (rawId.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'createNftCollection procedure was given a custom type string that does not have a corresponding ID. Register the type and try again',
        data: { nftType },
      });
    }

    customTypeData = {
      rawId: rawId.unwrap(),
      rawValue,
    };
  } else {
    customTypeData = null;
  }
  return customTypeData;
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, NftCollection, Storage>,
  { ticker, assetId, nftType, collectionKeys }: Params
): Promise<Storage> {
  const {
    context,
    context: { isV6 },
  } = this;

  const assertNftCollectionDoesNotExists = async (id: string): Promise<void> => {
    const nft = new NftCollection({ assetId: id }, context);
    const collectionExists = await nft.exists();

    if (collectionExists) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'An NFT collection already exists with the ticker',
        data: { ticker },
      });
    }
  };

  const storageStatus: Pick<Storage, 'status' | 'assetId' | 'isAssetCreated'> = {
    isAssetCreated: false,
    assetId: '',
  };

  const assetIdExistsForV7 = !isV6 && assetId;

  if (ticker) {
    assertTickerOk(ticker);

    if (isV6) {
      // for chain 6.x, we assume asset ID same as ticker
      storageStatus.assetId = ticker;
    }

    const reservation = new TickerReservation({ ticker }, context);
    const reservationDetails = await reservation.details();
    const { status } = reservationDetails;
    storageStatus.status = status;

    if (status === TickerReservationStatus.AssetCreated) {
      storageStatus.assetId = reservationDetails.assetId;
      storageStatus.isAssetCreated = true;
      if (assetIdExistsForV7 && assetId !== reservationDetails.assetId) {
        // For v7 chain, if assetID is provided in arguments, and the ticker provided is not already associted with the given asset ID, throw an error
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Ticker is already linked to another asset',
          data: {
            ticker,
            linkedAssetId: reservationDetails.assetId,
          },
        });
      }

      await assertNftCollectionDoesNotExists(reservationDetails.assetId);
    } else if (!isV6) {
      storageStatus.assetId = await context.getSigningAccount().getNextAssetId();
    }
  } else if (isV6) {
    // ticker is mandatory for 6.x chain
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Ticker must be provided while creating a NFT collection',
    });
  }

  if (assetIdExistsForV7) {
    storageStatus.assetId = assetId;
    storageStatus.isAssetCreated = true;
    await assertNftCollectionDoesNotExists(assetId);
  }

  const needsLocalMetadata = collectionKeys.some(isLocalMetadata);

  const customTypeData = await prepareStorageForCustomType(nftType, context);

  return {
    customTypeData,
    needsLocalMetadata,
    ...storageStatus,
  };
}

/**
 * @hidden
 */
export const createNftCollection = (): Procedure<Params, NftCollection, Storage> =>
  new Procedure(prepareCreateNftCollection, getAuthorization, prepareStorage);
