import { Bytes } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';
import { AssetType, CustomAssetTypeId, TxTags } from 'polymesh-types/types';

import { Asset, Context, PolymeshError, Procedure, TickerReservation } from '~/internal';
import {
  AssetDocument,
  ErrorCode,
  KnownAssetType,
  RoleType,
  SecurityIdentifier,
  TickerReservationStatus,
} from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  booleanToBool,
  boolToBoolean,
  internalAssetTypeToAssetType,
  numberToBalance,
  securityIdentifierToAssetIdentifier,
  stringToAssetName,
  stringToBytes,
  stringToFundingRoundName,
  stringToTicker,
} from '~/utils/conversion';
import { batchArguments, filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createRegisterCustomAssetTypeResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): AssetType => {
    const [{ data }] = filterEventRecords(receipt, 'asset', 'CustomAssetTypeRegistered');

    return internalAssetTypeToAssetType({ Custom: data[1] }, context);
  };

export interface CreateAssetParams {
  name: string;
  /**
   * amount of Asset tokens that will be minted on creation (optional, default doesn't mint)
   */
  initialSupply?: BigNumber;
  /**
   * whether a single Asset token can be divided into decimal parts
   */
  isDivisible: boolean;
  /**
   * type of security that the Asset represents (i.e. Equity, Debt, Commodity, etc). Common values are included in the
   *   [[KnownSecurityType]] enum, but custom values can be used as well. Custom values must be registered on-chain the first time
   *   they're used, requiring an additional transaction. They aren't tied to a specific Asset
   */
  assetType: string;
  /**
   * array of domestic or international alphanumeric security identifiers for the Asset (ISIN, CUSIP, etc)
   */
  securityIdentifiers?: SecurityIdentifier[];
  /**
   * (optional) funding round in which the Asset currently is (Series A, Series B, etc)
   */
  fundingRound?: string;
  documents?: AssetDocument[];
  /**
   * whether this asset requires investors to have a Investor Uniqueness Claim in order
   *   to hold it. More information about Investor Uniqueness and PUIS [here](https://developers.polymesh.live/introduction/identity#polymesh-unique-identity-system-puis)
   */
  requireInvestorUniqueness: boolean;
}

export interface CreateAssetWithTickerParams extends CreateAssetParams {
  ticker: string;
}

/**
 * @hidden
 */
export type Params = CreateAssetWithTickerParams & {
  reservationRequired: boolean;
};

/**
 * @hidden
 */
export interface Storage {
  /**
   * fetched custom asset type ID and raw value in bytes. If `id.isEmpty`, then the type should be registered. A
   *   null value means the type is not custom
   */
  customTypeData: {
    id: CustomAssetTypeId;
    rawValue: Bytes;
  } | null;

  status: TickerReservationStatus;
}

/**
 * @hidden
 */
export async function prepareCreateAsset(
  this: Procedure<Params, Asset, Storage>,
  args: Params
): Promise<Asset> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { asset },
      },
    },
    context,
    storage: { customTypeData, status },
  } = this;
  const {
    ticker,
    name,
    initialSupply,
    isDivisible,
    assetType,
    securityIdentifiers = [],
    fundingRound,
    documents,
    requireInvestorUniqueness,
    reservationRequired,
  } = args;

  if (status === TickerReservationStatus.AssetCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `An Asset with ticker "${ticker}" already exists`,
    });
  }

  if (status === TickerReservationStatus.Free && reservationRequired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `You must first reserve ticker "${ticker}" in order to create an Asset with it`,
    });
  }

  let rawType: MaybePostTransactionValue<AssetType>;

  if (customTypeData) {
    const { rawValue, id } = customTypeData;

    if (id.isEmpty) {
      // if the custom asset type doesn't exist, we create it
      [rawType] = this.addTransaction({
        transaction: tx.asset.registerCustomAssetType,
        resolvers: [createRegisterCustomAssetTypeResolver(context)],
        args: [rawValue],
      });
    } else {
      rawType = internalAssetTypeToAssetType({ Custom: id }, context);
    }
  } else {
    rawType = internalAssetTypeToAssetType(assetType as KnownAssetType, context);
  }

  const rawName = stringToAssetName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = fundingRound ? stringToFundingRoundName(fundingRound, context) : null;
  const rawDisableIu = booleanToBool(!requireInvestorUniqueness, context);

  let fee: undefined | BigNumber;

  const rawTicker = stringToTicker(ticker, context);

  // we waive any protocol fees if the Asset is created in Ethereum. If not created and ticker is not yet reserved, we set the fee to the sum of protocol fees for ticker registration and Asset creation.

  const classicTicker = await asset.classicTickers(rawTicker);
  const assetCreatedInEthereum =
    classicTicker.isSome && boolToBoolean(classicTicker.unwrap().is_created);

  if (assetCreatedInEthereum) {
    fee = new BigNumber(0);
  } else if (status === TickerReservationStatus.Free) {
    const [registerTickerFee, createAssetFee] = await Promise.all([
      context.getProtocolFees({ tag: TxTags.asset.RegisterTicker }),
      context.getProtocolFees({ tag: TxTags.asset.CreateAsset }),
    ]);
    fee = registerTickerFee.plus(createAssetFee);
  }

  this.addTransaction({
    transaction: tx.asset.createAsset,
    fee,
    args: [
      rawName,
      rawTicker,
      rawIsDivisible,
      rawType,
      rawIdentifiers,
      rawFundingRound,
      rawDisableIu,
    ],
  });

  if (initialSupply && initialSupply.gt(0)) {
    const rawInitialSupply = numberToBalance(initialSupply, context, isDivisible);

    this.addTransaction({
      transaction: tx.asset.issue,
      args: [rawTicker, rawInitialSupply],
    });
  }

  if (documents?.length) {
    const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));
    batchArguments(rawDocuments, TxTags.asset.AddDocuments).forEach(rawDocumentBatch => {
      this.addTransaction({
        transaction: tx.asset.addDocuments,
        isCritical: false,
        feeMultiplier: rawDocumentBatch.length,
        args: [rawDocumentBatch, rawTicker],
      });
    });
  }

  return new Asset({ ticker }, context);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Asset, Storage>,
  { ticker, documents }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { customTypeData, status },
  } = this;

  const transactions = [TxTags.asset.CreateAsset];

  if (documents?.length) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  if (customTypeData?.id.isEmpty) {
    transactions.push(TxTags.asset.RegisterCustomAssetType);
  }

  const auth: ProcedureAuthorization = {
    permissions: {
      transactions,
      assets: [],
      portfolios: [],
    },
  };

  if (status !== TickerReservationStatus.Free) {
    return {
      ...auth,
      roles: [{ type: RoleType.TickerOwner, ticker }],
    };
  }
  return auth;
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Asset, Storage>,
  { ticker, assetType }: Params
): Promise<Storage> {
  const { context } = this;

  const reservation = new TickerReservation({ ticker }, context);
  const { status } = await reservation.details();

  const isCustomType = !values<string>(KnownAssetType).includes(assetType);

  if (isCustomType) {
    const rawValue = stringToBytes(assetType, context);
    const id = await context.polymeshApi.query.asset.customTypesInverse(rawValue);

    return {
      customTypeData: {
        id,
        rawValue,
      },
      status,
    };
  }

  return {
    customTypeData: null,
    status,
  };
}

/**
 * @hidden
 */
export const createAsset = (): Procedure<Params, Asset, Storage> =>
  new Procedure(prepareCreateAsset, getAuthorization, prepareStorage);
