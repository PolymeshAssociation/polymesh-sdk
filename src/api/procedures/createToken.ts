import { Bytes } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';
import { AssetType, CustomAssetTypeId, TxTags } from 'polymesh-types/types';

import { createRegisterCustomAssetTypeResolver } from '~/api/procedures/createSecurityToken';
import {
  CreateSecurityTokenParams,
  PolymeshError,
  Procedure,
  SecurityToken,
  TickerReservation,
} from '~/internal';
import { ErrorCode, KnownTokenType, Role, RoleType, TickerReservationStatus } from '~/types';
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
import { batchArguments } from '~/utils/internal';

export type CreateTokenParams = CreateSecurityTokenParams & {
  /**
   * Ticker symbol of Security Token
   */
  ticker: string;
};

/**
 * @hidden
 */
export type Params = CreateTokenParams;

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
export async function prepareCreateToken(
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
    totalSupply: initialSupply,
    isDivisible,
    tokenType,
    tokenIdentifiers = [],
    fundingRound,
    documents,
    requireInvestorUniqueness,
  } = args;

  const reservation = new TickerReservation({ ticker }, context);

  const rawTicker = stringToTicker(ticker, context);

  const [{ status, expiryDate }, classicTicker] = await Promise.all([
    reservation.details(),
    asset.classicTickers(rawTicker),
  ]);

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `A Security Token with ticker "${ticker}" already exists`,
    });
  }

  if (status === TickerReservationStatus.Free) {
    if (expiryDate !== null && expiryDate < new Date()) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `Ticker reservation for "${ticker}" has expired`,
        data: {
          expiryDate,
        },
      });
    }
  }

  const rawName = stringToAssetName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawIdentifiers = tokenIdentifiers.map(identifier =>
    tokenIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = fundingRound ? stringToFundingRoundName(fundingRound, context) : null;
  const rawDisableIu = booleanToBool(!requireInvestorUniqueness, context);

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

  let fee: undefined | BigNumber;

  // we waive any protocol fees
  const tokenCreatedInEthereum =
    classicTicker.isSome && boolToBoolean(classicTicker.unwrap().is_created);
  if (tokenCreatedInEthereum) {
    fee = new BigNumber(0);
  }

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

  const reservation = new TickerReservation({ ticker }, context);

  const { status } = await reservation.details();

  let roles: Role[] = [];

  if (status === TickerReservationStatus.Free) {
    transactions.push(TxTags.asset.RegisterTicker);
  } else {
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
export const createToken = (): Procedure<Params, SecurityToken, Storage> =>
  new Procedure(prepareCreateToken, getAuthorization, prepareStorage);
