import { Vec } from '@polkadot/types';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareSetTokenTrustedClaimIssuers,
} from '~/api/procedures/setTokenTrustedClaimIssuers';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('setTokenTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let trustedClaimIssuerStub: sinon.SinonStub;
  let didRecordsStub: sinon.SinonStub & polkadotMockUtils.StubQuery;
  let ticker: string;
  let claimIssuerDids: string[];
  let rawTicker: Ticker;
  let rawClaimIssuerDids: IdentityId[];
  let args: Params;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    ticker = 'someTicker';
    claimIssuerDids = ['aDid', 'otherDid', 'differentDid'];
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    rawClaimIssuerDids = claimIssuerDids.map(polkadotMockUtils.createMockIdentityId);
    /* eslint-enable @typescript-eslint/camelcase */
    args = {
      ticker,
      claimIssuerDids,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let removeDefaultTrustedClaimIssuersBatchTransaction: PolymeshTx<[Ticker, Vec<IdentityId>]>;
  let addDefaultTrustedClaimIssuersBatchTransaction: PolymeshTx<[Ticker, Vec<IdentityId>]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    trustedClaimIssuerStub = polkadotMockUtils.createQueryStub(
      'complianceManager',
      'trustedClaimIssuer',
      {
        returnValue: [],
      }
    );
    didRecordsStub = polkadotMockUtils.createQueryStub('identity', 'didRecords', {
      size: 1,
    });

    removeDefaultTrustedClaimIssuersBatchTransaction = polkadotMockUtils.createTxStub(
      'complianceManager',
      'removeDefaultTrustedClaimIssuersBatch'
    );
    addDefaultTrustedClaimIssuersBatchTransaction = polkadotMockUtils.createTxStub(
      'complianceManager',
      'addDefaultTrustedClaimIssuersBatch'
    );

    mockContext = polkadotMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    claimIssuerDids.forEach((did, index) => {
      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawClaimIssuerDids[index]);
      identityIdToStringStub.withArgs(rawClaimIssuerDids[index]).returns(did);
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the new list is the same as the current one', () => {
    trustedClaimIssuerStub.withArgs(rawTicker).returns(rawClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetTokenTrustedClaimIssuers.call(proc, args)).rejects.toThrow(
      'The supplied claim issuer list is equal to the current one'
    );
  });

  test("should throw an error if some of the supplied dids don't exist", () => {
    const nonExistentDidIndex = 1;
    didRecordsStub.size
      .withArgs(rawClaimIssuerDids[nonExistentDidIndex])
      .resolves(polkadotMockUtils.createMockU64(0));
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetTokenTrustedClaimIssuers.call(proc, args)).rejects.toThrow(
      `Some of the supplied identity IDs do not exist: ${claimIssuerDids[nonExistentDidIndex]}`
    );
  });

  test('should add a remove claim issuers transaction and an add claim issuers transaction to the queue', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenTrustedClaimIssuers.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuersBatchTransaction,
      {},
      rawTicker,
      currentClaimIssuerDids
    );
    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      addDefaultTrustedClaimIssuersBatchTransaction,
      {},
      rawTicker,
      rawClaimIssuerDids
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenTrustedClaimIssuers.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      addDefaultTrustedClaimIssuersBatchTransaction,
      {},
      rawTicker,
      rawClaimIssuerDids
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add an add claim issuers transaction if there are no claim issuers passed as arguments', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuerDids: [],
    });

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuersBatchTransaction,
      {},
      rawTicker,
      currentClaimIssuerDids
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
