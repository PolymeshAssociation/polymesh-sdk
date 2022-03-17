import { ErrorCode } from '~/types';

import { PolymeshError } from '../PolymeshError';

describe('Polymesh Error class', () => {
  it('should extend error', () => {
    expect(PolymeshError.prototype instanceof Error).toBe(true);
  });

  describe('constructor', () => {
    it('should assign code and message to instance', () => {
      const code = ErrorCode.FatalError;
      const message = 'Everything has gone to hell';
      const err = new PolymeshError({ code, message });

      expect(err.code).toBe(code);
      expect(err.message).toBe(message);
    });

    it('should assign a default message if none is given', () => {
      const code = ErrorCode.FatalError;
      const err = new PolymeshError({ code });

      expect(err.code).toBe(code);
      expect(err.message).toBe(`Unknown error, code: ${code}`);
    });
  });
});
