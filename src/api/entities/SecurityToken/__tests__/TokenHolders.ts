import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { IdentityBalance } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { TokenHolders } from '../TokenHolders';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('TokenHolders class', () => {
  let ticker: string;
  let mockContext: Mocked<Context>;
  let rawTicker: Ticker;
  let requestPaginatedStub: sinon.SinonStub;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
  const fakeData = [
    {
      identity: 'someIdentity',
      value: 1000,
    },
    {
      identity: 'otherIdentity',
      value: 2000,
    },
  ];

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    ticker = 'TEST';
    mockContext = dsMockUtils.getContextInstance();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
    sinon
      .stub(utilsConversionModule, 'stringToTicker')
      .withArgs(ticker, mockContext)
      .returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(TokenHolders.prototype instanceof Namespace).toBe(true);
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all the token holders with balance', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        identityIdToStringStub.withArgs(identityId).returns(identity);
        balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

        balanceOfEntries.push(
          tuple({ args: [rawTicker, identityId] } as unknown as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: entityMockUtils.getIdentityInstance({ did: identity }),
          balance,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get();

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(expectedHolders));
      expect(result.next).toBeNull();
    });

    test('should retrieve the first page of results with only one token holder', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      const { identity, value } = fakeData[0];
      const identityId = dsMockUtils.createMockIdentityId(identity);
      const fakeBalance = dsMockUtils.createMockBalance(value);
      const balance = new BigNumber(value);

      identityIdToStringStub.withArgs(identityId).returns(identity);
      balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

      balanceOfEntries.push(
        tuple({ args: [rawTicker, identityId] } as unknown as StorageKey, fakeBalance)
      );

      expectedHolders.push({
        identity: entityMockUtils.getIdentityInstance({ did: identity }),
        balance,
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: 'someKey' });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get({ size: 1 });

      expect(result).toEqual({ data: expectedHolders, next: 'someKey' });
    });
  });
});
