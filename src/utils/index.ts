import { bool } from '@polkadot/types';
import { createType } from '@polkadot/types/create/createType';
import { Balance, EventRecord, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { u8aToString } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import stringify from 'json-stable-stringify';
import {
  AssetIdentifier,
  AssetType,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  Ticker,
  TokenName,
} from 'polymesh-types/types';

import { PolymeshError, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import {
  ErrorCode,
  KnownTokenIdentifierType,
  KnownTokenType,
  TokenIdentifierType,
  TokenType,
} from '~/types';
import {
  Extrinsics,
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
} from '~/types/internal';

/**
 * Promisified version of a timeout
 *
 * @param amount - time to wait
 */
export async function delay(amount: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, amount);
  });
}

/**
 * Convert an entity type and its unique Identifiers to a base64 string
 */
export function serialize<UniqueIdentifiers extends object>(
  entityType: string,
  uniqueIdentifiers: UniqueIdentifiers
): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * Convert a uuid string to an Identifier object
 */
export function unserialize<UniqueIdentifiers extends object>(id: string): UniqueIdentifiers {
  const unserialized = Buffer.from(id, 'base64').toString('utf8');

  const matched = unserialized.match(/^.*?:(.*)/);

  const errorMsg = 'Wrong ID format';

  if (!matched) {
    throw new Error(errorMsg);
  }

  const [, jsonString] = matched;

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(errorMsg);
  }
}

/**
 * @hidden
 */
export function stringToTokenName(name: string, context: Context): TokenName {
  return createType<'TokenName'>(context.polymeshApi.registry, 'TokenName', name);
}

/**
 * @hidden
 */
export function tokenNameToString(name: TokenName): string {
  return name.toString();
}

/**
 * @hidden
 */
export function booleanToBool(value: boolean, context: Context): bool {
  return createType<'bool'>(context.polymeshApi.registry, 'bool', value);
}

/**
 * @hidden
 */
export function boolToBoolean(value: bool): boolean {
  return value.isTrue;
}

/**
 * @hidden
 */
export function stringToTicker(ticker: string, context: Context): Ticker {
  return createType<'Ticker'>(context.polymeshApi.registry, 'Ticker', ticker);
}

/**
 * @hidden
 */
export function tickerToString(ticker: Ticker): string {
  return u8aToString(ticker);
}

/**
 * @hidden
 */
export function dateToMoment(date: Date, context: Context): Moment {
  return createType<'Moment'>(context.polymeshApi.registry, 'Moment', Math.round(date.getTime()));
}

/**
 * @hidden
 */
export function momentToDate(moment: Moment): Date {
  return new Date(moment.toNumber());
}

/**
 * @hidden
 */
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return createType<'IdentityId'>(context.polymeshApi.registry, 'IdentityId', identityId);
}

/**
 * @hidden
 */
export function identityIdToString(identityId: IdentityId): string {
  return identityId.toString();
}

/**
 * @hidden
 */
export function numberToBalance(value: number | BigNumber, context: Context): Balance {
  return createType<'Balance'>(
    context.polymeshApi.registry,
    'Balance',
    new BigNumber(value).pow(Math.pow(10, 6))
  );
}

/**
 * @hidden
 */
export function balanceToBigNumber(balance: Balance): BigNumber {
  return new BigNumber(balance.toString()).div(Math.pow(10, 6));
}

/**
 * @hidden
 */
export function tokenTypeToAssetType(type: TokenType, context: Context): AssetType {
  return createType<'AssetType'>(context.polymeshApi.registry, 'AssetType', type);
}

/**
 * @hidden
 */
export function assetTypeToString(assetType: AssetType): string {
  if (assetType.isCommodity) {
    return KnownTokenType.Commodity;
  }
  if (assetType.isDebt) {
    return KnownTokenType.Debt;
  }
  if (assetType.isEquity) {
    return KnownTokenType.Equity;
  }
  if (assetType.isStructuredProduct) {
    return KnownTokenType.StructuredProduct;
  }

  return u8aToString(assetType.asCustom);
}

/**
 * @hidden
 */
export function tokenIdentifierTypeToIdentifierType(
  type: TokenIdentifierType,
  context: Context
): IdentifierType {
  return createType<'IdentifierType'>(context.polymeshApi.registry, 'IdentifierType', type);
}

/**
 * @hidden
 */
export function identifierTypeToTokenIdentifierType(type: IdentifierType): string {
  if (type.isCusip) {
    return KnownTokenIdentifierType.Cusip;
  }
  if (type.isIsin) {
    return KnownTokenIdentifierType.Isin;
  }

  return u8aToString(type.asCustom);
}

/**
 * @hidden
 */
export function stringToAssetIdentifier(id: string, context: Context): AssetIdentifier {
  return createType<'AssetIdentifier'>(context.polymeshApi.registry, 'AssetIdentifier', id);
}

/**
 * @hidden
 */
export function assetIdentifierToString(id: AssetIdentifier): string {
  return id.toString();
}

/**
 * @hidden
 */
export function stringToFundingRoundName(roundName: string, context: Context): FundingRoundName {
  return createType<'FundingRoundName'>(
    context.polymeshApi.registry,
    'FundingRoundName',
    roundName
  );
}

/**
 * @hidden
 */
export function fundingRoundNameToString(roundName: FundingRoundName): string {
  return roundName.toString();
}

/**
 * Unwrap a Post Transaction Value
 */
export function unwrapValue<T extends unknown>(value: MaybePostTransactionValue<T>): T {
  if (value instanceof PostTransactionValue) {
    return value.value;
  }

  return value;
}

/**
 * Unwrap all Post Transaction Values present in a tuple
 */
export function unwrapValues<T extends unknown[]>(values: MapMaybePostTransactionValue<T>): T {
  return values.map(unwrapValue) as T;
}

// TODO @monitz87: use event enum instead of string when it exists
/**
 * @hidden
 * Find a specific event inside a receipt
 *
 * @throws If the event is not found
 */
export function findEventRecord(
  receipt: ISubmittableResult,
  mod: keyof Extrinsics,
  eventName: string
): EventRecord {
  const eventRecord = receipt.findRecord(mod, eventName);

  if (!eventRecord) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`,
    });
  }

  return eventRecord;
}
