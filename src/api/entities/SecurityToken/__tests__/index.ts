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

  describe('method: name', () => {
    test('should return the name of the Security Token', async () => {
      const ticker = 'test';
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockFactory.createQueryStub(
        'asset',
        'tokens',
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId('did'),
          name: createMockTokenName(ticker),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(true),
          link_id: createMockU64(3),
          total_supply: createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const result = await securityToken.name();

      expect(result).toBe(ticker);
    });
  });

  describe('method: totalSupply', () => {
    test('should return the total supply of the Security Token', async () => {
      const ticker = 'test';
      const totalSupply = 1000;
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockFactory.createQueryStub(
        'asset',
        'tokens',
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId('did'),
          name: createMockTokenName(ticker),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(true),
          link_id: createMockU64(3),
          total_supply: createMockBalance(totalSupply),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const result = await securityToken.totalSupply();

      expect(result.toNumber()).toBe(
        balanceToBigNumber((totalSupply as unknown) as Balance).toNumber()
      );
    });
  });

  describe('method: isDivisible', () => {
    test('should return whether or not the Security Token is divisible', async () => {
      const ticker = 'test';
      const divisible = true;
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockFactory.createQueryStub(
        'asset',
        'tokens',
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId('did'),
          name: createMockTokenName(ticker),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(divisible),
          link_id: createMockU64(3),
          total_supply: createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const result = await securityToken.isDivisible();

      expect(result).toBe(divisible);
    });
  });

  describe('method: owner', () => {
    test('should return the identity owner of the Security Token', async () => {
      const ticker = 'test';
      const did = '0x123';
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockFactory.createQueryStub(
        'asset',
        'tokens',
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId(did),
          name: createMockTokenName(ticker),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(true),
          link_id: createMockU64(3),
          total_supply: createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const result = await securityToken.owner();

      expect(result.did).toBe(did);
    });
  });
});
