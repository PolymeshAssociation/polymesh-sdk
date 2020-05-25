import { didsWithClaims, gqlArray, gqlNumber, gqlString } from '../queries';

describe('didsWithClaims', () => {
  test('should return a graphql ast object', () => {
    expect(didsWithClaims({}).query).toHaveProperty('kind');
  });
});

describe('gqlNumber', () => {
  test('should return a number if value is not null or undefined', () => {
    const value = 100;
    expect(gqlNumber(value)).toBe(value);
  });

  test('should return null if value is undefined', () => {
    expect(gqlNumber(undefined)).toBeNull();
  });
});

describe('gqlString', () => {
  test('should return a string with double quotes', () => {
    expect(gqlString('someString')).toBe('"someString"');
  });

  test('should return null if value is undefined', () => {
    expect(gqlString(undefined)).toBeNull();
  });
});

describe('gqlArray', () => {
  test('should return an array string representation', () => {
    expect(gqlArray(['someDid', 'otherDid'])).toBe('["someDid","otherDid"]');
  });

  test('should return null if value is undefined', () => {
    expect(gqlArray(undefined)).toBeNull();
  });
});
