import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { when } from 'jest-when';

import { Account, Context, PolymeshError } from '~/internal';
import { didsWithClaims, heartbeat } from '~/middleware/queries';
import { claimsQuery, heartbeatQuery } from '~/middleware/queriesV2';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockAccountId, getAtMock } from '~/testUtils/mocks/dataSources';
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
    dsMockUtils.createQueryMock('identity', 'didRecords', {
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
      middlewareApiV2: null,
    });

    expect(() => context.middlewareApi).toThrow(
      'Cannot perform this action without an active middleware connection'
    );
  });

  it('should check if the middleware client is equal to the instance passed to the constructor', async () => {
    const middlewareApi = dsMockUtils.getMiddlewareApi();
    const middlewareApiV2 = dsMockUtils.getMiddlewareApiV2();

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi,
      middlewareApiV2,
    });

    expect(context.middlewareApi).toEqual(middlewareApi);
  });

  describe('method: create', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('balances', 'totalIssuance', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(100)),
      });
      dsMockUtils.createQueryMock('system', 'blockHash', {
        returnValue: dsMockUtils.createMockHash('someBlockHash'),
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should create a Context object with a Signing Manager attached', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      expect(() => context.getSigningAddress()).toThrow(
        'There is no signing Account associated with the SDK instance'
      );
    });
  });

  describe('method: getSigningAccounts', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve an array of Accounts', async () => {
      const addresses = [
        '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      ];

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw error if the passed address does not exist in the Signing Manager', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should set the passed value as Signing Manager', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      signingManager.getAccounts.mockResolvedValue([]);

      await context.setSigningManager(signingManager);

      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'There is no signing Account associated with the SDK instance',
      });
      expect(() => context.getSigningAccount()).toThrowError(expectedError);
    });

    it('should set the external api on the polkadot instance', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });
      const signingManager = dsMockUtils.getSigningManagerInstance();
      const polymeshApi = context.getPolymeshApi();
      const polkadotSigner = signingManager.getExternalSigner();

      await context.setSigningManager(signingManager);

      expect(polymeshApi.setSigner).toHaveBeenCalledWith(polkadotSigner);
    });
  });

  describe('method: accountBalance', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    const free = new BigNumber(100);
    const reserved = new BigNumber(40);
    const miscFrozen = new BigNumber(50);
    const feeFrozen = new BigNumber(25);

    it('should throw if there is no signing Account and no Account is passed', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('system', 'account').mockImplementation(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const callback = jest.fn();
      const result = await context.accountBalance('someAddress', callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toHaveBeenCalledWith({
        free: free.minus(miscFrozen).shiftedBy(-6),
        locked: miscFrozen.shiftedBy(-6),
        total: free.plus(reserved).shiftedBy(-6),
      });
    });
  });

  describe('method: accountSubsidy', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should return the current signer Account's Subsidy with allowance if no address is passed", async () => {
      const allowance = dsMockUtils.createMockBalance(new BigNumber(100));
      const returnValue = dsMockUtils.createMockOption(
        dsMockUtils.createMockSubsidy({
          payingKey: dsMockUtils.createMockAccountId('payingKey'),
          remaining: allowance,
        })
      );

      dsMockUtils.createQueryMock('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('relayer', 'subsidies', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createQueryMock('relayer', 'subsidies').mockImplementation(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const callback = jest.fn();
      const result = await context.accountSubsidy('accountId', callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          subsidy: expect.objectContaining({
            beneficiary: expect.objectContaining({ address: 'accountId' }),
            subsidizer: expect.objectContaining({ address: 'payingKey' }),
          }),
          allowance: utilsConversionModule.balanceToBigNumber(allowance),
        })
      );
    });
  });

  describe('method: getSigningIdentity', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the signing Identity', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryMock('identity', 'didRecords', {
        returnValue: dsMockUtils.createMockIdentityDidRecord({
          primaryKey: dsMockUtils.createMockOption(createMockAccountId(did)),
        }),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      return expect(context.getSigningIdentity()).rejects.toThrow(
        'The signing Account does not have an associated Identity'
      );
    });
  });

  describe('method: getSigningAccount', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the signing Account', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      expect(() => context.getSigningAccount()).toThrow(
        'There is no signing Account associated with the SDK instance'
      );
    });
  });

  describe('method: getIdentity', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const result = await context.getIdentity(did);
      expect(result).toEqual(expect.objectContaining({ did }));
    });

    it('should throw if the Identity does not exist', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      expect(context.getPolymeshApi()).toBe(polymeshApi);
    });
  });

  describe('method: getSigningAddress', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the signing address', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: [address, 'somethingElse'],
        }),
      });

      expect(context.getSigningAddress()).toBe(address);
    });
  });

  describe('method: getExternalSigner', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should get and return an external signer from the Signing Manager', async () => {
      const signer = 'signer' as PolkadotSigner;
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getExternalSigner: signer,
        }),
      });

      expect(context.getExternalSigner()).toBe(signer);
    });
  });

  describe('method: getInvalidDids', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return which DIDs in the input array are invalid', async () => {
      const inputDids = ['someDid', 'otherDid', 'invalidDid', 'otherInvalidDid'];
      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createQueryMock('identity', 'didRecords', {
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const invalidDids = await context.getInvalidDids(inputDids);

      expect(invalidDids).toEqual(inputDids.slice(2, 4));
    });
  });

  describe('method: getProtocolFees', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the fees associated to the supplied transaction', async () => {
      dsMockUtils.createQueryMock('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(new BigNumber(1), new BigNumber(2)),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const rawProtocolOp = dsMockUtils.createMockProtocolOp('AssetCreateAsset');
      rawProtocolOp.eq = jest.fn();
      when(rawProtocolOp.eq).calledWith(rawProtocolOp).mockReturnValue(true);

      const txTagToProtocolOpSpy = jest
        .spyOn(utilsConversionModule, 'txTagToProtocolOp')
        .mockClear()
        .mockImplementation();

      when(txTagToProtocolOpSpy)
        .calledWith(TxTags.asset.CreateAsset, context)
        .mockReturnValue(rawProtocolOp);
      when(txTagToProtocolOpSpy)
        .calledWith(TxTags.asset.Freeze, context)
        .mockImplementation(() => {
          throw new Error('err');
        }); // transaction without fees

      dsMockUtils.createQueryMock('protocolFee', 'baseFees', {
        entries: [tuple([rawProtocolOp], dsMockUtils.createMockBalance(new BigNumber(500000000)))],
      });

      const mockResult = [
        {
          tag: TxTags.asset.CreateAsset,
          fees: new BigNumber(250),
        },
        {
          tag: TxTags.asset.Freeze,
          fees: new BigNumber(0),
        },
      ];
      const tags = [TxTags.asset.CreateAsset, TxTags.asset.Freeze];
      let result = await context.getProtocolFees({ tags });

      expect(result).toEqual(mockResult);

      context.isArchiveNode = true;
      result = await context.getProtocolFees({ tags, blockHash: '0x000' });
      expect(getAtMock()).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('method: getTransactionArguments', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a representation of the arguments of a transaction', async () => {
      dsMockUtils.createQueryMock('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(new BigNumber(1), new BigNumber(2)),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.createTxMock('asset', 'registerTicker', {
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

      dsMockUtils.createTxMock('identity', 'addClaim', {
        meta: {
          args: [
            {
              type: 'PolymeshPrimitivesIdentityId',
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
              type: '(PolymeshPrimitivesIdentityId, u32)',
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

      dsMockUtils.createTxMock('identity', 'cddRegisterDid', {
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

      dsMockUtils.createTxMock('asset', 'createAsset', {
        meta: {
          args: [
            {
              type: 'Vec<PolymeshPrimitivesIdentityId>',
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

      dsMockUtils.createTxMock('asset', 'updateIdentifiers', {
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

      dsMockUtils.createTxMock('asset', 'setFundingRound', {
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

      dsMockUtils.createTxMock('asset', 'unfreeze', {
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

      dsMockUtils.createTxMock('asset', 'claimClassicTicker', {
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
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a result set of claims', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.createApolloQueryMock(
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

      dsMockUtils.createApolloQueryMock(
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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

      dsMockUtils.throwOnMiddlewareQuery('No Middleware');

      const entriesMock = jest.fn();
      entriesMock.mockResolvedValue([
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

      dsMockUtils.createQueryMock('identity', 'claims').entries = entriesMock;

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

      jest.spyOn(utilsConversionModule, 'signerToString').mockClear().mockReturnValue(targetDid);

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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.throwOnMiddlewareQuery('No Middleware');

      return expect(context.issuedClaims()).rejects.toThrow(
        'Cannot perform this action without an active middleware connection'
      );
    });
  });

  describe('method: issuedClaimsV2', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a result set of claims', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
      const commonClaimData = {
        targetId: targetDid,
        issuerId: issuerDid,
        issuanceDate: date,
        cddId: cddId,
      };
      const claimsQueryResponse = {
        totalCount: 25,
        nodes: [
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
      };

      dsMockUtils.createApolloV2QueryMock(
        claimsQuery(
          {
            dids: [targetDid],
            trustedClaimIssuers: [targetDid],
            claimTypes: [ClaimTypeEnum.Accredited],
            includeExpired: true,
          },
          new BigNumber(2),
          new BigNumber(0)
        ),
        {
          claims: claimsQueryResponse,
        }
      );

      let result = await context.issuedClaimsV2({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        includeExpired: true,
        size: new BigNumber(2),
        start: new BigNumber(0),
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(new BigNumber(2));

      dsMockUtils.createApolloV2QueryMock(
        claimsQuery(
          {
            dids: undefined,
            trustedClaimIssuers: undefined,
            claimTypes: undefined,
            includeExpired: true,
          },
          new BigNumber(25),
          new BigNumber(0)
        ),
        {
          claims: { nodes: [], totalCount: 0 },
        }
      );

      result = await context.issuedClaimsV2();

      expect(result.data).toEqual([]);
      expect(result.count).toEqual(new BigNumber(0));
      expect(result.next).toBeNull();
    });

    it('should return a result set of claims from chain', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.throwOnMiddlewareV2Query();

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const cddId = 'someCddId';
      const issuedAt = new Date('10/14/2019');
      const expiryOne = new Date('10/14/2020');
      const expiryTwo = new Date('10/14/2060');

      const claim1stKey = dsMockUtils.createMockClaim1stKey({
        target: dsMockUtils.createMockIdentityId(targetDid),
        claimType: dsMockUtils.createMockClaimType(ClaimType.CustomerDueDiligence),
      });

      const identityClaim = {
        claimIssuer: dsMockUtils.createMockIdentityId(issuerDid),
        issuanceDate: dsMockUtils.createMockMoment(new BigNumber(issuedAt.getTime())),
        lastUpdateDate: dsMockUtils.createMockMoment(),
        claim: dsMockUtils.createMockClaim({
          CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
        }),
      };
      /* eslint-enable @typescript-eslint/naming-convention */

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

      const entriesMock = jest.fn();
      entriesMock.mockResolvedValue([
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

      dsMockUtils.createQueryMock('identity', 'claims').entries = entriesMock;

      let result = await context.issuedClaimsV2({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
      });

      expect(result.data).toEqual(fakeClaims);

      const { data } = await context.issuedClaimsV2({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        includeExpired: false,
      });

      expect(data.length).toEqual(2);
      expect(data[0]).toEqual(fakeClaims[1]);
      expect(data[1]).toEqual(fakeClaims[2]);

      jest.spyOn(utilsConversionModule, 'signerToString').mockClear().mockReturnValue(targetDid);

      result = await context.issuedClaimsV2({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);

      result = await context.issuedClaimsV2({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);
    });

    it('should throw if the middleware V2 is not available and targets or claimTypes are not set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.throwOnMiddlewareV2Query();

      return expect(context.issuedClaimsV2()).rejects.toThrow(
        'Cannot perform this action without an active middleware V2 connection'
      );
    });
  });

  describe('method: queryMiddleware', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw if the middleware query fails', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.throwOnMiddlewareQuery({ message: 'Error' });

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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.createApolloQueryMock(fakeQuery, fakeResult);

      const res = await context.queryMiddleware(fakeQuery);

      expect(res.data).toBe(fakeResult);
    });
  });

  describe('method: queryMiddlewareV2', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw if the middleware V2 query fails', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.throwOnMiddlewareV2Query({ message: 'Error' });

      await expect(
        context.queryMiddlewareV2('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware V2 query: Error');

      dsMockUtils.throwOnMiddlewareV2Query({ networkError: {}, message: 'Error' });

      await expect(
        context.queryMiddlewareV2('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware V2 query: Error');

      dsMockUtils.throwOnMiddlewareV2Query({
        networkError: { result: { message: 'Some Message' } },
      });

      return expect(
        context.queryMiddlewareV2('query' as unknown as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware V2 query: Some Message');
    });

    it('should perform a middleware V2 query and return the results', async () => {
      const fakeResult = 'res';
      const fakeQuery = 'fakeQuery' as unknown as GraphqlQuery<unknown>;

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.createApolloV2QueryMock(fakeQuery, fakeResult);

      const res = await context.queryMiddlewareV2(fakeQuery);

      expect(res.data).toBe(fakeResult);
    });
  });

  describe('method: getLatestBlock', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the latest block', async () => {
      const blockNumber = new BigNumber(100);

      const mock = dsMockUtils.createRpcMock('chain', 'subscribeFinalizedHeads');
      mock.mockImplementation(async callback => {
        setImmediate(() =>
          // eslint-disable-next-line node/no-callback-literal
          callback({
            number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber)),
          })
        );
        return (): void => undefined;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const result = await context.getLatestBlock();

      expect(result).toEqual(blockNumber);
    });

    it('should throw any errors encountered while fetching', async () => {
      const mock = dsMockUtils.createRpcMock('chain', 'subscribeFinalizedHeads');
      const err = new Error('Foo');
      mock.mockImplementation(callback => {
        setImmediate(() =>
          // eslint-disable-next-line node/no-callback-literal
          callback({})
        );
        return P.delay(0).throw(err);
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      return expect(context.getLatestBlock()).rejects.toThrow(err);
    });
  });

  describe('method: getNetworkVersion', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the network version', async () => {
      const version = '1.0.0';

      dsMockUtils.createRpcMock('system', 'version', {
        returnValue: dsMockUtils.createMockText(version),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const result = await context.getNetworkVersion();

      expect(result).toEqual(version);
    });
  });

  describe('method: isMiddlewareEnabled', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return true if the middleware is enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: null,
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(true);
    });

    it('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: null,
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(false);
    });
  });

  describe('method: isMiddlewareV2Enabled', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return true if the middleware V2 is enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      const result = context.isMiddlewareV2Enabled();

      expect(result).toBe(true);
    });

    it('should return false if the middleware V2 is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: null,
      });

      const result = context.isMiddlewareV2Enabled();

      expect(result).toBe(false);
    });
  });

  describe('method: isMiddlewareAvailable', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return true if the middleware is available', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.createApolloQueryMock(heartbeat(), true);

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(true);
    });

    it('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: null,
      });

      dsMockUtils.throwOnMiddlewareQuery();

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(false);
    });
  });

  describe('method: isMiddlewareV2Available', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return true if the middleware V2 is available', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.createApolloV2QueryMock(heartbeatQuery(), true);

      const result = await context.isMiddlewareV2Available();

      expect(result).toBe(true);
    });

    it('should return false if the middleware V2 is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: null,
      });

      dsMockUtils.throwOnMiddlewareV2Query();

      const result = await context.isMiddlewareV2Available();

      expect(result).toBe(false);
    });
  });

  describe('method: disconnect', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should disconnect everything and leave the instance unusable', async () => {
      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      const middlewareApiV2 = dsMockUtils.getMiddlewareApiV2();
      let context = await Context.create({
        polymeshApi,
        middlewareApi,
        middlewareApiV2,
      });

      await context.disconnect();
      polymeshApi.emit('disconnected');

      expect(polymeshApi.disconnect).toHaveBeenCalledTimes(1);
      expect(middlewareApi.stop).toHaveBeenCalledTimes(1);
      expect(middlewareApiV2.stop).toHaveBeenCalledTimes(1);

      expect(() => context.getSigningAccounts()).toThrow(
        'Client disconnected. Please create a new instance via "Polymesh.connect()"'
      );

      context = await Context.create({
        polymeshApi,
        middlewareApi: null,
        middlewareApiV2: null,
      });

      await context.disconnect();
      polymeshApi.emit('disconnected');

      expect(polymeshApi.disconnect).toHaveBeenCalledTimes(2);
      expect(middlewareApi.stop).toHaveBeenCalledTimes(1);
      expect(middlewareApiV2.stop).toHaveBeenCalledTimes(1);

      expect(() => context.getSigningAccounts()).toThrow(
        'Client disconnected. Please create a new instance via "Polymesh.connect()"'
      );
    });
  });

  describe('method: getDividendDistributionsForAssets', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all distributions associated to the passed assets', async () => {
      const tickers = ['TICKER_0', 'TICKER_1', 'TICKER_2'];
      const rawTickers = tickers.map(dsMockUtils.createMockTicker);

      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      const middlewareApiV2 = dsMockUtils.getMiddlewareApiV2();

      const context = await Context.create({
        polymeshApi,
        middlewareApi,
        middlewareApiV2,
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
            expiresAt: dsMockUtils.createMockOption(),
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
            expiresAt: dsMockUtils.createMockOption(),
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

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        entries: [
          [[rawTickers[0], localIds[0]], corporateActions[0]],
          [[rawTickers[1], localIds[1]], corporateActions[1]],
          [[rawTickers[1], localIds[2]], corporateActions[2]],
        ],
      });
      const details = [
        dsMockUtils.createMockBytes('details1'),
        dsMockUtils.createMockBytes('details2'),
        dsMockUtils.createMockBytes('details3'),
      ];
      const corporateActionIdentifierToCaIdSpy = jest.spyOn(
        utilsConversionModule,
        'corporateActionIdentifierToCaId'
      );
      when(corporateActionIdentifierToCaIdSpy)
        .calledWith({ ticker: tickers[0], localId: new BigNumber(localIds[0]) }, context)
        .mockReturnValue(caIds[0]);
      when(corporateActionIdentifierToCaIdSpy)
        .calledWith({ ticker: tickers[1], localId: new BigNumber(localIds[1]) }, context)
        .mockReturnValue(caIds[1]);
      when(corporateActionIdentifierToCaIdSpy)
        .calledWith({ ticker: tickers[1], localId: new BigNumber(localIds[2]) }, context)
        .mockReturnValue(caIds[2]);

      const detailsMock = dsMockUtils.createQueryMock('corporateAction', 'details');
      when(detailsMock).calledWith(caIds[0]).mockResolvedValue(details[0]);
      when(detailsMock).calledWith(caIds[1]).mockResolvedValue(details[1]);
      when(detailsMock).calledWith(caIds[2]).mockResolvedValue(details[2]);

      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
        multi: distributions,
      });

      const stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');

      tickers.forEach((ticker, index) =>
        when(stringToTickerSpy).calledWith(ticker, context).mockReturnValue(rawTickers[index])
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
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a cloned instance', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance(),
      });

      const cloned = context.clone();

      expect(cloned).toEqual(context);
    });
  });

  describe('method: supportsSubsidy', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return whether the specified transaction supports subsidies', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
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
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      when(dsMockUtils.getCreateTypeMock()).calledWith('Bytes', 'abc').mockReturnValue('abc');

      const result = context.createType('Bytes', 'abc');
      expect(result).toEqual('abc');
    });

    it('should throw a PolymeshError if createType throws', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
      });

      dsMockUtils.getCreateTypeMock().mockImplementation(() => {
        throw new Error('Could not create Polymesh type');
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message:
          'Could not create internal Polymesh type: "Bytes". Please report this error to the Polymesh team',
      });

      expect(() => context.createType('Bytes', 'abc')).toThrowError(expectedError);
    });
  });

  describe('method: setNonce', () => {
    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should set the passed value as nonce', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: ['someAddress', 'otherAddress'],
        }),
      });

      context.setNonce(new BigNumber(10));

      expect(context.getNonce()).toEqual(new BigNumber(10));
    });
  });

  describe('method: getNonce', () => {
    let context: Context;

    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(async () => {
      context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: dsMockUtils.getMiddlewareApiV2(),
        signingManager: dsMockUtils.getSigningManagerInstance({
          getAccounts: ['someAddress', 'otherAddress'],
        }),
      });
    });

    it('should return -1 if no nonce is set', () => {
      expect(context.getNonce()).toEqual(new BigNumber(-1));
    });

    it('should return the nonce value', async () => {
      context.setNonce(new BigNumber(10));
      expect(context.getNonce()).toEqual(new BigNumber(10));
    });
  });
});
