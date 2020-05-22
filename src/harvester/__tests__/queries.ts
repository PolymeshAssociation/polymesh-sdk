import { didsWithClaims, gqlArray, gqlNumber, gqlString } from '../queries';

describe('didsWithClaims', () => {
  test('should retrieve a graphql ast object', () => {
    expect(didsWithClaims({}).query).toHaveProperty('kind');
  });
});

describe('gqlNumber', () => {
  test('should retrieve a number if value is not null or undefined', () => {
    const value = 100;
    expect(gqlNumber(value)).toBe(value);
  });

  test('should retrieve null if value is undefined', () => {
    expect(gqlNumber(undefined)).toBeNull();
  });
});

describe('gqlString', () => {
  test('should retrieve an string with double quotes', () => {
    expect(gqlString('someString')).toBe('"someString"');
  });

  test('should retrieve null if value is undefined', () => {
    expect(gqlString(undefined)).toBeNull();
  });
});

describe('gqlArray', () => {
  test('should retrieve an array string representation', () => {
    expect(gqlArray(['someDid', 'otherDid'])).toBe('["someDid","otherDid"]');
  });

  test('should retrieve null if value is undefined', () => {
    expect(gqlArray(undefined)).toBeNull();
  });
});
