import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

describe('Polymesh Error class', () => {
  test('should extend error', () => {
    expect(PolymeshError.prototype instanceof Error).toBe(true);
  });

  describe('constructor', () => {
    test('should assign code and message to instance', () => {
      const code = ErrorCode.FatalError;
      const message = 'Everything has gone to hell';
      const err = new PolymeshError({ code, message });

      expect(err.code).toBe(code);
      expect(err.message).toBe(message);
    });

    test('should assign a default message if none is given', () => {
      const code = ErrorCode.FatalError;
      const err = new PolymeshError({ code });

      expect(err.code).toBe(code);
      expect(err.message).toBe(`Unknown error, code: ${code}`);
    });
  });
});
