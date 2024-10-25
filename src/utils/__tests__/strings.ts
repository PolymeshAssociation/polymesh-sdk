import { PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { hexToUuid, isHexUuid, isUuid, uuidToHex } from '~/utils/strings';

describe('isHexUuid', () => {
  it('should return true', () => {
    const result = isHexUuid('0x12341234123412341234123412341234');

    expect(result).toEqual(true);
  });

  it('should return false', () => {
    ['0x1234', '1234', ''].forEach(input => {
      const result = isHexUuid(input);

      expect(result).toEqual(false);
    });
  });
});

describe('isUuid', () => {
  it('should return true', () => {
    const result = isUuid('12341234-1234-8234-8234-123412341234');
    expect(result).toEqual(true);
  });

  it('should return false', () => {
    ['0x1234', '1234', '', 'abc-def'].forEach(value => {
      const result = isUuid(value);

      expect(result).toEqual(false);
    });
  });
});

describe('hexToUuid', () => {
  it('should return a uuid value', () => {
    const result = hexToUuid('0x12341234123482341234123412341234');

    expect(result).toEqual('12341234-1234-8234-1234-123412341234');
  });

  it('should throw an error', () => {
    const expectedError = new PolymeshError({
      message: 'hex encoded UUID should have 32 hex characters',
      code: ErrorCode.ValidationError,
    });

    ['0x1234', '1234', ''].forEach(value => {
      expect(() => hexToUuid(value)).toThrow(expectedError);
    });
  });
});

describe('uuidToHex', () => {
  it('should return a hex value', () => {
    const result = uuidToHex('12341234-1234-8234-8234-123412341234');

    expect(result).toEqual('0x12341234123482348234123412341234');
  });

  it('should throw an error', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'non uuid cannot be transformed to hex',
    });

    ['0x1234', '1234', ''].forEach(value => {
      expect(() => uuidToHex(value)).toThrow(expectedError);
    });
  });
});
