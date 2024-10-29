import BigNumber from 'bignumber.js';

import {
  claimsGroupingQuery,
  claimsQuery,
  createCustomClaimTypeQueryFilters,
  customClaimTypeQuery,
  trustedClaimIssuerQuery,
  trustingAssetsQuery,
} from '~/middleware/queries/claims';
import { ClaimTypeEnum } from '~/middleware/types';
import { ClaimScopeTypeEnum } from '~/types';

describe('claimsGroupingQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: { type: ClaimScopeTypeEnum.Ticker, value: 'someScope' },
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: [ClaimTypeEnum.Accredited],
      includeExpired: true,
    };

    const result = claimsGroupingQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('claimsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: { type: ClaimScopeTypeEnum.Ticker, value: 'someScope' },
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: [ClaimTypeEnum.Accredited],
      includeExpired: true,
    };

    let result = claimsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = claimsQuery(
      { ...variables, includeExpired: false },
      new BigNumber(1),
      new BigNumber(0)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      includeExpired: false,
      expiryTimestamp: expect.any(Number),
      size: 1,
      start: 0,
    });
  });

  it('should not include undefined values in the variables', () => {
    const result = claimsQuery({ includeExpired: true });
    expect(result.variables).toEqual({ includeExpired: true });
  });
});

describe('trustedClaimIssuerQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      issuer: 'someDid',
      assetId: 'SOME_TICKER',
    };

    const result = trustedClaimIssuerQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('trustingAssetsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      issuer: 'someDid',
    };

    const result = trustingAssetsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('createCustomClaimTypeQueryFilters', () => {
  it('should return correct args and filter when dids is not provided', () => {
    const result = createCustomClaimTypeQueryFilters({});
    expect(result).toEqual({
      args: '($size: Int, $start: Int)',
      filter: '',
    });
  });

  it('should return correct args and filter when dids is provided', () => {
    const result = createCustomClaimTypeQueryFilters({ dids: ['did1', 'did2'] });
    expect(result).toEqual({
      args: '($size: Int, $start: Int,$dids: [String!])',
      filter: 'filter: { identityId: { in: $dids } },',
    });
  });
});

describe('customClaimTypeQuery', () => {
  it('should return correct query and variables when size, start, and dids are not provided', () => {
    const result = customClaimTypeQuery();
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: undefined, start: undefined, dids: undefined });
  });

  it('should return correct query and variables when size, start, and dids are provided', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(0);
    const dids = ['did1', 'did2'];
    const result = customClaimTypeQuery(size, start, dids);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: size.toNumber(), start: start.toNumber(), dids });
  });
});
