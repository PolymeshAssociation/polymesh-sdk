import { DefaultPortfolio, Portfolio } from '~/api/entities';

describe('DefaultPortfolio class', () => {
  test('should extend Portfolio', () => {
    expect(DefaultPortfolio.prototype instanceof Portfolio).toBe(true);
  });
});
