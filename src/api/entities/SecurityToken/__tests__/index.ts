import { Balance } from '@polkadot/types/interfaces';
import sinon from 'sinon';

import { modifyToken } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { balanceToBigNumber } from '~/utils';

import { SecurityToken } from '../';

describe('SecurityToken class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker to instance', () => {
      const ticker = 'test';
      const context = polkadotMockUtils.getContextInstance();
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

      const context = polkadotMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: polkadotMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: polkadotMockUtils.createMockIdentityId(owner),
          name: polkadotMockUtils.createMockTokenName(ticker),
          asset_type: polkadotMockUtils.createMockAssetType('equity'),
          divisible: polkadotMockUtils.createMockBool(isDivisible),
          link_id: polkadotMockUtils.createMockU64(3),
          total_supply: polkadotMockUtils.createMockBalance(totalSupply),
          /* eslint-enable @typescript-eslint/camelcase */
        }),
      });

      const details = await securityToken.details();

      expect(details.name).toBe(ticker);
      expect(details.totalSupply).toEqual(balanceToBigNumber((totalSupply as unknown) as Balance));
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
    });
  });

  describe('method: modify', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = polkadotMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const args = {
        makeDivisible: true,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(modifyToken, 'prepare')
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.modify(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
