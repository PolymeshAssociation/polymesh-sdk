import stringify from 'json-stable-stringify';

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
