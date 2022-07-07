import { Bytes } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { Asset, Context, PolymeshError, Procedure, TickerReservation } from '~/internal';
import { CustomAssetTypeId } from '~/polkadot/polymesh';
import {
  CreateAssetWithTickerParams,
  ErrorCode,
  KnownAssetType,
  RoleType,
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
  internalAssetTypeToAssetType,
  securityIdentifierToAssetIdentifier,
  stringToBytes,
  stringToTicker,
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
async function addManualFees(
  currentFee: BigNumber | undefined,
  tags: { tag: TxTag; feeMultiplier: BigNumber }[] | TxTag[],
  context: Context
): Promise<BigNumber | undefined> {
  if (!currentFee) {
    return undefined;
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
  }, currentFee);
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

  const rawTicker = stringToTicker(ticker, context);
  const rawName = stringToBytes(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(stringToBytes)(fundingRound, context);
  const rawDisableIu = booleanToBool(!requireInvestorUniqueness, context);

  const newAsset = new Asset({ ticker }, context);

  let fee: undefined | BigNumber;

  /*
   * we waive any protocol fees if the Asset is created in Ethereum. If not created and ticker is not yet reserved,
   *   we set the fee to the sum of protocol fees for ticker registration and Asset creation.
   */
  const classicTicker = await asset.classicTickers(rawTicker);
  const assetCreatedInEthereum =
    classicTicker.isSome && boolToBoolean(classicTicker.unwrap().isCreated);

  if (assetCreatedInEthereum) {
    fee = new BigNumber(0);
  } else if (status === TickerReservationStatus.Free) {
    fee = await addManualFees(
      new BigNumber(0),
      [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset],
      context
    );
  }

  const transactions = [];

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
       * if we're using custom fees because we're creating the Asset without registering first, we have to manually add
       *   the fees for registering a custom Asset type
       */
      fee = await addManualFees(fee, [TxTags.asset.RegisterCustomAssetType], context);

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

  if (initialSupply && initialSupply.gt(0)) {
    const rawInitialSupply = bigNumberToBalance(initialSupply, context, isDivisible);

    /*
     * if we're using custom fees because we're creating the Asset without registering first, we have to manually add
     *   the fees for issuing
     */
    fee = await addManualFees(fee, [TxTags.asset.Issue], context);

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
     * if we're using custom fees because we're creating the Asset without registering first, we have to manually add
     *   the fees for adding documents
     */
    fee = await addManualFees(fee, [{ tag: TxTags.asset.AddDocuments, feeMultiplier }], context);

    transactions.push(
      checkTxType({
        transaction: tx.asset.addDocuments,
        // this will be ignored if manual fees are passed
        feeMultiplier,
        args: [rawDocuments, rawTicker],
      })
    );
  }

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
