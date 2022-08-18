import { Bytes } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { Asset, Context, PolymeshError, Procedure, TickerReservation } from '~/internal';
import { CustomAssetTypeId } from '~/polkadot/polymesh';
import {
  AssetTx,
  CreateAssetWithTickerParams,
  ErrorCode,
  KnownAssetType,
  RoleType,
  StatisticsTx,
  TickerReservationStatus,
  TxTag,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  bigNumberToBalance,
  booleanToBool,
  boolToBoolean,
  inputStatTypeToMeshStatType,
  internalAssetTypeToAssetType,
  securityIdentifierToAssetIdentifier,
  statisticStatTypesToBtreeStatType,
  stringToBytes,
  stringToTicker,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, optionize } from '~/utils/internal';

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
 * Add protocol fees for specific tags to the current accumulated total
 *
 * @returns undefined if fees aren't being calculated manually
 */
async function calculateManualFees(
  tags: ({ tag: TxTag; feeMultiplier: BigNumber } | TxTag)[],
  context: Context
): Promise<BigNumber> {
  if (tags.length === 0) {
    return new BigNumber(0);
  }
  const fees = await context.getProtocolFees({
    tags: tags.map(tagData => (typeof tagData !== 'string' ? tagData.tag : tagData)),
  });

  return fees.reduce((prev, { fees: nextFees }, index) => {
    const tagData = tags[index];
    let feeMultiplier = new BigNumber(1);

    if (typeof tagData !== 'string') {
      ({ feeMultiplier } = tagData);
    }

    return prev.plus(nextFees.times(feeMultiplier));
  }, new BigNumber(0));
}

/**
 * @throws if the Ticker is not available
 */
function assertTickerAvailable(
  ticker: string,
  status: TickerReservationStatus,
  reservationRequired: boolean
): void {
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
    initialStatistics,
  } = args;

  assertTickerAvailable(ticker, status, reservationRequired);

  const rawTicker = stringToTicker(ticker, context);
  const rawName = stringToBytes(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(stringToBytes)(fundingRound, context);
  const rawDisableIu = booleanToBool(!requireInvestorUniqueness, context);

  const newAsset = new Asset({ ticker }, context);

  const transactions = [];
  const txTags = [];

  /*
   * we waive any protocol fees if the Asset is created in Ethereum. If not created and ticker is not yet reserved,
   *   we set the fee to the sum of protocol fees for ticker registration and Asset creation.
   *
   * To do this, we keep track of transaction tags, and if manual fee calculations are needed, perform the fee calculation
   * before adding the batch transaction.
   */
  const classicTicker = await asset.classicTickers(rawTicker);
  const assetCreatedInEthereum =
    classicTicker.isSome && boolToBoolean(classicTicker.unwrap().isCreated);

  let manualFees = false;
  if (assetCreatedInEthereum) {
    manualFees = true;
  } else if (status === TickerReservationStatus.Free) {
    manualFees = true;
    txTags.push(TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset);
  }

  /*
   * - if the passed Asset type isn't one of the fixed ones (custom), we check if there is already
   *   an on-chain custom Asset type with that name:
   *   - if not, we create it together with the Asset
   *   - otherwise, we create the asset with the id of the existing custom asset type
   * - if the passed Asset type is a fixed one, we create the asset using that Asset type
   */
  if (customTypeData) {
    const { rawValue, id } = customTypeData;

    if (id.isEmpty) {
      /*
       * store RegisterCustomAssetType fees txTag in case manual fees are being used
       */
      txTags.push(TxTags.asset.RegisterCustomAssetType);

      transactions.push(
        checkTxType({
          transaction: tx.asset.createAssetWithCustomType,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawValue,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
        })
      );
    } else {
      const rawType = internalAssetTypeToAssetType({ Custom: id }, context);

      transactions.push(
        checkTxType({
          transaction: tx.asset.createAsset,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
        })
      );
    }
  } else {
    const rawType = internalAssetTypeToAssetType(assetType as KnownAssetType, context);

    transactions.push(
      checkTxType({
        transaction: tx.asset.createAsset,
        args: [
          rawName,
          rawTicker,
          rawIsDivisible,
          rawType,
          rawIdentifiers,
          rawFundingRound,
          rawDisableIu,
        ],
      })
    );
  }

  if (initialStatistics?.length) {
    const tickerKey = stringToTickerKey(ticker, context);
    const rawStats = initialStatistics.map(i => inputStatTypeToMeshStatType(i, context));
    const bTreeStats = statisticStatTypesToBtreeStatType(rawStats, context);
    /*
     * store set asset stat fees in case manual fees are being used
     */
    txTags.push(TxTags.statistics.SetActiveAssetStats);
    transactions.push(
      checkTxType({
        transaction: tx.statistics.setActiveAssetStats,
        args: [tickerKey, bTreeStats],
      })
    );
  }

  if (initialSupply && initialSupply.gt(0)) {
    const rawInitialSupply = bigNumberToBalance(initialSupply, context, isDivisible);

    /*
     * store issuing fees txTags in case manual fees are being used
     */
    txTags.push(TxTags.asset.Issue);

    transactions.push(
      checkTxType({
        transaction: tx.asset.issue,
        args: [rawTicker, rawInitialSupply],
      })
    );
  }

  if (documents?.length) {
    const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));

    const feeMultiplier = new BigNumber(rawDocuments.length);

    /*
     * store addDocuments txTag in case manual fees are being used
     */
    txTags.push({ tag: TxTags.asset.AddDocuments, feeMultiplier });

    transactions.push(
      checkTxType({
        transaction: tx.asset.addDocuments,
        // this will be ignored if manual fees are passed
        feeMultiplier,
        args: [rawDocuments, rawTicker],
      })
    );
  }

  const fee = manualFees ? await calculateManualFees(txTags, context) : undefined;

  this.addBatchTransaction({
    transactions,
    fee,
  });

  return newAsset;
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Asset, Storage>,
  { ticker, documents, initialStatistics }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { customTypeData, status },
  } = this;

  const transactions: (AssetTx | StatisticsTx)[] = [TxTags.asset.CreateAsset];

  if (documents?.length) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  if (customTypeData?.id.isEmpty) {
    transactions.push(TxTags.asset.RegisterCustomAssetType);
  }

  if (initialStatistics?.length) {
    transactions.push(TxTags.statistics.SetActiveAssetStats);
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
