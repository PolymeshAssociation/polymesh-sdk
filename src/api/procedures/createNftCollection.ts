import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

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
  CustomTypeData,
  ProcedureAuthorization,
  TxWithArgs,
} from '~/types/internal';
import {
  assetDocumentToDocument,
  assetToMeshAssetId,
  booleanToBool,
  collectionKeysToMetadataKeys,
  getInternalNftType,
  internalAssetTypeToAssetType,
  internalNftTypeToNftType,
  metadataSpecToMeshMetadataSpec,
  nameToAssetName,
  securityIdentifierToAssetIdentifier,
  stringToBytes,
  stringToTicker,
} from '~/utils/conversion';
import {
  checkTxType,
  isAllowedCharacters,
  optionize,
  prepareStorageForCustomType,
} from '~/utils/internal';

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
  customTypeData: CustomTypeData | null;

  needsLocalMetadata: boolean;
  status?: TickerReservationStatus;
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
async function getCreateAssetTxAndFees(
  context: Context,
  storage: Storage,
  args: Params
): Promise<TxWithArgs<unknown[]>> {
  const {
    polymeshApi: { tx },
  } = context;

  const { customTypeData, assetId } = storage;

  const { ticker, nftType, name, securityIdentifiers = [], fundingRound } = args;

  let fee: BigNumber | undefined;

  const internalNftType = getInternalNftType(customTypeData, nftType);
  const rawName = nameToAssetName(name ?? ticker ?? assetId, context);

  const rawDivisibility = booleanToBool(false, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(stringToBytes)(fundingRound, context);

  const rawAssetType = internalAssetTypeToAssetType({ NonFungible: internalNftType }, context);

  return checkTxType({
    transaction: tx.asset.createAsset,
    fee,
    args: [rawName, rawDivisibility, rawAssetType, rawIdentifiers, rawFundingRound],
  });
}

/**
 * @hidden
 */
function getTickerRelatedTx(
  ticker: string,
  status: TickerReservationStatus,
  rawAssetId: PolymeshPrimitivesAssetAssetId,
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
    if (storage.customTypeData && !storage.customTypeData.isAlreadyCreated) {
      transactions.push(
        checkTxType({
          transaction: tx.asset.registerCustomAssetType,
          args: [storage.customTypeData.rawValue],
        })
      );
    }
    transactions.push(await getCreateAssetTxAndFees(context, storage, args));
  }

  if (ticker && status) {
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
    storage: { status, needsLocalMetadata, isAssetCreated, assetId, customTypeData },
    context,
  } = this;

  const transactions: TxTag[] = [TxTags.nft.CreateNftCollection];

  if (customTypeData && !customTypeData.isAlreadyCreated) {
    transactions.push(TxTags.asset.RegisterCustomAssetType);
  }

  if (!isAssetCreated) {
    transactions.push(TxTags.asset.CreateAsset);
  }

  if (status === TickerReservationStatus.Free) {
    // TODO: might need asset perms as it checks it with agent permissions & that checks for the asset as well
    transactions.push(TxTags.asset.RegisterUniqueTicker);
  }
  if (status !== TickerReservationStatus.AssetCreated) {
    // TODO: might need asset perms as it checks it with agent permissions & that checks for the asset as well
    transactions.push(TxTags.asset.LinkTickerToAssetId);
  }

  if (needsLocalMetadata) {
    // TODO: might need asset perms as it checks it with agent permissions & that checks for the asset as well
    transactions.push(TxTags.asset.RegisterAssetMetadataLocalType);
  }

  if (documents?.length) {
    // TODO: might need asset perms as it checks it with agent permissions & that checks for the asset as well
    transactions.push(TxTags.asset.AddDocuments);
  }

  const permissions = {
    transactions,
    // TODO: might need asset perms -> `pallets/nft/src/lib.rs` 268 "Verifies if the caller has asset permission and if the asset is an NFT."
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
export async function assertNftCollectionDoesNotExists(
  id: string,
  context: Context,
  errorParams: ConstructorParameters<typeof PolymeshError>[0]
): Promise<void> {
  const nft = new NftCollection({ assetId: id }, context);
  const collectionExists = await nft.exists();

  if (collectionExists) {
    throw new PolymeshError(errorParams);
  }
}

type StorageAssetAttributes = 'status' | 'assetId' | 'isAssetCreated';
/**
 * @hidden
 */
export async function prepareStorageForTickerDetails(
  context: Context,
  ticker: string,
  assetId?: string
): Promise<Pick<Storage, StorageAssetAttributes>> {
  assertTickerOk(ticker);

  const storageStatus: Pick<Storage, StorageAssetAttributes> = {
    isAssetCreated: false,
    assetId: '',
  };

  const reservation = new TickerReservation({ ticker }, context);
  const reservationDetails = await reservation.details();
  const { status } = reservationDetails;
  storageStatus.status = status;

  if (status === TickerReservationStatus.AssetCreated) {
    storageStatus.assetId = reservationDetails.assetId;
    storageStatus.isAssetCreated = true;
    if (assetId && assetId !== reservationDetails.assetId) {
      // For v7 chain, if assetID is provided in arguments, and the ticker provided is not already associated with the given asset ID, throw an error
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Ticker is already linked to another asset',
        data: {
          ticker,
          linkedAssetId: reservationDetails.assetId,
        },
      });
    }

    await assertNftCollectionDoesNotExists(reservationDetails.assetId, context, {
      code: ErrorCode.UnmetPrerequisite,
      message: 'An NFT collection already exists with the ticker',
      data: { ticker },
    });
  } else {
    storageStatus.assetId = await context.getSigningAccount().getNextAssetId();
  }
  return storageStatus;
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, NftCollection, Storage>,
  { ticker, assetId, nftType, collectionKeys }: Params
): Promise<Storage> {
  const { context } = this;

  let storageStatus: Pick<Storage, StorageAssetAttributes> = {
    isAssetCreated: false,
    assetId: '',
  };

  if (ticker) {
    storageStatus = await prepareStorageForTickerDetails(context, ticker, assetId);
  }

  if (assetId) {
    storageStatus.assetId = assetId;
    storageStatus.isAssetCreated = true;
    await assertNftCollectionDoesNotExists(assetId, context, {
      code: ErrorCode.UnmetPrerequisite,
      message: 'An NFT collection already exists with the given asset ID',
      data: { assetId },
    });
  } else {
    storageStatus.assetId = await context.getSigningAccount().getNextAssetId();
  }

  const needsLocalMetadata = collectionKeys.some(isLocalMetadata);

  const customTypeData = await prepareStorageForCustomType(
    nftType,
    values(KnownNftType),
    context,
    'createNftCollection'
  );

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
