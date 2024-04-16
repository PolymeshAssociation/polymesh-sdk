import { convertSubQueryAssetIdToUuid } from '~/api/entities/ConfidentialAccount/helpers';

describe('convertSubQueryAssetIdToUuid', () => {
  it('converts a valid hex string with 0x prefix to UUID format', () => {
    const hexString = '0x1234567890abcdef1234567890abcdef';
    const expectedUuid = '12345678-90ab-cdef-1234-567890abcdef';
    expect(convertSubQueryAssetIdToUuid(hexString)).toEqual(expectedUuid);
  });

  it('correctly handles a hex string without 0x prefix, directly using it', () => {
    const hexStringWithoutPrefix = '1234567890abcdef1234567890abcdef';
    const expectedUuid = '12345678-90ab-cdef-1234-567890abcdef';
    expect(convertSubQueryAssetIdToUuid(hexStringWithoutPrefix)).toEqual(expectedUuid);
  });

  it('should throw if string is too short', () => {
    const hexString = '12345678';
    expect(() => convertSubQueryAssetIdToUuid(hexString)).toThrow();
  });

  it('should throw if string is too long', () => {
    const hexString = '1234567890abcdef1234567890abcdef12345';
    expect(() => convertSubQueryAssetIdToUuid(hexString)).toThrow();
  });
});
