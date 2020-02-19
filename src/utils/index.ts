import { createType } from '@polymathnetwork/polkadot/types/create/createType';
import { Balance, IdentityId } from '@polymathnetwork/polkadot/types/interfaces';
import stringify from 'json-stable-stringify';

import { Context } from '~/base/Context';

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
export function serialize(entityType: string, uniqueIdentifiers: Record<string, unknown>): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * Convert a uuid string to an Identifier object
 */
export function unserialize(id: string): Record<string, unknown> {
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
 * Convert an Identity id string to an IdentityId object
 */
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return createType<'IdentityId'>(context.polymeshApi.registry, 'IdentityId', identityId);
}

/**
 * Convert an IdentityId object to an Identity id string
 */
export function identityIdToString(identityId: IdentityId): string {
  return identityId.toString();
}

/**
 * Convert an human readable number to a Balance object
 */
export function numberToBalance(value: number, context: Context): Balance {
  return createType<'Balance'>(context.polymeshApi.registry, 'Balance', value);
}

/**
 * Convert a Balance object to an human readable number
 */
export function balanceToNumber(balance: Balance): number {
  return Number(balance.toString()) / Math.pow(10, 6);
}
