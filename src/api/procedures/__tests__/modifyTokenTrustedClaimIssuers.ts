import { Vec } from '@polkadot/types';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getRequiredRoles,
  Params,
  prepareModifyTokenTrustedClaimIssuers,
} from '~/api/procedures/modifyTokenTrustedClaimIssuers';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import { PolymeshTx, TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('setTokenTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let trustedClaimIssuerStub: sinon.SinonStub;
  let ticker: string;
  let claimIssuerIdentities: string[];
  let rawTicker: Ticker;
  let rawClaimIssuerDids: IdentityId[];
  let args: Omit<Params, 'operation'>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    ticker = 'someTicker';
    claimIssuerIdentities = ['aDid', 'otherDid', 'differentDid'];
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawClaimIssuerDids = claimIssuerIdentities.map(dsMockUtils.createMockIdentityId);
    /* eslint-enable @typescript-eslint/camelcase */
    args = {
      ticker,
      claimIssuerIdentities,
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
    claimIssuerIdentities.forEach((did, index) => {
      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawClaimIssuerDids[index]);
      identityIdToStringStub.withArgs(rawClaimIssuerDids[index]).returns(did);
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
    trustedClaimIssuerStub.withArgs(rawTicker).returns(rawClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        operation: TrustedClaimIssuerOperation.Set,
      })
    ).rejects.toThrow('The supplied claim issuer list is equal to the current one');
  });

  test("should throw an error if some of the supplied dids don't exist", async () => {
    const nonExistentDid = claimIssuerIdentities[1];
    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [nonExistentDid] } });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        operation: TrustedClaimIssuerOperation.Set,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the supplied Identity IDs do not exist');
    expect(error.data).toMatchObject({ nonExistentDids: [nonExistentDid] });
  });

  test('should add a transaction to remove the current claim issuers and another one to add the ones in the input (set)', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuerDids.map(did => [did, rawTicker])
    );
    sinon.assert.calledWith(
      addBatchTransactionStub.secondCall,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuerDids.map(did => [did, rawTicker])
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token (set)', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuerDids.map(did => [did, rawTicker])
    );
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add an add claim issuers transaction if there are no claim issuers passed as arguments (set)', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids.slice(0, -1);
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      operation: TrustedClaimIssuerOperation.Set,
      claimIssuerIdentities: [],
    });

    sinon.assert.calledWith(
      addBatchTransactionStub.firstCall,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuerDids.map(did => [did, rawTicker])
    );
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should throw an error if trying to remove an Identity that is not a trusted claim issuer', async () => {
    const currentClaimIssuerDids: IdentityId[] = [];
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        operation: TrustedClaimIssuerOperation.Remove,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities are not Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ notPresent: args.claimIssuerIdentities });
  });

  test('should add a transaction to remove the supplied Trusted Claim Issuers (remove)', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids;
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      operation: TrustedClaimIssuerOperation.Remove,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      removeDefaultTrustedClaimIssuerTransaction,
      {},
      currentClaimIssuerDids.map(did => [did, rawTicker])
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should throw an error if trying to add an Identity that is already a Trusted Claim Issuer', async () => {
    const currentClaimIssuerDids = rawClaimIssuerDids;
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareModifyTokenTrustedClaimIssuers.call(proc, {
        ...args,
        operation: TrustedClaimIssuerOperation.Add,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities already are Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ present: args.claimIssuerIdentities });
  });

  test('should add a transaction to add the supplied Trusted Claim Issuers (add)', async () => {
    const currentClaimIssuerDids: IdentityId[] = [];
    trustedClaimIssuerStub.withArgs(rawTicker).returns(currentClaimIssuerDids);
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      operation: TrustedClaimIssuerOperation.Add,
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      addDefaultTrustedClaimIssuerTransaction,
      {},
      rawClaimIssuerDids.map(did => [did, rawTicker])
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
