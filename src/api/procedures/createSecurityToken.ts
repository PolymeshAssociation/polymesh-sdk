import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken, TickerReservation } from '~/internal';
import {
  ErrorCode,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
  TokenType,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  boolToBoolean,
  numberToBalance,
  stringToAssetName,
  stringToFundingRoundName,
  stringToTicker,
  tokenDocumentToDocument,
  tokenIdentifierToAssetIdentifier,
  tokenTypeToAssetType,
} from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

export interface CreateSecurityTokenParams {
  name: string;
  /**
   * amount of tokens that will be minted on creation (optional, default doesn't mint)
   */
  totalSupply?: BigNumber;
  /**
   * whether a single token can be divided into decimal parts
   */
  isDivisible: boolean;
  /**
   * type of security that the token represents (i.e. Equity, Debt, Commodity, etc)
   */
  tokenType: TokenType;
  /**
   * array of domestic or international alphanumeric security identifiers for the token (ISIN, CUSIP, etc)
   */
  tokenIdentifiers?: TokenIdentifier[];
  /**
   * (optional) funding round in which the token currently is (Series A, Series B, etc)
   */
  fundingRound?: string;
  documents?: TokenDocument[];
}

/**
 * @hidden
 */
export type Params = CreateSecurityTokenParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareCreateSecurityToken(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;
  const {
    ticker,
    name,
    totalSupply,
    isDivisible,
    tokenType,
    tokenIdentifiers = [],
    fundingRound,
    documents,
  } = args;

  const reservation = new TickerReservation({ ticker }, context);

  const rawTicker = stringToTicker(ticker, context);

  const [{ status }, classicTicker] = await Promise.all([
    reservation.details(),
    query.asset.classicTickers(rawTicker),
  ]);

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `A Security Token with ticker "${ticker}" already exists`,
    });
  }

  if (status === TickerReservationStatus.Free) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `You must first reserve ticker "${ticker}" in order to create a Security Token with it`,
    });
  }

  const rawName = stringToAssetName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawType = tokenTypeToAssetType(tokenType, context);
  const rawIdentifiers = tokenIdentifiers.map(identifier =>
    tokenIdentifierToAssetIdentifier(identifier, context)
  );
  const rawFundingRound = fundingRound ? stringToFundingRoundName(fundingRound, context) : null;

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
    rawFundingRound
  );

  if (totalSupply && totalSupply.gt(0)) {
    const rawTotalSupply = numberToBalance(totalSupply, context, isDivisible);

    this.addTransaction(tx.asset.issue, {}, rawTicker, rawTotalSupply);
  }

  if (documents) {
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
export function getAuthorization({ ticker, documents }: Params): ProcedureAuthorization {
  const transactions = [TxTags.asset.CreateAsset];

  if (documents) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  return {
    roles: [{ type: RoleType.TickerOwner, ticker }],
    permissions: {
      transactions,
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createSecurityToken = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareCreateSecurityToken, getAuthorization);
