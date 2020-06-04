import BigNumber from 'bignumber.js';
import { chunk } from 'lodash';
import { AssetIdentifier, IdentifierType, TxTags } from 'polymesh-types/types';

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
  booleanToBool,
  numberToBalance,
  stringToAssetIdentifier,
  stringToAssetName,
  stringToFundingRoundName,
  stringToTicker,
  tokenDocumentToDocument,
  tokenIdentifierTypeToIdentifierType,
  tokenTypeToAssetType,
} from '~/utils';
import { MAX_BATCH_ELEMENTS } from '~/utils/constants';

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

  this.addTransaction(
    tx.asset.createAsset,
    {},
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
    chunk(rawDocuments, MAX_BATCH_ELEMENTS[TxTags.asset.AddDocuments]).forEach(rawDocumentChunk => {
      this.addTransaction(
        tx.asset.addDocuments,
        { isCritical: false, batchSize: rawDocumentChunk.length },
        rawTicker,
        rawDocumentChunk
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

export const createSecurityToken = new Procedure(prepareCreateSecurityToken, getRequiredRoles);
