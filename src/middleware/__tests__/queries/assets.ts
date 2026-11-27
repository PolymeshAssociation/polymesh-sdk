import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import {
  assetHoldersQuery,
  assetQuery,
  assetTransactionQuery,
  heldNftsQuery,
  nftCollectionHolders,
  nftHoldersQuery,
} from '~/middleware/queries/assets';
import { AssetHoldersOrderBy } from '~/middleware/types';
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
    let result = assetTransactionQuery({ assetId: 'SOME_TICKER' });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      assetId: 'SOME_TICKER',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });

    const printed = print(result.query);
    expect(printed).toContain('fromAccountId');
    expect(printed).toContain('toAccountId');
    expect(printed).toContain('isInternalTransfer');
    expect(printed).toContain('memo');
    expect(printed).toContain('createdEvent {');
    expect(printed).toContain('extrinsicIdx');
    expect(printed).not.toContain('and:');

    result = assetTransactionQuery({ assetId: 'SOME_TICKER' }, new BigNumber(1), new BigNumber(0));

    expect(result.variables).toEqual({ assetId: 'SOME_TICKER', size: 1, start: 0 });
  });

  it('should match a portfolio or an Account holder on either side', () => {
    let result = assetTransactionQuery({
      assetId: 'SOME_TICKER',
      holder: { portfolioId: 'someDid/1' },
    });

    expect(result.variables).toEqual(expect.objectContaining({ holder: 'someDid/1' }));
    expect(print(result.query)).toContain(
      'and: [{or: [{fromPortfolioId: {equalTo: $holder}}, {toPortfolioId: {equalTo: $holder}}]}]'
    );

    result = assetTransactionQuery({
      assetId: 'SOME_TICKER',
      holder: { accountId: 'someAddress' },
    });

    expect(result.variables).toEqual(expect.objectContaining({ holder: 'someAddress' }));
    expect(print(result.query)).toContain(
      '{or: [{fromAccountId: {equalTo: $holder}}, {toAccountId: {equalTo: $holder}}]}'
    );
  });

  it('should match an Identity on either side, together with a holder', () => {
    const result = assetTransactionQuery({
      assetId: 'SOME_TICKER',
      holder: { portfolioId: 'someDid/0' },
      identityId: 'someDid',
    });

    expect(result.variables).toEqual({
      assetId: 'SOME_TICKER',
      holder: 'someDid/0',
      identityId: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });

    const printed = print(result.query);
    expect(printed).toContain('$identityId: String!');
    expect(printed).toContain(
      '{or: [{fromIdentityId: {equalTo: $identityId}}, {toIdentityId: {equalTo: $identityId}}]}]'
    );
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

describe('heldNftsQuery', () => {
  it('should read the NFTs an Identity holds in one collection', () => {
    const filters = { identityId: 'someDid', assetId: '0x01' };

    const result = heldNftsQuery(filters, new BigNumber(10), new BigNumber(20));

    expect(print(result.query)).toContain('assetId: {equalTo: $assetId}');
    expect(print(result.query)).toContain('holding: {identityId: {equalTo: $identityId}}');
    expect(print(result.query)).toContain('orderBy: [NFT_ID_ASC]');
    expect(print(result.query)).toContain('totalCount');
    expect(result.variables).toEqual({ ...filters, size: 10, start: 20 });
  });
});

describe('holder queries', () => {
  const identityId = 'someDid';

  it('should select the amount held, which callers need to tell a live holding from a spent one', () => {
    expect(print(assetHoldersQuery({ identityId }).query)).toContain('amount');
  });

  it('should exclude zero balances in the query, so totalCount and the cursor stay honest', () => {
    const { query, variables } = assetHoldersQuery({ identityId, amount: '0' });

    expect(print(query)).toContain('amount: {greaterThan: $amount}');
    expect(print(query)).toContain('$amount: BigFloat!');
    expect(variables).toMatchObject({ amount: '0' });
  });

  it('should leave out NFT collections, which share the holding table', () => {
    expect(print(assetHoldersQuery({ identityId }).query)).toContain(
      'asset: {isNftCollection: {equalTo: false}}'
    );
    expect(print(assetHoldersQuery({ identityId, amount: '0' }).query)).toContain(
      'asset: {isNftCollection: {equalTo: false}}'
    );
  });

  it('should omit the amount filter when it is not asked for', () => {
    expect(print(assetHoldersQuery({ identityId }).query)).not.toContain('greaterThan');
  });

  it('should map the createdAt orderings onto event order, which the indexer exposes', () => {
    expect(
      print(
        assetHoldersQuery({ identityId }, undefined, undefined, AssetHoldersOrderBy.CreatedAtAsc)
          .query
      )
    ).toContain('orderBy: [CREATED_EVENT_ID_ASC, ASSET_ID_ASC]');
    expect(
      print(
        assetHoldersQuery({ identityId }, undefined, undefined, AssetHoldersOrderBy.CreatedAtDesc)
          .query
      )
    ).toContain('orderBy: [CREATED_EVENT_ID_DESC, ASSET_ID_ASC]');
    expect(
      print(
        nftHoldersQuery({ identityId }, undefined, undefined, AssetHoldersOrderBy.CreatedAtAsc)
          .query
      )
    ).toContain('orderBy: [CREATED_EVENT_ID_ASC, ASSET_ID_ASC]');
    expect(
      print(
        nftHoldersQuery({ identityId }, undefined, undefined, AssetHoldersOrderBy.CreatedAtDesc)
          .query
      )
    ).toContain('orderBy: [CREATED_EVENT_ID_DESC, ASSET_ID_ASC]');
  });

  it('should only read NFT collections', () => {
    expect(print(nftHoldersQuery({ identityId }).query)).toContain(
      'asset: {isNftCollection: {equalTo: true}}'
    );
  });

  it('should exclude collections held down to nothing in the query', () => {
    const { query, variables } = nftHoldersQuery({ identityId, heldNow: true });

    expect(print(query)).toContain('nftCount: {greaterThan: 0}');
    expect(variables).toEqual({ identityId, size: DEFAULT_GQL_PAGE_SIZE, start: 0 });
    expect(print(nftHoldersQuery({ identityId }).query)).not.toContain('nftCount: {');
  });
});
