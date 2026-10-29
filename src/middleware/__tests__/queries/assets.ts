import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import {
  assetHoldersQuery,
  assetQuery,
  assetTransactionQuery,
  heldNftsQuery,
  nftCollectionHolders,
  nftCollectionHoldersNftsQuery,
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
    const variables = {
      assetId: 'SOME_TICKER',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = assetTransactionQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    const printed = print(result.query);
    expect(printed).toContain('fromAccountId');
    expect(printed).toContain('toAccountId');
    expect(printed).toContain('createdEvent {');
    expect(printed).toContain('extrinsicIdx');

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

describe('heldNftsQuery', () => {
  it('should read the NFTs an Identity holds in the given collections', () => {
    const filters = { identityId: 'someDid', assetIds: ['0x01', '0x02'] };

    const result = heldNftsQuery(filters, new BigNumber(100), new BigNumber(200));

    expect(print(result.query)).toContain('assetId: {in: $assetIds}');
    expect(print(result.query)).toContain('holding: {identityId: {equalTo: $identityId}}');
    expect(print(result.query)).toContain('orderBy: [ASSET_ID_ASC, NFT_ID_ASC]');
    expect(result.variables).toEqual({ ...filters, size: 100, start: 200 });
  });
});

describe('nftCollectionHoldersNftsQuery', () => {
  it('should read the NFTs some Identities hold in a collection', () => {
    const filters = { assetId: '0x01', identityIds: ['someDid', 'otherDid'] };

    const result = nftCollectionHoldersNftsQuery(filters, new BigNumber(100), new BigNumber(0));

    expect(print(result.query)).toContain('holding: {identityId: {in: $identityIds}}');
    expect(print(result.query)).toContain('orderBy: [NFT_ID_ASC]');
    expect(result.variables).toEqual({ ...filters, size: 100, start: 0 });
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
