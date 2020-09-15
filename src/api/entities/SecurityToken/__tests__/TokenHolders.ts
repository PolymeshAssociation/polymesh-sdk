import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Context, Namespace } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { IdentityBalance, TokenHolderProperties, TransferStatus } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { TokenHolders } from '../TokenHolders';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
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
    requestPaginatedStub = sinon.stub(utilsModule, 'requestPaginated');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
    sinon
      .stub(utilsModule, 'stringToTicker')
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
          tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: new Identity({ did: identity }, context),
          balance,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get();

      expect(result).toEqual({ data: expectedHolders, next: null });
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
        tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
      );

      expectedHolders.push({
        identity: new Identity({ did: identity }, context),
        balance,
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: 'someKey' });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get({ size: 1 });

      expect(result).toEqual({ data: expectedHolders, next: 'someKey' });
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
          tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: new Identity({ did: identity }, context),
          balance,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get();

      expect(result).toEqual({ data: expectedHolders, next: null });
    });

    test('should have canBeIssuedTo set to false for all holders if transfers are frozen', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: (IdentityBalance &
        Pick<TokenHolderProperties, 'canBeIssuedTo'>)[] = [];

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          transfersAreFrozen: true,
        },
      });

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        identityIdToStringStub.withArgs(identityId).returns(identity);
        balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

        balanceOfEntries.push(
          tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: new Identity({ did: identity }, context),
          balance,
          canBeIssuedTo: false,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get({ canBeIssuedTo: true });

      expect(result).toEqual({ data: expectedHolders, next: null });
    });

    test('should return whether each token holder can receive primary issuance if canBeIssuedTo is passed as true', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: (IdentityBalance &
        Pick<TokenHolderProperties, 'canBeIssuedTo'>)[] = [];

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          transfersAreFrozen: false,
        },
      });

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          transfersCanMint: TransferStatus.Success,
        },
      });

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        identityIdToStringStub.withArgs(identityId).returns(identity);
        balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

        balanceOfEntries.push(
          tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: new Identity({ did: identity }, context),
          balance,
          canBeIssuedTo: true,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const token = entityMockUtils.getSecurityTokenInstance();
      const tokenHolders = new TokenHolders(token, context);

      const result = await tokenHolders.get({ canBeIssuedTo: true });

      expect(result).toEqual({ data: expectedHolders, next: null });
    });
  });
});
