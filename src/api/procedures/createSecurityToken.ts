import BigNumber from 'bignumber.js';
import { AssetIdentifier, IdentifierType } from 'polymesh-types/types';

import { SecurityToken, TickerReservation } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import {
  ErrorCode,
  Role,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
  TokenType,
} from '~/types';
import {
  balanceToBigNumber,
  booleanToBool,
  numberToBalance,
  stringToAssetIdentifier,
  stringToFundingRoundName,
  stringToTicker,
  stringToTokenName,
  tokenDocumentToDocument,
  tokenIdentifierTypeToIdentifierType,
  tokenTypeToAssetType,
} from '~/utils';

export interface CreateSecurityTokenParams {
  name: string;
  totalSupply: BigNumber;
  isDivisible: boolean;
  tokenType: TokenType;
  tokenIdentifiers?: TokenIdentifier[];
  fundingRound?: string;
  documents?: TokenDocument[];
}

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
      polymeshApi: { query, tx },
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

  const [rawFee, balance, { status }] = await Promise.all([
    query.asset.assetCreationFee(),
    context.accountBalance(),
    reservation.details(),
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

  const fee = balanceToBigNumber(rawFee);

  if (balance.lt(fee)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Not enough POLYX balance to pay for token creation',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawTotalSupply = numberToBalance(totalSupply, context);
  const rawName = stringToTokenName(name, context);
  const rawIsDivisible = booleanToBool(isDivisible, context);
  const rawType = tokenTypeToAssetType(tokenType, context);
  const rawIdentifiers = tokenIdentifiers.map<[IdentifierType, AssetIdentifier]>(
    ({ type, value }) => {
      return [
        tokenIdentifierTypeToIdentifierType(type, context),
        stringToAssetIdentifier(value, context),
      ];
    }
  );
  const rawFundingRound = fundingRound ? stringToFundingRoundName(fundingRound, context) : null;

  this.addTransaction(
    tx.asset.createToken,
    {
      fee,
    },
    rawName,
    rawTicker,
    rawTotalSupply,
    rawIsDivisible,
    rawType,
    rawIdentifiers,
    rawFundingRound
  );

  if (documents) {
    const rawDocuments = documents.map(document => tokenDocumentToDocument(document, context));

    this.addTransaction(tx.asset.addDocuments, { isCritical: false }, rawTicker, rawDocuments);
  }

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TickerOwner, ticker }];
}

export const createSecurityToken = new Procedure(prepareCreateSecurityToken, getRequiredRoles);
