import { Vec } from '@polkadot/types';
import { IdentityId, Ticker, TrustedIssuer, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyTokenTrustedClaimIssuers,
} from '~/api/procedures/modifyTokenTrustedClaimIssuers';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InputTrustedClaimIssuer, TrustedClaimIssuer } from '~/types';
import { PolymeshTx, TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyTokenTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let trustedClaimIssuerToTrustedIssuerStub: sinon.SinonStub<
    [InputTrustedClaimIssuer, Context],
    TrustedIssuer
  >;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let trustedClaimIssuerStub: sinon.SinonStub;
  let ticker: string;
  let claimIssuerDids: string[];
  let claimIssuers: TrustedClaimIssuer[];
  let rawTicker: Ticker;
  let rawClaimIssuers: TrustedIssuer[];
  let args: Omit<Params, 'operation' | 'claimIssuers'>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    trustedClaimIssuerToTrustedIssuerStub = sinon.stub(
      utilsConversionModule,
      'trustedClaimIssuerToTrustedIssuer'
    );
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    ticker = 'someTicker';
    claimIssuerDids = ['aDid', 'otherDid', 'differentDid'];
    claimIssuers = claimIssuerDids.map(did => ({
      identity: entityMockUtils.getIdentityInstance({ did }),
      trustedFor: null,
    }));
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawClaimIssuers = claimIssuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        trusted_for: dsMockUtils.createMockTrustedFor('Any'),
      })
    );
    args = {
      ticker,
    };
  });

  let addBatchTransactionStub: sinon.SinonStub;

  let removeDefaultTrustedClaimIssuerTransaction: PolymeshTx<[Vec<IdentityId>, Ticker]>;
  let addDefaultTrustedClaimIssuerTransaction: PolymeshTx<[Vec<TrustedIssuer>, Ticker]>;

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
      stringToIdentityIdStub
        .withArgs(utilsConversionModule.signerToString(issuer.identity), mockContext)
        .returns(rawClaimIssuers[index].issuer);
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
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

    expect(error.message).toBe('Some of the supplied Identities do not exist');
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

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        ...currentClaimIssuers.map(({ issuer }) => ({
          transaction: removeDefaultTrustedClaimIssuerTransaction,
          args: [rawTicker, issuer],
        })),
        ...rawClaimIssuers.map(issuer => ({
          transaction: addDefaultTrustedClaimIssuerTransaction,
          args: [rawTicker, issuer],
        })),
      ],
    });
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token (set)', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareModifyTokenTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: claimIssuers.map(({ identity, trustedFor }) => ({
        identity: utilsConversionModule.signerToString(identity),
        trustedFor,
      })),
      operation: TrustedClaimIssuerOperation.Set,
    });

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: rawClaimIssuers.map(issuer => ({
        transaction: addDefaultTrustedClaimIssuerTransaction,
        args: [rawTicker, issuer],
      })),
    });
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
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

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: currentClaimIssuers.map(({ issuer }) => ({
        transaction: removeDefaultTrustedClaimIssuerTransaction,
        args: [rawTicker, issuer],
      })),
    });
    sinon.assert.calledOnce(addBatchTransactionStub);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
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

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: currentClaimIssuers.map(({ issuer }) => ({
        transaction: removeDefaultTrustedClaimIssuerTransaction,
        args: [rawTicker, issuer],
      })),
    });
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
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

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: rawClaimIssuers.map(issuer => ({
        transaction: addDefaultTrustedClaimIssuerTransaction,
        args: [rawTicker, issuer],
      })),
    });
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const token = entityMockUtils.getSecurityTokenInstance({ ticker });

      expect(
        boundFunc({ ticker, operation: TrustedClaimIssuerOperation.Add, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.AddDefaultTrustedClaimIssuer],
          tokens: [token],
          portfolios: [],
        },
      });

      expect(
        boundFunc({ ticker, operation: TrustedClaimIssuerOperation.Remove, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer],
          tokens: [token],
          portfolios: [],
        },
      });

      expect(
        boundFunc({ ticker, operation: TrustedClaimIssuerOperation.Set, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [
            TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer,
            TxTags.complianceManager.AddDefaultTrustedClaimIssuer,
          ],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
