import { didsWithClaims } from '../queries';

describe('didsWithClaims', () => {
  test('should return a GraphqlQuery object', () => {
    expect(didsWithClaims({})).toHaveProperty('variables');
    expect(didsWithClaims({})).toHaveProperty('query');
    expect(didsWithClaims({}).query).toHaveProperty('kind');
  });
});
