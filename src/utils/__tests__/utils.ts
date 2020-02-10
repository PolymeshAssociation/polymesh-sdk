import { checkStringLength } from '~/utils';

describe('checkStringLength', () => {
  const testVariableType = 'myVar';

  test('throws an error when the string length exceeds the 32 character default', () => {
    try {
      checkStringLength('0123456789012345678901234567890123456789', testVariableType);
    } catch (error) {
      expect(error).toEqual(
        new Error(`You must provide a valid ${testVariableType} up to 32 characters long`)
      );
    }
  });

  test('throws an error when the string length is lower than the supplied minimum', () => {
    try {
      checkStringLength('', testVariableType, { minLength: 1, maxLength: 32 });
    } catch (error) {
      expect(error).toEqual(
        new Error(`You must provide a valid ${testVariableType} between 1 and 32 characters long`)
      );
    }
  });

  test('throws an error when the string length is higher than the supplied maximum', () => {
    try {
      checkStringLength('0123456', testVariableType, { minLength: 1, maxLength: 5 });
    } catch (error) {
      expect(error).toEqual(
        new Error(`You must provide a valid ${testVariableType} between 1 and 5 characters long`)
      );
    }
  });
});
