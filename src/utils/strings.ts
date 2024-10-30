import { hexStripPrefix } from '@polkadot/util';

import { PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const hexUuidRegex = /^(0x)?([0-9a-f]{32})$/i;

/**
 * @returns true if input is 32 byte hex encoded string (0x prefix optional)
 */
export const isHexUuid = (input: string): boolean => {
  return hexUuidRegex.test(input);
};

/**
 * @returns true if input is formatted as a UUID e.g. `12341234-1234-1234-1234-123412341234`
 */
export const isUuid = (uuid: string): boolean => {
  return uuidRegex.test(uuid);
};

/**
 * @hidden
 *
 * converts a 32 character hex string into a UUID format e.g `12341234-1234-1234-1234-123412341234`
 */
export const hexToUuid = (input: string): string => {
  const rawHex = hexStripPrefix(input.trim());

  if (!isHexUuid(rawHex)) {
    throw new PolymeshError({
      message: 'hex encoded UUID should have 32 hex characters (16 bytes)',
      code: ErrorCode.ValidationError,
      data: { input },
    });
  }

  const uuid = [
    rawHex.slice(0, 8),
    rawHex.slice(8, 12),
    rawHex.slice(12, 16),
    rawHex.slice(16, 20),
    rawHex.slice(20),
  ].join('-');

  return uuid;
};

/**
 * @hidden
 *
 * converts a UUID into a 32 character, 0x prefixed, hex string e.g. `0x12341234123412341234123412341234`
 */
export const uuidToHex = (uuid: string): string => {
  const trimmedUuid = uuid.trim();

  if (!isUuid(trimmedUuid)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'non uuid cannot be transformed to hex',
      data: { uuid },
    });
  }

  return `0x${trimmedUuid.replace(/-/g, '')}`;
};
