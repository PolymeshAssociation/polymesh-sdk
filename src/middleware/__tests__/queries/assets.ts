import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import {
  assetHoldersQuery,
  assetQuery,
  assetTransactionQuery,
  nftCollectionHolders,
  nftHoldersQuery,
} from '~/middleware/queries/assets';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('assetQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      id: '0x12341234123412341234123412341234',
    };

    const result = assetQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('assetHoldersQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = assetHoldersQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = assetHoldersQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('nftHoldersQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = nftHoldersQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = nftHoldersQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('assetTransactionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = assetTransactionQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = assetTransactionQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('nftCollectionHoldersQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const ticker = 'TICKER';
    let result = nftCollectionHolders('TICKER');

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ assetId: 'TICKER', size: DEFAULT_GQL_PAGE_SIZE, start: 0 });

    result = nftCollectionHolders(ticker, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      assetId: ticker,
      size: 1,
      start: 0,
    });
  });
});

describe('holder queries', () => {
  it('should select the amount held, which callers need to tell a live holding from a spent one', () => {
    expect(print(assetHoldersQuery({ identityId: 'someDid' }).query)).toContain('amount');
  });

  it('should exclude zero balances in the query, so totalCount and the cursor stay honest', () => {
    const { query, variables } = assetHoldersQuery({ identityId: 'someDid', amount: '0' });

    expect(print(query)).toContain('amount: {greaterThan: $amount}');
    expect(print(query)).toContain('$amount: BigFloat!');
    expect(variables).toMatchObject({ amount: '0' });
  });

  it('should omit the amount filter when it is not asked for', () => {
    expect(print(assetHoldersQuery({ identityId: 'someDid' }).query)).not.toContain('greaterThan');
  });

  it('should exclude collections held down to nothing in the query', () => {
    const { query, variables } = nftHoldersQuery({ identityId: 'someDid', nftIds: [] });

    expect(print(query)).toContain('nftIds: {notEqualTo: $nftIds}');
    expect(print(query)).toContain('$nftIds: JSON!');
    expect(variables).toMatchObject({ nftIds: [] });
  });
});
