import { Bytes, u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { addManualFees } from '~/api/procedures/utils';
import {
  Asset,
  Identity,
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
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
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
import { checkTxType, isAlphanumeric } from '~/utils/internal';

/**
 * @hidden
 */
function assertTickerOk(ticker: string): void {
  if (!isAlphanumeric(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New Tickers can only contain alphanumeric values',
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

  status: TickerReservationStatus;

  signingIdentity: Identity;

  needsLocalMetadata: boolean;
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
export async function prepareCreateNftCollection(
  this: Procedure<Params, NftCollection, Storage>,
  args: Params
): Promise<BatchTransactionSpec<NftCollection, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { customTypeData, status },
  } = this;
  const { ticker, nftType, name, securityIdentifiers = [], collectionKeys, documents } = args;
  const internalNftType = customTypeData
    ? { Custom: customTypeData.rawId }
    : (nftType as KnownNftType);
  const transactions = [];

  assertTickerOk(ticker);

  const rawTicker = stringToTicker(ticker, context);
  const rawName = nameToAssetName(name ?? ticker, context);
  const rawType = internalNftTypeToNftType(internalNftType, context);
  const rawDivisibility = booleanToBool(false, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = null;

  let nextLocalId = new BigNumber(1);
  let fee: BigNumber | undefined;
  if (status === TickerReservationStatus.Free) {
    const rawAssetType = internalAssetTypeToAssetType({ NonFungible: internalNftType }, context);
    fee = await addManualFees(
      new BigNumber(0),
      [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset, TxTags.nft.CreateNftCollection],
      context
    );

    transactions.push(
      checkTxType({
        transaction: tx.asset.createAsset,
        args: [rawName, rawTicker, rawDivisibility, rawAssetType, rawIdentifiers, rawFundingRound],
      })
    );
  } else if (status === TickerReservationStatus.Reserved) {
    const rawAssetType = internalAssetTypeToAssetType({ NonFungible: internalNftType }, context);
    fee = await addManualFees(
      new BigNumber(0),
      [TxTags.asset.CreateAsset, TxTags.nft.CreateNftCollection],
      context
    );
    transactions.push(
      checkTxType({
        transaction: tx.asset.createAsset,
        args: [rawName, rawTicker, rawDivisibility, rawAssetType, rawIdentifiers, rawFundingRound],
      })
    );
  } else if (status === TickerReservationStatus.AssetCreated) {
    const asset = new Asset({ ticker }, context);
    let nonFungible;
    [fee, { nonFungible }, nextLocalId] = await Promise.all([
      addManualFees(new BigNumber(0), [TxTags.nft.CreateNftCollection], context),
      asset.details(),
      asset.metadata.getNextLocalId(),
    ]);

    if (!nonFungible) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Only assets with type NFT can be turned into NFT collections',
      });
    }
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
        args: [rawTicker, rawMetadataName, rawSpec],
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
        args: [rawDocuments, rawTicker],
      })
    );
  }

  transactions.push(
    checkTxType({
      transaction: tx.nft.createNftCollection,
      fee,
      args: [rawTicker, rawType, rawCollectionKeys],
    })
  );

  return {
    transactions,
    resolver: new NftCollection({ ticker }, context),
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
    storage: { status, needsLocalMetadata },
    context,
  } = this;

  const transactions: TxTag[] = [TxTags.nft.CreateNftCollection];

  if (status !== TickerReservationStatus.AssetCreated) {
    transactions.push(TxTags.asset.CreateAsset);
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

  if (status === TickerReservationStatus.Reserved) {
    return {
      permissions,
      roles: [{ type: RoleType.TickerOwner, ticker }],
    };
  } else if (status === TickerReservationStatus.AssetCreated) {
    return {
      permissions: {
        ...permissions,
        assets: [new Asset({ ticker }, context)],
      },
    };
  }

  return { permissions };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, NftCollection, Storage>,
  { ticker, nftType, collectionKeys }: Params
): Promise<Storage> {
  const { context } = this;

  const needsLocalMetadata = collectionKeys.some(isLocalMetadata);
  const reservation = new TickerReservation({ ticker }, context);

  const nft = new NftCollection({ ticker }, context);

  const [{ status }, signingIdentity, collectionExists] = await Promise.all([
    reservation.details(),
    context.getSigningIdentity(),
    nft.exists(),
  ]);

  if (collectionExists) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'An NFT collection already exists with the ticker',
      data: { ticker },
    });
  }

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

  return {
    customTypeData,
    status,
    signingIdentity,
    needsLocalMetadata,
  };
}

/**
 * @hidden
 */
export const createNftCollection = (): Procedure<Params, NftCollection, Storage> =>
  new Procedure(prepareCreateNftCollection, getAuthorization, prepareStorage);
