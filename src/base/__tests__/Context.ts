import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, Context, PolymeshError } from '~/internal';
import { didsWithClaims, heartbeat } from '~/middleware/queries';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { ProtocolOp } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockAccountId } from '~/testUtils/mocks/dataSources';
import {
  ClaimType,
  CorporateActionKind,
  ErrorCode,
  TargetTreatment,
  TransactionArgumentType,
  TxTags,
} from '~/types';
import { GraphqlQuery } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/api/entities/DividendDistribution',
  require('~/testUtils/mocks/entities').mockDividendDistributionModule(
    '~/api/entities/DividendDistribution'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/Subsidy',
  require('~/testUtils/mocks/entities').mockSubsidyModule('~/api/entities/Subsidy')
);

describe('Context class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.setConstMock('system', 'ss58Prefix', {
      returnValue: dsMockUtils.createMockU8(new BigNumber(42)),
    });
    dsMockUtils.createQueryStub('identity', 'didRecords', {
      returnValue: dsMockUtils.createMockIdentityDidRecord({
        primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId('someDid')),
      }),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if accessing the middleware client without an active connection', async () => {
    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi: null,
    });

    expect(() => context.middlewareApi).toThrow(
      'Cannot perform this action without an active middleware connection'
    );
  });

  it('should check if the middleware client is equal to the instance passed to the constructor', async () => {
    const middlewareApi = dsMockUtils.getMiddlewareApi();

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi,
    });

    expect(context.middlewareApi).toEqual(middlewareApi);
  });

  describe('method: create', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('balances', 'totalIssuance', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(100)),
      });
      dsMockUtils.createQueryStub('system', 'blockHash', {
        returnValue: dsMockUtils.createMockHash('someBlockHash'),
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should create a Context object with a Signing Manager attached', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: [address],
        }),
      });

      expect(context.getSigningAddress()).toEqual(address);
    });

    it('should create a Context object without a Signing Manager attached', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getSigningAddress()).toThrow(
        'There is no signing Account associated with the SDK instance'
      );
    });
  });

  describe('method: getSigningAccounts', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should retrieve an array of Accounts', async () => {
      const addresses = [
        '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      ];

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: addresses,
        }),
      });

      const result = await context.getSigningAccounts();
      expect(result[0].address).toBe(addresses[0]);
      expect(result[1].address).toBe(addresses[1]);
      expect(result[0] instanceof Account).toBe(true);
      expect(result[1] instanceof Account).toBe(true);
    });
  });

  describe('method: setSigningAddress', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should throw error if the passed address does not exist in the Signing Manager', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: ['someAddress'],
        }),
      });

      return expect(() => context.setSigningAddress('otherAddress')).rejects.toThrow(
        'The Account is not part of the Signing Manager attached to the SDK'
      );
    });

    it('should set the passed value as signing address', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: ['someAddress', 'otherAddress'],
        }),
      });

      expect(context.getSigningAddress()).toBe('someAddress');

      await context.setSigningAddress('otherAddress');

      expect(context.getSigningAddress()).toBe('otherAddress');
    });
  });

  describe('method: setSigningManager', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should set the passed value as Signing Manager', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (context as any).signingManager).toThrow(
        'There is no Signing Manager attached to the SDK'
      );

      const signingManager = dsMockUtils.getSigningManagerInstance({
        getExternalSigner: 'signer' as PolkadotSigner,
      });
      await context.setSigningManager(signingManager);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((context as any).signingManager).toEqual(signingManager);

      signingManager.getAccounts.returns([]);

      await context.setSigningManager(signingManager);

      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'There is no signing Account associated with the SDK instance',
      });
      expect(() => context.getSigningAccount()).toThrowError(expectedError);
    });
  });

  describe('method: accountBalance', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    const free = new BigNumber(100);
    const reserved = new BigNumber(40);
    const miscFrozen = new BigNumber(50);
    const feeFrozen = new BigNumber(25);

    it('should throw if there is no signing Account and no Account is passed', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      return expect(context.accountBalance()).rejects.toThrow(
        'There is no signing Account associated with the SDK instance'
      );
    });

    it('should return the signer Account POLYX balance if no address is passed', async () => {
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free,
          reserved,
          miscFrozen,
          feeFrozen,
        }),
      });

      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const result = await context.accountBalance();
      expect(result).toEqual({
        free: free.minus(miscFrozen).shiftedBy(-6),
        locked: miscFrozen.shiftedBy(-6),
        total: free.plus(reserved).shiftedBy(-6),
      });
    });

    it('should return the Account POLYX balance if an address is passed', async () => {
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free,
          reserved,
          miscFrozen,
          feeFrozen,
        }),
      });

      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = await context.accountBalance('someAddress');
      expect(result).toEqual({
        free: free.minus(miscFrozen).shiftedBy(-6),
        locked: miscFrozen.shiftedBy(-6),
        total: free.plus(reserved).shiftedBy(-6),
      });
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free,
          reserved,
          miscFrozen,
          feeFrozen,
        }),
      });

      dsMockUtils.createQueryStub('system', 'account').callsFake(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const callback = sinon.stub();
      const result = await context.accountBalance('someAddress', callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, {
        free: free.minus(miscFrozen).shiftedBy(-6),
        locked: miscFrozen.shiftedBy(-6),
        total: free.plus(reserved).shiftedBy(-6),
      });
    });
  });

  describe('method: accountSubsidy', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it("should return the current signer Account's Subsidy with allowance if no address is passed", async () => {
      const allowance = dsMockUtils.createMockBalance(new BigNumber(100));
      const returnValue = dsMockUtils.createMockOption(
        dsMockUtils.createMockSubsidy({
          payingKey: dsMockUtils.createMockAccountId('payingKey'),
          remaining: allowance,
        })
      );

      dsMockUtils.createQueryStub('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: ['beneficiary'],
        }),
      });

      const result = await context.accountSubsidy();
      expect(result).toEqual({
        subsidy: expect.objectContaining({
          beneficiary: expect.objectContaining({ address: 'beneficiary' }),
          subsidizer: expect.objectContaining({ address: 'payingKey' }),
        }),
        allowance: utilsConversionModule.balanceToBigNumber(allowance),
      });
    });

    it('should return the Account Subsidy and allowance if an address is passed', async () => {
      const allowance = dsMockUtils.createMockBalance(new BigNumber(100));
      const returnValue = dsMockUtils.createMockOption(
        dsMockUtils.createMockSubsidy({
          payingKey: dsMockUtils.createMockAccountId('payingKey'),
          remaining: allowance,
        })
      );

      dsMockUtils.createQueryStub('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = await context.accountSubsidy('someAddress');
      expect(result).toEqual({
        subsidy: expect.objectContaining({
          beneficiary: expect.objectContaining({ address: 'someAddress' }),
          subsidizer: expect.objectContaining({ address: 'payingKey' }),
        }),
        allowance: utilsConversionModule.balanceToBigNumber(allowance),
      });
    });

    it('should return null if the Account has no subsidizer', async () => {
      const returnValue = dsMockUtils.createMockOption();

      dsMockUtils.createQueryStub('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const result = await context.accountSubsidy();
      expect(result).toBeNull();
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const allowance = dsMockUtils.createMockBalance(new BigNumber(100));
      const returnValue = dsMockUtils.createMockOption(
        dsMockUtils.createMockSubsidy({
          payingKey: dsMockUtils.createMockAccountId('payingKey'),
          remaining: allowance,
        })
      );

      dsMockUtils.createQueryStub('relayer', 'subsidies').callsFake(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const callback = sinon.stub();
      const result = await context.accountSubsidy('accountId', callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match({
          subsidy: sinon.match({
            beneficiary: sinon.match({ address: 'accountId' }),
            subsidizer: sinon.match({ address: 'payingKey' }),
          }),
          allowance: utilsConversionModule.balanceToBigNumber(allowance),
        })
      );
    });
  });

  describe('method: getSigningIdentity', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the signing Identity', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'didRecords', {
        returnValue: dsMockUtils.createMockIdentityDidRecord({
          primaryKey: dsMockUtils.createMockOption(createMockAccountId(did)),
        }),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const result = await context.getSigningIdentity();
      expect(result.did).toBe(did);
    });

    it('should throw an error if there is no Identity associated to the signing Account', async () => {
      entityMockUtils.configureMocks({
        accountOptions: {
          getIdentity: null,
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      return expect(context.getSigningIdentity()).rejects.toThrow(
        'The signing Account does not have an associated Identity'
      );
    });
  });

  describe('method: getSigningAccount', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the signing Account', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: [address],
        }),
      });

      const result = context.getSigningAccount();
      expect(result).toEqual(expect.objectContaining({ address }));
    });

    it('should throw an error if there is no Account associated with the SDK', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getSigningAccount()).toThrow(
        'There is no signing Account associated with the SDK instance'
      );
    });
  });

  describe('method: getIdentity', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    const did = 'someDid';

    it('should return an Identity if given an Identity', async () => {
      entityMockUtils.configureMocks({
        identityOptions: {
          did,
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const identity = entityMockUtils.getIdentityInstance();
      const result = await context.getIdentity(identity);
      expect(result).toEqual(expect.objectContaining({ did }));
    });

    it('should return an Identity if given a valid DID', async () => {
      entityMockUtils.configureMocks({
        identityOptions: {
          did,
          exists: true,
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = await context.getIdentity(did);
      expect(result).toEqual(expect.objectContaining({ did }));
    });

    it('should throw if the Identity does not exist', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      entityMockUtils.configureMocks({
        identityOptions: {
          did,
          exists: false,
        },
      });

      let error;
      try {
        await context.getIdentity(did);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'The passed DID does not correspond to an on-chain user Identity. It may correspond to an Asset Identity',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('method: getPolymeshApi', () => {
    it('should return the polkadot.js promise client', async () => {
      const polymeshApi = dsMockUtils.getApiInstance();

      const context = await Context.create({
        polymeshApi,
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(context.getPolymeshApi()).toBe(polymeshApi);
    });
  });

  describe('method: getSigningAddress', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the signing address', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: [address, 'somethingElse'],
        }),
      });

      expect(context.getSigningAddress()).toBe(address);
    });
  });

  describe('method: getExternalSigner', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should get and return an external signer from the Signing Manager', async () => {
      const signer = 'signer' as PolkadotSigner;
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getExternalSigner: signer,
        }),
      });

      expect(context.getExternalSigner()).toBe(signer);
    });
  });

  describe('method: getInvalidDids', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return which DIDs in the input array are invalid', async () => {
      const inputDids = ['someDid', 'otherDid', 'invalidDid', 'otherInvalidDid'];
      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createQueryStub('identity', 'didRecords', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockIdentityDidRecord({
              primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId('someId')),
            })
          ),
          dsMockUtils.createMockOption(
            dsMockUtils.createMockIdentityDidRecord({
              primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId('otherId')),
            })
          ),
          dsMockUtils.createMockOption(),
          dsMockUtils.createMockOption(),
        ],
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const invalidDids = await context.getInvalidDids(inputDids);

      expect(invalidDids).toEqual(inputDids.slice(2, 4));
    });
  });

  describe('method: getProtocolFees', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the fees associated to the supplied transaction', async () => {
      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(new BigNumber(1), new BigNumber(2)),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const txTagToProtocolOpStub = sinon.stub(utilsConversionModule, 'txTagToProtocolOp');

      txTagToProtocolOpStub
        .withArgs(TxTags.asset.CreateAsset, context)
        .returns('someProtocolOp' as unknown as ProtocolOp);
      txTagToProtocolOpStub.withArgs(TxTags.asset.Freeze, context).throws(); // transaction without fees

      dsMockUtils.createQueryStub('protocolFee', 'baseFees', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(500000000)),
      });

      let result = await context.getProtocolFees({ tag: TxTags.asset.CreateAsset });

      expect(result).toEqual(new BigNumber(250));

      result = await context.getProtocolFees({ tag: TxTags.asset.Freeze });

      expect(result).toEqual(new BigNumber(0));
    });
  });

  describe('method: getTransactionArguments', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return a representation of the arguments of a transaction', async () => {
      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(new BigNumber(1), new BigNumber(2)),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.createTxStub('asset', 'registerTicker', {
        meta: {
          args: [
            {
              type: 'Ticker',
              name: 'ticker',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.RegisterTicker })).toMatchObject([
        {
          name: 'ticker',
          type: TransactionArgumentType.Text,
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('identity', 'addClaim', {
        meta: {
          args: [
            {
              type: 'IdentityId',
              name: 'target',
            },
            {
              type: 'PortfolioKind',
              name: 'portfolioKind',
            },
            {
              type: 'Option<Moment>',
              name: 'expiry',
            },
            {
              type: '(IdentityId, u32)',
              name: 'identityPair',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.identity.AddClaim })).toMatchObject([
        {
          name: 'target',
          type: TransactionArgumentType.Did,
          optional: false,
        },
        {
          name: 'portfolioKind',
          type: TransactionArgumentType.RichEnum,
          optional: false,
          internal: [
            {
              name: 'Default',
              type: TransactionArgumentType.Null,
              optional: false,
            },
            {
              name: 'User',
              type: TransactionArgumentType.Number,
              optional: false,
            },
          ],
        },
        {
          name: 'expiry',
          type: TransactionArgumentType.Date,
          optional: true,
        },
        {
          name: 'identityPair',
          type: TransactionArgumentType.Tuple,
          optional: false,
          internal: [
            {
              name: '0',
              optional: false,
              type: TransactionArgumentType.Did,
            },
            {
              name: '1',
              optional: false,
              type: TransactionArgumentType.Number,
            },
          ],
        },
      ]);

      dsMockUtils.createTxStub('identity', 'cddRegisterDid', {
        meta: {
          args: [
            {
              type: 'Compact<Bytes>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.identity.CddRegisterDid })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Unknown,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'createAsset', {
        meta: {
          args: [
            {
              type: 'Vec<IdentityId>',
              name: 'dids',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.CreateAsset })).toMatchObject([
        {
          type: TransactionArgumentType.Array,
          name: 'dids',
          optional: false,
          internal: {
            name: '',
            type: TransactionArgumentType.Did,
            optional: false,
          },
        },
      ]);

      dsMockUtils.createTxStub('asset', 'updateIdentifiers', {
        meta: {
          args: [
            {
              type: '[u8;32]',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.asset.UpdateIdentifiers })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Text,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'setFundingRound', {
        meta: {
          args: [
            {
              type: 'AssetOwnershipRelation',
              name: 'relation',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.SetFundingRound })).toMatchObject([
        {
          type: TransactionArgumentType.SimpleEnum,
          name: 'relation',
          optional: false,
          internal: ['NotOwned', 'TickerOwned', 'AssetOwned'],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'unfreeze', {
        meta: {
          args: [
            {
              type: 'VoteCountProposalFound',
              name: 'voteCountProposalFound',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.Unfreeze })).toMatchObject([
        {
          type: TransactionArgumentType.Object,
          name: 'voteCountProposalFound',
          optional: false,
          internal: [
            {
              name: 'ayes',
              type: TransactionArgumentType.Number,
            },
            {
              name: 'nays',
              type: TransactionArgumentType.Number,
            },
          ],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'claimClassicTicker', {
        meta: {
          args: [
            {
              type: 'UInt<8>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.asset.ClaimClassicTicker })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Unknown,
          name: 'someArg',
          optional: false,
        },
      ]);
    });
  });

  describe('method: issuedClaims', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return a result set of claims', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const cddId = 'someCddId';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const claim = {
        target: expect.objectContaining({ did: targetDid }),
        issuer: expect.objectContaining({ did: issuerDid }),
        issuedAt: new Date(date),
      };
      const fakeClaims = [
        {
          ...claim,
          expiry: new Date(date),
          claim: {
            type: customerDueDiligenceType,
            id: cddId,
          },
        },
        {
          ...claim,
          expiry: null,
          claim: {
            type: customerDueDiligenceType,
            id: cddId,
          },
        },
      ];
      /* eslint-disable @typescript-eslint/naming-convention */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
        cdd_id: cddId,
      };
      /* eslint-enable @typescript-eslint/naming-convention */
      const didsWithClaimsQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did: targetDid,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: customerDueDiligenceType,
              },
              {
                ...commonClaimData,
                expiry: null,
                type: customerDueDiligenceType,
              },
            ],
          },
        ],
      };

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: true,
          count: 1,
          skip: 0,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      let result = await context.issuedClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        includeExpired: true,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(new BigNumber(1));

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: undefined,
          trustedClaimIssuers: undefined,
          claimTypes: undefined,
          includeExpired: true,
          count: undefined,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      result = await context.issuedClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toBeNull();
    });

    it('should return a result set of claims from chain', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const cddId = 'someCddId';
      const issuedAt = new Date('10/14/2019');
      const expiryOne = new Date('10/14/2020');
      const expiryTwo = new Date('10/14/2060');

      /* eslint-disable @typescript-eslint/naming-convention */
      const claim1stKey = dsMockUtils.createMockClaim1stKey({
        target: dsMockUtils.createMockIdentityId(targetDid),
        claimType: dsMockUtils.createMockClaimType(ClaimType.CustomerDueDiligence),
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      const identityClaim = {
        claimIssuer: dsMockUtils.createMockIdentityId(issuerDid),
        issuanceDate: dsMockUtils.createMockMoment(new BigNumber(issuedAt.getTime())),
        lastUpdateDate: dsMockUtils.createMockMoment(),
        claim: dsMockUtils.createMockClaim({
          CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
        }),
      };

      const fakeClaims = [
        {
          target: expect.objectContaining({ did: targetDid }),
          issuer: expect.objectContaining({ did: issuerDid }),
          issuedAt,
          expiry: expiryOne,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
        {
          target: expect.objectContaining({ did: targetDid }),
          issuer: expect.objectContaining({ did: issuerDid }),
          issuedAt,
          expiry: null,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
        {
          target: expect.objectContaining({ did: targetDid }),
          issuer: expect.objectContaining({ did: issuerDid }),
          issuedAt,
          expiry: expiryTwo,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          middlewareAvailable: false,
        },
      });

      const entriesStub = sinon.stub();
      entriesStub.resolves([
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(
              dsMockUtils.createMockMoment(new BigNumber(expiryOne.getTime()))
            ),
          }
        ),
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(),
          }
        ),
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(
              dsMockUtils.createMockMoment(new BigNumber(expiryTwo.getTime()))
            ),
          }
        ),
      ]);

      dsMockUtils.createQueryStub('identity', 'claims').entries = entriesStub;

      let result = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
      });

      expect(result.data).toEqual(fakeClaims);

      const { data } = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        includeExpired: false,
      });

      expect(data.length).toEqual(2);
      expect(data[0]).toEqual(fakeClaims[1]);
      expect(data[1]).toEqual(fakeClaims[2]);

      sinon.stub(utilsConversionModule, 'signerToString').returns(targetDid);

      result = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);

      result = await context.issuedClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);
    });

    it('should throw if the middleware is not available and targets or claimTypes are not set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.configureMocks({
        contextOptions: {
          middlewareAvailable: false,
        },
      });

      return expect(context.issuedClaims()).rejects.toThrow(
        'Cannot perform this action without an active middleware connection'
      );
    });
  });

  describe('method: queryMiddleware', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should throw if the middleware query fails', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.throwOnMiddlewareQuery();

      await expect(
        context.queryMiddleware('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Error');

      dsMockUtils.throwOnMiddlewareQuery({ networkError: {}, message: 'Error' });

      await expect(
        context.queryMiddleware('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Error');

      dsMockUtils.throwOnMiddlewareQuery({ networkError: { result: { message: 'Some Message' } } });

      return expect(
        context.queryMiddleware('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Some Message');
    });

    it('should perform a middleware query and return the results', async () => {
      const fakeResult = 'res';
      const fakeQuery = 'fakeQuery' as unknown as GraphqlQuery<unknown>;

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.createApolloQueryStub(fakeQuery, fakeResult);

      const res = await context.queryMiddleware(fakeQuery);

      expect(res.data).toBe(fakeResult);
    });
  });

  describe('method: getLatestBlock', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the latest block', async () => {
      const blockNumber = new BigNumber(100);

      dsMockUtils.createRpcStub('chain', 'getHeader', {
        returnValue: {
          number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber)),
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = await context.getLatestBlock();

      expect(result).toEqual(blockNumber);
    });
  });

  describe('method: getNetworkVersion', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the network version', async () => {
      const version = '1.0.0';

      dsMockUtils.createRpcStub('system', 'version', {
        returnValue: dsMockUtils.createMockText(version),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = await context.getNetworkVersion();

      expect(result).toEqual(version);
    });
  });

  describe('method: isMiddlewareEnabled', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return true if the middleware is enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(true);
    });

    it('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(false);
    });
  });

  describe('method: isMiddlewareAvailable', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return true if the middleware is available', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(true);
    });

    it('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
      });

      dsMockUtils.throwOnMiddlewareQuery();

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(false);
    });
  });

  describe('method: disconnect', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should disconnect everything and leave the instance unusable', async () => {
      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      let context = await Context.create({
        polymeshApi,
        middlewareApi,
      });

      await context.disconnect();
      polymeshApi.emit('disconnected');

      sinon.assert.calledOnce(polymeshApi.disconnect);
      sinon.assert.calledOnce(middlewareApi.stop);

      expect(() => context.getSigningAccounts()).toThrow(
        'Client disconnected. Please create a new instance via "Polymesh.connect()"'
      );

      context = await Context.create({
        polymeshApi,
        middlewareApi: null,
      });

      await context.disconnect();
      polymeshApi.emit('disconnected');

      sinon.assert.calledTwice(polymeshApi.disconnect);
      sinon.assert.calledOnce(middlewareApi.stop);

      expect(() => context.getSigningAccounts()).toThrow(
        'Client disconnected. Please create a new instance via "Polymesh.connect()"'
      );
    });
  });

  describe('method: getDividendDistributionsForAssets', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return all distributions associated to the passed assets', async () => {
      const tickers = ['TICKER_0', 'TICKER_1', 'TICKER_2'];
      const rawTickers = tickers.map(dsMockUtils.createMockTicker);

      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      const context = await Context.create({
        polymeshApi,
        middlewareApi,
      });

      /* eslint-disable @typescript-eslint/naming-convention */
      const corporateActions = [
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.PredictableBenefit,
            decl_date: new BigNumber(new Date('10/14/1987').getTime()),
            record_date: dsMockUtils.createMockRecordDate({
              date: new BigNumber(new Date('10/14/2019').getTime()),
              checkpoint: { Existing: dsMockUtils.createMockU64(new BigNumber(2)) },
            }),
            targets: {
              identities: ['someDid'],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: new BigNumber(100000),
            withholding_tax: [tuple('someDid', new BigNumber(300000))],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.Reorganization,
            decl_date: new BigNumber(new Date('10/14/1987').getTime()),
            record_date: null,
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: new BigNumber(0),
            withholding_tax: [],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.UnpredictableBenefit,
            decl_date: new BigNumber(new Date('11/26/1989').getTime()),
            record_date: dsMockUtils.createMockRecordDate({
              date: new BigNumber(new Date('11/26/2019').getTime()),
              checkpoint: { Existing: dsMockUtils.createMockU64(new BigNumber(5)) },
            }),
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: new BigNumber(150000),
            withholding_tax: [tuple('someDid', new BigNumber(200000))],
          })
        ),
      ];
      /* eslint-enable @typescript-eslint/naming-convention */

      const distributions = [
        dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { kind: 'Default', did: 'someDid' },
            currency: 'USD',
            perShare: new BigNumber(10000000),
            amount: new BigNumber(500000000000),
            remaining: new BigNumber(400000000000),
            reclaimed: false,
            paymentAt: new BigNumber(new Date('10/14/1987').getTime()),
            expiresAt: null,
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { kind: { User: dsMockUtils.createMockU64(new BigNumber(2)) }, did: 'someDid' },
            currency: 'CAD',
            perShare: new BigNumber(20000000),
            amount: new BigNumber(300000000000),
            remaining: new BigNumber(200000000000),
            reclaimed: false,
            paymentAt: new BigNumber(new Date('11/26/1989').getTime()),
            expiresAt: null,
          })
        ),
        dsMockUtils.createMockOption(),
      ];

      const localIds = [new BigNumber(1), new BigNumber(2), new BigNumber(3)];
      const caIds = [
        dsMockUtils.createMockCAId({ ticker: rawTickers[0], localId: localIds[0] }),
        dsMockUtils.createMockCAId({ ticker: rawTickers[1], localId: localIds[1] }),
        dsMockUtils.createMockCAId({ ticker: rawTickers[1], localId: localIds[2] }),
      ];

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        entries: [
          [[rawTickers[0], localIds[0]], corporateActions[0]],
          [[rawTickers[1], localIds[1]], corporateActions[1]],
          [[rawTickers[1], localIds[2]], corporateActions[2]],
        ],
      });
      const details = [
        dsMockUtils.createMockText('details1'),
        dsMockUtils.createMockText('details2'),
        dsMockUtils.createMockText('details3'),
      ];
      const corporateActionIdentifierToCaIdStub = sinon.stub(
        utilsConversionModule,
        'corporateActionIdentifierToCaId'
      );
      corporateActionIdentifierToCaIdStub
        .withArgs({ ticker: tickers[0], localId: new BigNumber(localIds[0]) }, context)
        .returns(caIds[0]);
      corporateActionIdentifierToCaIdStub
        .withArgs({ ticker: tickers[1], localId: new BigNumber(localIds[1]) }, context)
        .returns(caIds[1]);
      corporateActionIdentifierToCaIdStub
        .withArgs({ ticker: tickers[1], localId: new BigNumber(localIds[2]) }, context)
        .returns(caIds[2]);

      const detailsStub = dsMockUtils.createQueryStub('corporateAction', 'details');
      detailsStub.withArgs(caIds[0]).resolves(details[0]);
      detailsStub.withArgs(caIds[1]).resolves(details[1]);
      detailsStub.withArgs(caIds[2]).resolves(details[2]);

      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        multi: distributions,
      });

      const stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');

      tickers.forEach((ticker, index) =>
        stringToTickerStub.withArgs(ticker, context).returns(rawTickers[index])
      );

      const result = await context.getDividendDistributionsForAssets({
        assets: tickers.map(ticker => entityMockUtils.getAssetInstance({ ticker })),
      });

      expect(result.length).toBe(2);
      expect(result[0].details.fundsReclaimed).toBe(false);
      expect(result[0].details.remainingFunds).toEqual(new BigNumber(400000));
      expect(result[0].distribution.origin).toEqual(
        expect.objectContaining({ owner: expect.objectContaining({ did: 'someDid' }) })
      );
      expect(result[0].distribution.currency).toBe('USD');
      expect(result[0].distribution.perShare).toEqual(new BigNumber(10));
      expect(result[0].distribution.maxAmount).toEqual(new BigNumber(500000));
      expect(result[0].distribution.expiryDate).toBe(null);
      expect(result[0].distribution.paymentDate).toEqual(new Date('10/14/1987'));

      expect(result[1].details.fundsReclaimed).toBe(false);
      expect(result[1].details.remainingFunds).toEqual(new BigNumber(200000));
      expect(result[1].distribution.origin).toEqual(
        expect.objectContaining({
          owner: expect.objectContaining({ did: 'someDid' }),
          id: new BigNumber(2),
        })
      );
      expect(result[1].distribution.currency).toBe('CAD');
      expect(result[1].distribution.perShare).toEqual(new BigNumber(20));
      expect(result[1].distribution.maxAmount).toEqual(new BigNumber(300000));
      expect(result[1].distribution.expiryDate).toBe(null);
      expect(result[1].distribution.paymentDate).toEqual(new Date('11/26/1989'));
    });
  });

  describe('method: clone', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return a cloned instance', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const cloned = context.clone();

      expect(cloned).toEqual(context);
    });
  });

  describe('method: supportsSubsidy', () => {
    beforeAll(() => {
      sinon.stub(utilsInternalModule, 'assertAddressValid');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return whether the specified transaction supports subsidies', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(context.supportsSubsidy({ tag: TxTags.system.FillBlock })).toBe(false);
      expect(context.supportsSubsidy({ tag: TxTags.asset.CreateAsset })).toBe(true);
    });
  });

  describe('method: createType', () => {
    it('should call polymeshApi and return the result', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.getCreateTypeStub().withArgs('Bytes', 'abc').returns('abc');

      const result = context.createType('Bytes', 'abc');
      expect(result).toEqual('abc');
    });

    it('should throw a PolymeshError if createType throws', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.getCreateTypeStub().throws('Could not create Polymesh type');

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message:
          'Could not create internal Polymesh type: "Bytes". Please report this error to the Polymath team',
      });

      expect(() => context.createType('Bytes', 'abc')).toThrowError(expectedError);
    });
  });
});
