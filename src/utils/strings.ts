import { hexStripPrefix } from '@polkadot/util';

import { PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const hexUuidRegex = /^(0x)?([0-9a-f]{32})$/i;

export const isHexUuid = (hex: string): boolean => {
  return hexUuidRegex.test(hex);
};

export const isUuid = (uuid: string): boolean => {
  return uuidRegex.test(uuid);
};

/**
 * @hidden
 */
export const hexToUuid = (hex: string): string => {
  const rawHex = hexStripPrefix(hex.trim());

  if (!isHexUuid(rawHex)) {
    throw new PolymeshError({
      message: 'hex encoded UUID should have 32 hex characters',
      code: ErrorCode.ValidationError,
      data: { hex },
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
