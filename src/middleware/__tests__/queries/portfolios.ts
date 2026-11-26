import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import {
  portfolioMovementsQuery,
  portfolioQuery,
  portfoliosMovementsQuery,
} from '~/middleware/queries/portfolios';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('portfolioQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      number: 1,
    };

    const result = portfolioQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('portfolioMovementsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      portfolioId: new BigNumber(1),
      assetId: '0x12341234123412341234123412341234',
      address: 'someAddress',
    };

    const result = portfolioMovementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      address: 'someAddress',
      assetId: '0x12341234123412341234123412341234',
      from: 'someDid/1',
      to: 'someDid/1',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });

    expect(
      portfolioMovementsQuery(variables, new BigNumber(100), new BigNumber(200)).variables
    ).toEqual(expect.objectContaining({ size: 100, start: 200 }));
  });

  it('should read the transfers between two holders that no instruction made', () => {
    const printed = print(portfolioMovementsQuery({ identityId: 'someDid' }).query);

    expect(printed).not.toContain('isInternalTransfer');
    expect(printed).toContain('instructionId: {isNull: true}');
    expect(printed).toContain(
      'or: [{fromPortfolioId: {isNull: false}}, {fromAccountId: {isNull: false}}]'
    );
    expect(printed).toContain(
      'or: [{toPortfolioId: {isNull: false}}, {toAccountId: {isNull: false}}]'
    );
    expect(printed).not.toContain('IdentityId: {isNull: false}');
    expect(printed).toContain('fromPortfolioId: {equalTo: $from}');
    expect(printed).toContain('totalCount');
  });
});

describe('portfoliosMovementsQuery', () => {
  it('should match either side by Identity', () => {
    const result = portfoliosMovementsQuery({ identityId: 'someDid' });

    expect(result.variables).toEqual({
      from: 'someDid',
      to: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });
    expect(print(result.query)).toContain('fromIdentityId: {equalTo: $from}');
    expect(print(result.query)).toContain('toIdentityId: {equalTo: $to}');
  });

  it('should select both kinds of holder on each side, and its Identity', () => {
    const printed = print(portfolioMovementsQuery({ identityId: 'someDid' }).query);

    ['fromIdentityId', 'fromAccountId', 'toIdentityId', 'toAccountId'].forEach(field =>
      expect(printed).toContain(field)
    );
  });
});
