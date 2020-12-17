import { DefaultPortfolio, Portfolio } from '~/internal';

describe('DefaultPortfolio class', () => {
  test('should extend Portfolio', () => {
    expect(DefaultPortfolio.prototype instanceof Portfolio).toBe(true);
  });
});
