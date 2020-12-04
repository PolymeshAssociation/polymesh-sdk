import { Vec } from '@polkadot/types';
import { IdentityId, Ticker, TrustedIssuer } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getRequiredRoles,
  Params,
  prepareModifyTokenTrustedClaimIssuers,
} from '~/api/procedures/modifyTokenTrustedClaimIssuers';
import { Context, Identity, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TrustedClaimIssuer } from '~/types';
import { PolymeshTx, TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifyTokenTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let trustedClaimIssuerToTrustedIssuerStub: sinon.SinonStub<
    [TrustedClaimIssuer, Context],
    TrustedIssuer
  >;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let trustedClaimIssuerStub: sinon.SinonStub;
  let ticker: string;
  let claimIssuerDids: string[];
  let claimIssuers: TrustedClaimIssuer[];
  let rawTicker: Ticker;
  let rawClaimIssuers: TrustedIssuer[];
  let args: Omit<Omit<Params, 'operation'>, 'claimIssuers'>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    trustedClaimIssuerToTrustedIssuerStub = sinon.stub(
      utilsConversionModule,
      'trustedClaimIssuerToTrustedIssuer'
    );
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    ticker = 'someTicker';
    claimIssuerDids = ['aDid', 'otherDid', 'differentDid'];
    claimIssuers = claimIssuerDids.map(did => ({
      identity: new Identity({ did }, mockContext),
    }));
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawClaimIssuers = claimIssuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        // eslint-disable-next-line @typescript-eslint/camelcase
        trusted_for: dsMockUtils.createMockTrustedFor('Any'),
      })
    );
    args = {
      ticker,
    };
  });

  let addBatchTransactionStub: sinon.SinonStub;

  let removeDefaultTrustedClaimIssuerTransaction: PolymeshTx<[Vec<IdentityId>, Ticker]>;
  let addDefaultTrustedClaimIssuerTransaction: PolymeshTx<[Vec<IdentityId>, Ticker]>;

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();

    trustedClaimIssuerStub = dsMockUtils.createQueryStub(
      'complianceManager',
      'trustedClaimIssuer',
      {
        returnValue: [],
      }
    );

    removeDefaultTrustedClaimIssuerTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'removeDefaultTrustedClaimIssuer'
    );
    addDefaultTrustedClaimIssuerTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'addDefaultTrustedClaimIssuer'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    claimIssuerDids.forEach((did, index) => {
      trustedClaimIssuerToTrustedIssuerStub
        .withArgs(sinon.match({ identity: sinon.match({ did }) }), mockContext)
        .returns(rawClaimIssuers[index]);
    });
    claimIssuers.forEach((issuer, index) => {
      identityIdToStringStub.withArgs(rawClaimIssuers[index].issuer).returns(issuer.identity.did);
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the new list is the same as the current one (set)', () => {
    const alternativeClaimIssuers: TrustedIssuer[] = rawClaimIssuers.map(({ issuer }) =>
      dsMockUtils.createMockTrustedIssuer({
        issuer,
        // eslint-disable-next-line @typescript-eslint/camelcase
        trusted_for: dsMockUtils.createMockTrustedFor({ Specific: [] }),
      })
    );
    trustedClaimIssuerStub.withArgs(rawTicker).returns(alternativeClaimIssuers);
    claimIssuerDids.forEach((did, index) => {
      trustedClaimIssuerToTrustedIssuerStub
        .withArgs(sinon.match({ identity: sinon.match({ did }) }), mockContext)
        .returns(alternativeClaimIssuers[index]);
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers: claimIssuers.map(({ identity }) => ({ identity, trustedFor: [] })),
        operation: TrustedClaimIssuerOperation.Set,
      })
    ).rejects.toThrow('The supplied claim issuer list is equal to the current one');
  });

  test("should throw an error if some of the supplied dids don't exist", async () => {
    const nonExistentDid = claimIssuerDids[1];
    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [nonExistentDid] } });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers,
        operation: TrustedClaimIssuerOperation.Set,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the supplied Identity IDs do not exist');
    expect(error.data).toMatchObject({ nonExistentDids: [nonExistentDid] });
  });

  test('should add a transaction to remove the current claim issuers and another one to add the ones in the input (set)', async () => {
    const currentClaimIssuers = rawClaimIssuers.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers,
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuers.map(issuer => [rawTicker, issuer])
    );
    sinon.assert.calledWith(
      addBatchTransactionStub.secondCall,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuers.map(issuer => [rawTicker, issuer])
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token (set)', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: claimIssuers.map(({ identity: { did }, trustedFor }) => ({
        identity: did,
        trustedFor,
      })),
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuers.map(issuer => [rawTicker, issuer])
    );
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add an add claim issuers transaction if there are no claim issuers passed as arguments (set)', async () => {
    const currentClaimIssuers = rawClaimIssuers.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: [],
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuers.map(issuer => [rawTicker, issuer])
    );
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should throw an error if trying to remove an Identity that is not a trusted claim issuer', async () => {
    const currentClaimIssuers: IdentityId[] = [];
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers: claimIssuerDids,
        operation: TrustedClaimIssuerOperation.Remove,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities are not Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ notPresent: claimIssuerDids });
  });

  test('should add a transaction to remove the supplied Trusted Claim Issuers (remove)', async () => {
    const currentClaimIssuers = rawClaimIssuers;
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: claimIssuerDids,
      operation: TrustedClaimIssuerOperation.Remove,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuers.map(issuer => [rawTicker, issuer])
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should throw an error if trying to add an Identity that is already a Trusted Claim Issuer', async () => {
    const currentClaimIssuers = rawClaimIssuers;
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers,
        operation: TrustedClaimIssuerOperation.Add,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities already are Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ present: claimIssuerDids });
  });

  test('should add a transaction to add the supplied Trusted Claim Issuers (add)', async () => {
    const currentClaimIssuers: IdentityId[] = [];
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers,
      operation: TrustedClaimIssuerOperation.Add,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuers.map(issuer => [rawTicker, issuer])
    );
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
