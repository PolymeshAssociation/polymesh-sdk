import { assertCaAssetValid } from '~/utils/internal';

/**
 * @hidden
 *
 */
export function convertSubQueryAssetIdToUuid(hexString: string): string {
  const cleanString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

  return assertCaAssetValid(cleanString);
}
