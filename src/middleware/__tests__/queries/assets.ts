import BigNumber from 'bignumber.js';

import {
  assetHoldersQuery,
  assetQuery,
  assetTransactionQuery,
  nftCollectionHolders,
  nftHoldersQuery,
} from '~/middleware/queries/assets';

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
    };

    let result = nftHoldersQuery(variables);

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

describe('assetTransactionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
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
    expect(result.variables).toEqual({ assetId: 'TICKER' });

    result = nftCollectionHolders(ticker, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      assetId: ticker,
      size: 1,
      start: 0,
    });
  });
});
