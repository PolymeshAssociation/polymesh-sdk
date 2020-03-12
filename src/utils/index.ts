import { bool } from '@polymathnetwork/polkadot/types';
import { createType } from '@polymathnetwork/polkadot/types/create/createType';
import {
  Balance,
  EventRecord,
  IdentityId,
  Moment,
  Ticker,
  TokenName,
} from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import BigNumber from 'bignumber.js';
import stringify from 'json-stable-stringify';

import { PolymeshError, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { ErrorCode } from '~/types';
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
export const delay = async (amount: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, amount);
  });
};

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
export function tokenNameToString(name: TokenName): string {
  return name.toString();
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
  return ticker.toString();
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
