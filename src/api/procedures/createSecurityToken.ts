import BigNumber from 'bignumber.js';
import { AssetIdentifier, IdentifierType, TxTags } from 'polymesh-types/types';

import { SecurityToken, TickerReservation } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import {
  ErrorCode,
  Identity,
  Role,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
  TokenType,
} from '~/types';
import { tuple } from '~/types/utils';
import {
  batchArguments,
  booleanToBool,
  numberToBalance,
  signerToString,
  stringToAssetIdentifier,
  stringToAssetName,
  stringToDocumentName,
  stringToFundingRoundName,
  stringToIdentityId,
  stringToTicker,
  tokenDocumentDataToDocument,
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
  treasury?: string | Identity;
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
      polymeshApi: { tx },
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
    treasury,
    documents,
  } = args;

  const reservation = new TickerReservation({ ticker }, context);

  const { status } = await reservation.details();

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

  const rawTicker = stringToTicker(ticker, context);
  const rawTotalSupply = numberToBalance(totalSupply, context);
  const rawName = stringToAssetName(name, context);
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
  const rawTreasury = treasury ? stringToIdentityId(signerToString(treasury), context) : null;

  this.addTransaction(
    tx.asset.createAsset,
    {},
    rawName,
    rawTicker,
    rawTotalSupply,
    rawIsDivisible,
    rawType,
    rawIdentifiers,
    rawFundingRound,
    rawTreasury
  );

  if (documents) {
    const rawDocuments = documents.map(({ name: documentName, ...documentData }) =>
      tuple(
        stringToDocumentName(documentName, context),
        tokenDocumentDataToDocument(documentData, context)
      )
    );
    batchArguments(rawDocuments, TxTags.asset.BatchAddDocument).forEach(rawDocumentBatch => {
      this.addTransaction(
        tx.asset.batchAddDocument,
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
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TickerOwner, ticker }];
}

/**
 * @hidden
 */
export const createSecurityToken = new Procedure(prepareCreateSecurityToken, getRequiredRoles);
