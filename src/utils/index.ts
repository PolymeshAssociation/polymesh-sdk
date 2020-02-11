import stringify from 'json-stable-stringify';
import { Pojo } from '../types';

/**
 * Check the length of a given string to ensure it meets correct bounds
 *
 * @param value - the string itself
 * @param variableName - the name of the variable associated to the string itself
 * @param opts - optional min and max length of the string. Defaults to a minimum of 0 (empty string) and a maximum of 32 characters
 */
export function checkStringLength(
  value: string,
  variableName: string,
  opts: { minLength?: number; maxLength: number } = { maxLength: 32 }
): void {
  const { minLength = 0, maxLength } = opts;
  if (value.length < minLength || value.length > maxLength) {
    throw new Error(
      `You must provide a valid ${variableName} ${
        opts.minLength !== undefined
          ? `between ${minLength} and ${maxLength}`
          : `up to ${maxLength}`
      } characters long`
    );
  }
}

/**
 * Convert an entity type and its unique Identifiers to a base64 string
 */
export function serialize(entityType: string, uniqueIdentifiers: Pojo): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * Convert a uuid string to an Identifier object
 */
export function unserialize(id: string): Pojo {
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
