import { Bytes } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';
import { AssetType, CustomAssetTypeId, TxTags } from 'polymesh-types/types';

import { Context, PolymeshError, Procedure, SecurityToken, TickerReservation } from '~/internal';
import {
  ErrorCode,
  KnownTokenType,
  Role,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
} from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  boolToBoolean,
  internalTokenTypeToAssetType,
  numberToBalance,
  stringToAssetName,
  stringToBytes,
  stringToFundingRoundName,
  stringToTicker,
  tokenDocumentToDocument,
  tokenIdentifierToAssetIdentifier,
} from '~/utils/conversion';
import { batchArguments, filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createRegisterCustomAssetTypeResolver = (context: Context) => (
  receipt: ISubmittableResult
): AssetType => {
  const [{ data }] = filterEventRecords(receipt, 'asset', 'CustomAssetTypeRegistered');

  return internalTokenTypeToAssetType({ Custom: data[1] }, context);
};

export interface CreateSecurityTokenParams {
  name: string;
  /**
   * amount of tokens that will be minted on creation (optional, default doesn't mint)
   */
  initialSupply?: BigNumber;
  /**
   * whether a single token can be divided into decimal parts
   */
  isDivisible: boolean;
  /**
   * type of security that the token represents (i.e. Equity, Debt, Commodity, etc). Common values are included in the
   *   [[KnownTokenType]] enum, but custom values can be used as well. Custom values must be registered on-chain the first time
   *   they're used, requiring an additional transaction. They aren't tied to a specific Security Token
   */
  tokenType: string;
  /**
   * array of domestic or international alphanumeric security identifiers for the token (ISIN, CUSIP, etc)
   */
  tokenIdentifiers?: TokenIdentifier[];
  /**
   * (optional) funding round in which the token currently is (Series A, Series B, etc)
   */
  fundingRound?: string;
  documents?: TokenDocument[];
  /**
   * whether this asset requires investors to have a Investor Uniqueness Claim in order
   *   to hold it. More information about Investor Uniqueness and PUIS [here](https://developers.polymesh.live/introduction/identity#polymesh-unique-identity-system-puis)
   */
  requireInvestorUniqueness: boolean;
}

export interface CreateSecurityTokenParamsWithTicker extends CreateSecurityTokenParams {
  /**
   * Name of the ticker
   */
  ticker: string;
}

/**
 * @hidden
 */
export type Params = CreateSecurityTokenParamsWithTicker & {
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
}

/**
 * @hidden
 */
export async function prepareCreateSecurityToken(
  this: Procedure<Params, SecurityToken, Storage>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { asset },
      },
    },
    context,
    storage: { customTypeData },
  } = this;
  const {
    ticker,
    name,
    initialSupply,
    isDivisible,
    tokenType,
    tokenIdentifiers = [],
    fundingRound,
    documents,
    requireInvestorUniqueness,
    reservationRequired,
  } = args;

  const reservation = new TickerReservation({ ticker }, context);

  const rawTicker = stringToTicker(ticker, context);

  const [{ status }, classicTicker] = await Promise.all([
    reservation.details(),
    asset.classicTickers(rawTicker),
  ]);

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `A Security Token with ticker "${ticker}" already exists`,
    });
  }

  if (status === TickerReservationStatus.Free && reservationRequired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `You must first reserve ticker "${ticker}" in order to create a Security Token with it`,
    });
  }

  let rawType: MaybePostTransactionValue<AssetType>;

  if (customTypeData) {
    const { rawValue, id } = customTypeData;

    if (id.isEmpty) {
      // if the custom asset type doesn't exist, we create it
      [rawType] = this.addTransaction(
        tx.asset.registerCustomAssetType,
        { resolvers: [createRegisterCustomAssetTypeResolver(context)] },
        rawValue
      );
    } else {
      rawType = internalTokenTypeToAssetType({ Custom: id }, context);
    }
  } else {
    rawType = internalTokenTypeToAssetType(tokenType as KnownTokenType, context);
  }

  const rawName = stringToAssetName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = tokenIdentifiers.map(identifier =>
    tokenIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = fundingRound ? stringToFundingRoundName(fundingRound, context) : null;
  const rawDisableIu = booleanToBool(!requireInvestorUniqueness, context);

  let fee: undefined | BigNumber;

  // we waive any protocol fees
  const tokenCreatedInEthereum =
    classicTicker.isSome && boolToBoolean(classicTicker.unwrap().is_created);
  if (tokenCreatedInEthereum) {
    fee = new BigNumber(0);
  }

  // TODO @shuffledex: refactoring with batching mechanism

  this.addTransaction(
    tx.asset.createAsset,
    { fee },
    rawName,
    rawTicker,
    rawIsDivisible,
    rawType,
    rawIdentifiers,
    rawFundingRound,
    rawDisableIu
  );

  if (initialSupply && initialSupply.gt(0)) {
    const rawInitialSupply = numberToBalance(initialSupply, context, isDivisible);

    this.addTransaction(tx.asset.issue, {}, rawTicker, rawInitialSupply);
  }

  if (documents?.length) {
    const rawDocuments = documents.map(doc => tokenDocumentToDocument(doc, context));
    batchArguments(rawDocuments, TxTags.asset.AddDocuments).forEach(rawDocumentBatch => {
      this.addTransaction(
        tx.asset.addDocuments,
        { isCritical: false, batchSize: rawDocumentBatch.length },
        rawDocumentBatch,
        rawTicker
      );
    });
  }

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, SecurityToken, Storage>,
  { ticker, documents }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { customTypeData },
    context,
  } = this;

  const transactions = [TxTags.asset.CreateAsset];

  if (documents?.length) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  if (customTypeData?.id.isEmpty) {
    transactions.push(TxTags.asset.RegisterCustomAssetType);
  }

  let roles: Role[] = [];

  const reservation = new TickerReservation({ ticker }, context);

  const { status } = await reservation.details();

  if (status !== TickerReservationStatus.Free) {
    roles = [{ type: RoleType.TickerOwner, ticker }];
  }

  const auth: ProcedureAuthorization = {
    permissions: {
      transactions,
      tokens: [],
      portfolios: [],
    },
  };

  if (roles.length) {
    return { ...auth, roles };
  }

  return auth;
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, SecurityToken, Storage>,
  { tokenType }: Params
): Promise<Storage> {
  const { context } = this;

  const isCustomType = !values<string>(KnownTokenType).includes(tokenType);

  if (isCustomType) {
    const rawValue = stringToBytes(tokenType, context);
    const id = await context.polymeshApi.query.asset.customTypesInverse(rawValue);

    return {
      customTypeData: {
        id,
        rawValue,
      },
    };
  }

  return {
    customTypeData: null,
  };
}

/**
 * @hidden
 */
export const createSecurityToken = (): Procedure<Params, SecurityToken, Storage> =>
  new Procedure(prepareCreateSecurityToken, getAuthorization, prepareStorage);
