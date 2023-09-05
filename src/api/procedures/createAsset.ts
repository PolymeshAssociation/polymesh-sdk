import { Bytes, u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import {
  Asset,
  Context,
  DefaultPortfolio,
  Identity,
  PolymeshError,
  Procedure,
  TickerReservation,
} from '~/internal';
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
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  bigNumberToBalance,
  booleanToBool,
  fundingRoundToAssetFundingRound,
  inputStatTypeToMeshStatType,
  internalAssetTypeToAssetType,
  nameToAssetName,
  portfolioToPortfolioKind,
  securityIdentifierToAssetIdentifier,
  statisticStatTypesToBtreeStatType,
  stringToBytes,
  stringToTicker,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, isAlphanumeric, optionize } from '~/utils/internal';

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
    id: u32;
    rawValue: Bytes;
  } | null;

  status: TickerReservationStatus;

  signingIdentity: Identity;
}

/**
 * Add protocol fees for specific tags to the current accumulated total
 *
 * @returns undefined if fees aren't being calculated manually
 */
async function addManualFees(
  currentFee: BigNumber | undefined,
  tags: TxTag[],
  context: Context
): Promise<BigNumber | undefined> {
  if (!currentFee) {
    return undefined;
  }

  const fees = await context.getProtocolFees({
    tags,
  });

  return fees.reduce((prev, { fees: nextFees }) => prev.plus(nextFees), currentFee);
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
export async function prepareCreateAsset(
  this: Procedure<Params, Asset, Storage>,
  args: Params
): Promise<BatchTransactionSpec<Asset, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { customTypeData, status, signingIdentity },
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
    reservationRequired,
    initialStatistics,
  } = args;

  const { isV5 } = context;
  assertTickerAvailable(ticker, status, reservationRequired);

  const rawTicker = stringToTicker(ticker, context);
  const rawName = nameToAssetName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(fundingRoundToAssetFundingRound)(fundingRound, context);

  const newAsset = new Asset({ ticker }, context);

  const transactions = [];

  let fee: BigNumber | undefined;
  if (status === TickerReservationStatus.Free) {
    fee = await addManualFees(
      new BigNumber(0),
      [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset],
      context
    );
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

    /*
     * We add the fee for registering a custom asset type in case we're calculating
     * the Asset creation fees manually
     */
    fee = await addManualFees(fee, [TxTags.asset.RegisterCustomAssetType], context);

    if (id.isEmpty) {
      const assetArgs = [
        rawName,
        rawTicker,
        rawIsDivisible,
        rawValue,
        rawIdentifiers,
        rawFundingRound,
      ];

      if (isV5) {
        const rawIu = booleanToBool(true, context);
        assetArgs.push(rawIu);
      }
      transactions.push(
        checkTxType({
          transaction: tx.asset.createAssetWithCustomType,
          fee,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: assetArgs as any,
        })
      );
    } else {
      const rawType = internalAssetTypeToAssetType({ Custom: id }, context);

      const assetArgs = [
        rawName,
        rawTicker,
        rawIsDivisible,
        rawType,
        rawIdentifiers,
        rawFundingRound,
      ];

      if (isV5) {
        const rawIu = booleanToBool(true, context);
        assetArgs.push(rawIu);
      }

      transactions.push(
        checkTxType({
          transaction: tx.asset.createAsset,
          fee,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: assetArgs as any,
        })
      );
    }
  } else {
    const rawType = internalAssetTypeToAssetType(assetType as KnownAssetType, context);

    const assetArgs = [
      rawName,
      rawTicker,
      rawIsDivisible,
      rawType,
      rawIdentifiers,
      rawFundingRound,
    ];

    if (isV5) {
      const rawIu = booleanToBool(true, context);
      assetArgs.push(rawIu);
    }

    transactions.push(
      checkTxType({
        transaction: tx.asset.createAsset,
        fee,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: assetArgs as any,
      })
    );
  }

  if (initialStatistics?.length) {
    const tickerKey = stringToTickerKey(ticker, context);
    const rawStats = initialStatistics.map(i => inputStatTypeToMeshStatType(i, context));
    const bTreeStats = statisticStatTypesToBtreeStatType(rawStats, context);

    transactions.push(
      checkTxType({
        transaction: tx.statistics.setActiveAssetStats,
        args: [tickerKey, bTreeStats],
      })
    );
  }

  if (initialSupply && initialSupply.gt(0)) {
    const rawInitialSupply = bigNumberToBalance(initialSupply, context, isDivisible);
    const defaultPortfolio = new DefaultPortfolio({ did: signingIdentity.did }, context);
    const rawPortfolioId = portfolioToPortfolioKind(defaultPortfolio, context);

    const issueArgs: unknown[] = [rawTicker, rawInitialSupply];

    if (!isV5) {
      issueArgs.push(rawPortfolioId);
    }

    transactions.push(
      checkTxType({
        transaction: tx.asset.issue,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: issueArgs as any,
      })
    );
  }

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

  return {
    transactions,
    resolver: newAsset,
  };
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
  const [{ status }, signingIdentity] = await Promise.all([
    reservation.details(),
    context.getSigningIdentity(),
  ]);

  const isCustomType = !values<string>(KnownAssetType).includes(assetType);

  if (isCustomType) {
    const rawValue = stringToBytes(assetType, context);
    const rawId = await context.polymeshApi.query.asset.customTypesInverse(rawValue);

    const id = context.isV5 ? rawId : rawId.unwrapOrDefault();

    return {
      customTypeData: {
        id: id as unknown as u32,
        rawValue,
      },
      status,
      signingIdentity,
    };
  }

  return {
    customTypeData: null,
    status,
    signingIdentity,
  };
}

/**
 * @hidden
 */
export const createAsset = (): Procedure<Params, Asset, Storage> =>
  new Procedure(prepareCreateAsset, getAuthorization, prepareStorage);
