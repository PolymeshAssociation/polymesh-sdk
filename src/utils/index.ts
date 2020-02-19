import { createType } from '@polymathnetwork/polkadot/types/create/createType';
import { Balance, IdentityId } from '@polymathnetwork/polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
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
 * Convert an string to an IdentityId representation
 */
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return createType<'IdentityId'>(context.polymeshApi.registry, 'IdentityId', identityId);
}

/**
 * Convert an IdentityId representation to an string
 */
export function identityIdToString(identityId: IdentityId): string {
  return identityId.toString();
}

/**
 * Convert an human readable number to a Balance representation
 */
export function numberToBalance(value: number, context: Context): Balance {
  return createType<'Balance'>(context.polymeshApi.registry, 'Balance', value * Math.pow(10, 6));
}

/**
 * Convert a Balance representation to a BigNumber
 */
export function balanceToBigNumber(balance: Balance): BigNumber {
  return new BigNumber(Number(balance.toString()) / Math.pow(10, 6));
}
