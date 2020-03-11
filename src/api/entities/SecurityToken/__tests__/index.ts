import { Balance } from '@polymathnetwork/polkadot/types/interfaces';

import { Entity } from '~/base';
import {
  createMockAssetType,
  createMockBalance,
  createMockBool,
  createMockIdentityId,
  createMockSecurityToken,
  createMockTokenName,
  createMockU64,
  PolkadotMockFactory,
} from '~/testUtils/mocks';
import { balanceToBigNumber } from '~/utils';

import { SecurityToken } from '../';

describe('SecurityToken class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker to instance', () => {
      const ticker = 'test';
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      expect(securityToken.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 'someTicker' })).toBe(true);
      expect(SecurityToken.isUniqueIdentifiers({})).toBe(false);
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    test('should return details for a security token', async () => {
      const ticker = 'test';
      const totalSupply = 1000;
      const isDivisible = true;
      const owner = '0x0wn3r';

      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockFactory.createQueryStub(
        'asset',
        'tokens',
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId(owner),
          name: createMockTokenName(ticker),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(isDivisible),
          link_id: createMockU64(3),
          total_supply: createMockBalance(totalSupply),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const details = await securityToken.details();

      expect(details.name).toBe(ticker);
      expect(details.totalSupply).toEqual(balanceToBigNumber((totalSupply as unknown) as Balance));
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
    });
  });
});
