import { Bytes, u32 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetID, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import { addManualFees } from '~/api/procedures/utils';
import {
  Context,
  FungibleAsset,
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
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization, TxWithArgs } from '~/types/internal';
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
  stringToAssetId,
  stringToBytes,
  stringToTicker,
} from '~/utils/conversion';
import { checkTxType, isAllowedCharacters, optionize } from '~/utils/internal';

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

  if (!isAllowedCharacters(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New Tickers can only contain alphanumeric values "_", "-", ".", and "/"',
    });
  }
}

/**
 * @hidden
 * - if the passed Asset type isn't one of the fixed ones (custom),
 *   we check if there is already an on-chain custom Asset type with that name:
 *   - if not, we create it together with the Asset
 *   - otherwise, we create the asset with the id of the existing custom asset type
 * - if the passed Asset type is a fixed one, we create the asset using that Asset type
 */
async function getCreateAssetTransaction(
  customTypeData: Storage['customTypeData'],
  context: Context,
  fee: BigNumber | undefined,
  args: Params
): Promise<TxWithArgs<unknown[]>> {
  const {
    polymeshApi: { tx },
    isV6,
  } = context;

  const { ticker, name, isDivisible, assetType, securityIdentifiers = [], fundingRound } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawName = nameToAssetName(name, context);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawNameTickerArgs: any[] = isV6 ? [rawName, rawTicker] : [rawName];
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = securityIdentifiers.map(identifier =>
    securityIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = optionize(fundingRoundToAssetFundingRound)(fundingRound, context);

  if (customTypeData) {
    const { rawValue: rawAssetType, id } = customTypeData;

    if (id.isEmpty) {
      /*
       * We add the fee for registering a custom asset type in case we're calculating
       * the Asset creation fees manually
       */
      fee = await addManualFees(fee, [TxTags.asset.RegisterCustomAssetType], context);
      return checkTxType({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: tx.asset.createAssetWithCustomType as any, // NOSONAR
        fee,
        args: [...rawNameTickerArgs, rawIsDivisible, rawAssetType, rawIdentifiers, rawFundingRound],
      });
    } else {
      const rawType = internalAssetTypeToAssetType({ Custom: id }, context);

      return checkTxType({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: tx.asset.createAsset as any, // NOSONAR
        fee,
        args: [...rawNameTickerArgs, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
      });
    }
  } else {
    const rawType = internalAssetTypeToAssetType(assetType as KnownAssetType, context);

    return checkTxType({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transaction: tx.asset.createAsset as any, // NOSONAR
      fee,
      args: [...rawNameTickerArgs, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
    });
  }
}

/**
 * @hidden
 *
 * since 7.x, we need to separately register ticker first if ticker does not exists and then link to asset
 */
function getTickerTransactions(
  rawTicker: PolymeshPrimitivesTicker,
  rawAssetId: PolymeshPrimitivesAssetAssetID,
  context: Context,
  status: Storage['status']
): TxWithArgs<unknown[]>[] {
  const {
    polymeshApi: { tx },
    isV6,
  } = context;
  const transactions = [];
  if (!isV6) {
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
  }

  return transactions;
}

/**
 * @hidden
 */
async function getDocumentsAndIssueTransaction(
  args: Params,
  rawAssetId: PolymeshPrimitivesAssetAssetID,
  context: Context,
  signingIdentity: Identity
): Promise<TxWithArgs<unknown[]>[]> {
  const {
    polymeshApi: { tx },
  } = context;
  const { initialSupply, portfolioId, isDivisible, documents } = args;

  const transactions = [];

  if (initialSupply?.gt(0)) {
    const rawInitialSupply = bigNumberToBalance(initialSupply, context, isDivisible);

    const portfolio = portfolioId
      ? await signingIdentity.portfolios.getPortfolio({ portfolioId })
      : await signingIdentity.portfolios.getPortfolio();

    const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

    transactions.push(
      checkTxType({
        transaction: tx.asset.issue,
        args: [rawAssetId, rawInitialSupply, rawPortfolio],
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
        args: [rawDocuments, rawAssetId],
      })
    );
  }

  return transactions;
}

/**
 * @hidden
 */
export async function prepareCreateAsset(
  this: Procedure<Params, FungibleAsset, Storage>,
  args: Params
): Promise<BatchTransactionSpec<FungibleAsset, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
    storage: { customTypeData, status, signingIdentity },
  } = this;
  const { ticker, reservationRequired, initialStatistics } = args;

  // to be used as ticker for 6.x chain and next asset id for 7.x chain
  let rawAssetId;
  let assetId: string;

  assertTickerAvailable(ticker, status, reservationRequired);
  const rawTicker = stringToTicker(ticker, context);

  if (isV6) {
    rawAssetId = rawTicker;
    assetId = ticker;
  } else {
    assetId = await context.getSigningAccount().getNextAssetId();
    rawAssetId = stringToAssetId(assetId, context);
  }

  let transactions = [];

  let fee: BigNumber | undefined;
  if (status === TickerReservationStatus.Free) {
    if (isV6) {
      fee = await addManualFees(
        new BigNumber(0),
        [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset],
        context
      );
    } else {
      fee = await addManualFees(new BigNumber(0), [TxTags.asset.CreateAsset], context);
    }
  }

  transactions.push(await getCreateAssetTransaction(customTypeData, context, fee, args));

  // since 7.x, we need to separately register ticker first if ticker does not exists and then link to asset
  transactions = [
    ...transactions,
    ...getTickerTransactions(rawTicker, rawAssetId, context, status),
  ];

  if (initialStatistics?.length) {
    const rawStats = initialStatistics.map(i => inputStatTypeToMeshStatType(i, context));
    const bTreeStats = statisticStatTypesToBtreeStatType(rawStats, context);

    transactions.push(
      checkTxType({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: tx.statistics.setActiveAssetStats as any, // NOSONAR
        args: [isV6 ? { Ticker: rawAssetId } : rawAssetId, bTreeStats],
      })
    );
  }

  transactions = [
    ...transactions,
    ...(await getDocumentsAndIssueTransaction(args, rawAssetId, context, signingIdentity)),
  ];

  return {
    transactions,
    resolver: new FungibleAsset({ assetId }, context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, FungibleAsset, Storage>,
  { ticker, documents, initialStatistics }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { customTypeData, status },
    context: { isV6 },
  } = this;

  const transactions: (AssetTx | StatisticsTx)[] = [TxTags.asset.CreateAsset];

  if (!isV6) {
    if (status === TickerReservationStatus.Free) {
      transactions.push(TxTags.asset.RegisterUniqueTicker);
    }
    if (status !== TickerReservationStatus.AssetCreated) {
      transactions.push(TxTags.asset.LinkTickerToAssetId);
    }
  }

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
  this: Procedure<Params, FungibleAsset, Storage>,
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

    const id = rawId.unwrapOrDefault();

    return {
      customTypeData: {
        id,
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
export const createAsset = (): Procedure<Params, FungibleAsset, Storage> =>
  new Procedure(prepareCreateAsset, getAuthorization, prepareStorage);
