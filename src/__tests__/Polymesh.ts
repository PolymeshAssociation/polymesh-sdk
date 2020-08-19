import { Keyring } from '@polkadot/api';
import { Signer as PolkadotSigner } from '@polkadot/api/types';
import { ApolloLink, GraphQLRequest } from 'apollo-link';
import * as apolloLinkContextModule from 'apollo-link-context';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity, TickerReservation } from '~/api/entities';
import { modifyClaims, removeSigningKeys, reserveTicker, transferPolyX } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { didsWithClaims, transactions } from '~/middleware/queries';
import {
  CallIdEnum,
  ClaimTypeEnum,
  ExtrinsicResult,
  IdentityWithClaimsResult,
  ModuleIdEnum,
} from '~/middleware/types';
import { Polymesh } from '~/Polymesh';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  AccountBalance,
  ClaimData,
  ClaimTarget,
  ClaimType,
  ResultSet,
  Signer,
  SignerType,
  SubCallback,
  TickerReservationStatus,
} from '~/types';
import { ClaimOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock('~/context', require('~/testUtils/mocks/dataSources').mockContextModule('~/context'));
jest.mock(
  'apollo-client',
  require('~/testUtils/mocks/dataSources').mockApolloModule('apollo-client')
);
jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Polymesh Class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  describe('method: create', () => {
    beforeAll(() => {
      sinon.stub(apolloLinkContextModule, 'setContext').callsFake(cbFunc => {
        return new ApolloLink(cbFunc({} as GraphQLRequest, {}));
      });
    });

    test('should instantiate Context and return a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(polymesh instanceof Polymesh).toBe(true);
    });

    test('should instantiate Context with a seed and return a Polymesh instance', async () => {
      const accountSeed = 'Alice'.padEnd(32, ' ');
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        seed: accountSeed,
      });
    });

    test('should instantiate Context with a keyring and return a Polymesh instance', async () => {
      const keyring = {} as Keyring;
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        keyring,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        keyring,
      });
    });

    test('should instantiate Context with a ui keyring and return a Polymesh instance', async () => {
      const keyring = {} as Keyring;
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        keyring: { keyring },
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        keyring,
      });
    });

    test('should instantiate Context with a uri and return a Polymesh instance', async () => {
      const accountUri = '//uri';
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        uri: accountUri,
      });
    });

    test('should instantiate Context with middleware credentials and return a Polymesh instance', async () => {
      const accountUri = '//uri';
      const createStub = dsMockUtils.getContextCreateStub();
      const middleware = {
        link: 'someLink',
        key: 'someKey',
      };

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri,
        middleware,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        uri: accountUri,
      });
    });

    test('should set an optional signer for the polkadot API', async () => {
      const accountSeed = 'Alice'.padEnd(32, ' ');
      const createStub = dsMockUtils.getContextCreateStub();
      const signer = 'signer' as PolkadotSigner;

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed,
        signer,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        seed: accountSeed,
      });
      sinon.assert.calledWith(dsMockUtils.getApiInstance().setSigner, signer);
    });

    test('should throw if Context fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });

    test('should throw if Polkadot fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation(new Error());

      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "The node couldn’t be reached"`
      );
    });

    test('should throw if Context create method fails', () => {
      dsMockUtils.throwOnContextCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });
  });

  describe('method: getIdentityBalance', () => {
    test("should return the identity's POLYX balance", async () => {
      const fakeBalance = new BigNumber(20);
      dsMockUtils.configureMocks({
        contextOptions: {
          withSeed: true,
          balance: { free: fakeBalance, locked: new BigNumber(0) },
        },
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed: 'seed',
      });

      let result = await polymesh.getIdentityBalance();
      expect(result).toEqual(fakeBalance);

      entityMockUtils.configureMocks({ identityOptions: { getPolyXBalance: fakeBalance } });

      result = await polymesh.getIdentityBalance({ did: 'someDid' });
      expect(result).toEqual(fakeBalance);
    });
  });

  describe('method: getAccountBalance', () => {
    test('should return the free and locked POLYX balance of the current account', async () => {
      const fakeBalance = {
        free: new BigNumber(100),
        locked: new BigNumber(0),
      };
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getAccountBalance();
      expect(result).toEqual(fakeBalance);
    });

    test('should return the free and locked POLYX balance of the supplied account', async () => {
      const fakeBalance = {
        free: new BigNumber(100),
        locked: new BigNumber(0),
      };
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getAccountBalance({ accountId: 'someId' });
      expect(result).toEqual(fakeBalance);
    });

    test('should allow subscription (with and without a supplied account id)', async () => {
      const fakeBalance = {
        free: new BigNumber(100),
        locked: new BigNumber(0),
      };
      const unsubCallback = 'unsubCallback';
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });

      const accountBalanceStub = dsMockUtils
        .getContextInstance()
        .accountBalance.resolves(unsubCallback);

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = (() => 1 as unknown) as SubCallback<AccountBalance>;
      let result = await polymesh.getAccountBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, undefined, callback);

      const accountId = 'someId';
      result = await polymesh.getAccountBalance({ accountId }, callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, accountId, callback);
    });
  });

  describe('method: reserveTicker', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const args = {
        ticker: 'SOMETICKER',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<TickerReservation>;

      sinon
        .stub(reserveTicker, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await polymesh.reserveTicker(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: isTickerAvailable', () => {
    beforeAll(() => {
      entityMockUtils.initMocks();
    });

    afterEach(() => {
      entityMockUtils.reset();
    });

    afterAll(() => {
      entityMockUtils.cleanup();
    });

    test('should return true if ticker is available to reserve it', async () => {
      entityMockUtils.getTickerReservationDetailsStub().resolves({
        owner: entityMockUtils.getIdentityInstance(),
        expiryDate: new Date(),
        status: TickerReservationStatus.Free,
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const isTickerAvailable = await polymesh.isTickerAvailable({ ticker: 'someTicker' });

      expect(isTickerAvailable).toBeTruthy();
    });

    test('should return false if ticker is not available to reserve it', async () => {
      entityMockUtils.getTickerReservationDetailsStub().resolves({
        owner: entityMockUtils.getIdentityInstance(),
        expiryDate: new Date(),
        status: TickerReservationStatus.Reserved,
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const isTickerAvailable = await polymesh.isTickerAvailable({ ticker: 'someTicker' });

      expect(isTickerAvailable).toBeFalsy();
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      entityMockUtils.getTickerReservationDetailsStub().callsFake(async cbFunc => {
        cbFunc({
          owner: entityMockUtils.getIdentityInstance(),
          expiryDate: new Date(),
          status: TickerReservationStatus.Free,
        });

        return unsubCallback;
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const callback = sinon.stub();
      const result = await polymesh.isTickerAvailable({ ticker: 'someTicker' }, callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, true);
    });
  });

  describe('method: getTickerReservations', () => {
    beforeAll(() => {
      sinon.stub(utilsModule, 'signerToSignatory');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return a list of ticker reservations if did parameter is set', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservations = await polymesh.getTickerReservations({ did });

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of ticker reservations owned by the identity', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservations = await polymesh.getTickerReservations();

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });
  });

  describe('method: getTickerReservation', () => {
    test('should return a specific ticker reservation owned by the identity', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId('someDid'),
          expiry: dsMockUtils.createMockOption(),
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservation = await polymesh.getTickerReservation({ ticker });
      expect(tickerReservation.ticker).toBe(ticker);
    });

    test('should throw if ticker reservation does not exist', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(),
          expiry: dsMockUtils.createMockOption(),
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      return expect(polymesh.getTickerReservation({ ticker })).rejects.toThrow(
        `There is no reservation for ${ticker} ticker`
      );
    });
  });

  describe('method: getIdentity', () => {
    test('should return the current identity if no parameters are passed', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const context = dsMockUtils.getContextInstance();

      expect(polymesh.getIdentity()).toEqual(context.getCurrentIdentity());
    });

    test('should return an identity object with the passed did', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const params = { did: 'testDid' };

      const result = polymesh.getIdentity(params);
      const context = dsMockUtils.getContextInstance();

      expect(result).toMatchObject(new Identity(params, context));
    });
  });

  describe('method: isIdentityValid', () => {
    test('should return true if the supplied identity exists', async () => {
      const did = 'someDid';
      dsMockUtils.configureMocks({ contextOptions: { invalidDids: [] } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = await polymesh.isIdentityValid({ identity: did });

      expect(result).toBe(true);
    });

    test('should return false if the supplied identity is invalid', async () => {
      const did = 'someDid';
      dsMockUtils.configureMocks({ contextOptions: { invalidDids: [did] } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = await polymesh.isIdentityValid({ identity: did });

      expect(result).toBe(false);
    });
  });

  describe('method: getTransactionFees', () => {
    test('should return the fees associated to the supplied transaction', async () => {
      dsMockUtils.configureMocks({ contextOptions: { transactionFee: new BigNumber(500) } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const fee = await polymesh.getTransactionFees({ tag: TxTags.asset.CreateAsset });

      expect(fee).toEqual(new BigNumber(500));
    });
  });

  describe('method: getTreasuryAddress', () => {
    test('should return the Treasury module address', async () => {
      const treasuryAddress = '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR';
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      expect(polymesh.getTreasuryAddress()).toEqual(treasuryAddress);
    });
  });

  describe('method: getSecurityTokens', () => {
    beforeAll(() => {
      sinon.stub(utilsModule, 'signerToSignatory');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return a list of security tokens owned by the supplied did', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const securityTokens = await polymesh.getSecurityTokens({ did: 'someDid' });

      expect(securityTokens).toHaveLength(1);
      expect(securityTokens[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of security tokens owned by the current identity if no did is supplied', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const securityTokens = await polymesh.getSecurityTokens();

      expect(securityTokens).toHaveLength(1);
      expect(securityTokens[0].ticker).toBe(fakeTicker);
    });
  });

  describe('method: getIssuedClaims', () => {
    test('should return a list of issued claims', async () => {
      const context = dsMockUtils.getContextInstance();
      const issuedClaims: ResultSet<ClaimData> = {
        data: [
          {
            target: new Identity({ did: 'someDid' }, context),
            issuer: new Identity({ did: 'otherDid' }, context),
            issuedAt: new Date(),
            expiry: null,
            claim: { type: ClaimType.NoData },
          },
        ],
        next: 1,
        count: 1,
      };

      dsMockUtils.configureMocks({
        contextOptions: {
          issuedClaims,
        },
      });
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = await polymesh.getIssuedClaims();
      expect(result).toEqual(issuedClaims);
    });
  });

  describe('method: getIdentitiesWithClaims', () => {
    test('should return a list of identities with claims associated to them', async () => {
      const context = dsMockUtils.getContextInstance();
      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const claim = {
        target: new Identity({ did: targetDid }, context),
        issuer: new Identity({ did: issuerDid }, context),
        issuedAt: new Date(date),
      };

      const fakeClaims = [
        {
          identity: new Identity({ did: targetDid }, context),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: {
                type: customerDueDiligenceType,
              },
            },
            {
              ...claim,
              expiry: null,
              claim: {
                type: customerDueDiligenceType,
              },
            },
          ],
        },
      ];
      /* eslint-disable @typescript-eslint/camelcase */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
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
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          scope: undefined,
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          count: 1,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      let result = await polymesh.getIdentitiesWithClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        size: 1,
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(1);

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: undefined,
          scope: undefined,
          trustedClaimIssuers: undefined,
          claimTypes: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      result = await polymesh.getIdentitiesWithClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(null);
    });
  });

  describe('method: transferPolyX', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const args = {
        to: 'someAccount',
        amount: new BigNumber(50),
      };

      const expectedQueue = ('' as unknown) as TransactionQueue<void>;

      sinon
        .stub(transferPolyX, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await polymesh.transferPolyX(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getSecurityToken', () => {
    test('should return a specific security token', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: dsMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: dsMockUtils.createMockIdentityId('someDid'),
          name: dsMockUtils.createMockAssetName(),
          asset_type: dsMockUtils.createMockAssetType(),
          divisible: dsMockUtils.createMockBool(),
          link_id: dsMockUtils.createMockU64(),
          total_supply: dsMockUtils.createMockBalance(),
          /* eslint-enable @typescript-eslint/camelcase */
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const securityToken = await polymesh.getSecurityToken({ ticker });
      expect(securityToken.ticker).toBe(ticker);
    });

    test('should throw if security token does not exist', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: dsMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: dsMockUtils.createMockIdentityId(),
          name: dsMockUtils.createMockAssetName(),
          asset_type: dsMockUtils.createMockAssetType(),
          divisible: dsMockUtils.createMockBool(),
          link_id: dsMockUtils.createMockU64(),
          total_supply: dsMockUtils.createMockBalance(),
          /* eslint-enable @typescript-eslint/camelcase */
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      return expect(polymesh.getSecurityToken({ ticker })).rejects.toThrow(
        `There is no Security Token with ticker "${ticker}"`
      );
    });
  });

  describe('method: addClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const claims: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: 'someIdentityId',
          },
        },
      ];

      const args = { claims };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Add }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.addClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: editClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const claims: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: 'someIdentityId',
          },
        },
      ];

      const args = { claims };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Edit }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.editClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokeClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const claims: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: 'someIdentityId',
          },
        },
      ];

      const args = { claims };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Revoke }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.revokeClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getNetworkProperties', () => {
    test('should return current network information', async () => {
      const name = 'someName';
      const version = 1;
      const fakeResult = {
        name,
        version,
      };

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      dsMockUtils.setRuntimeVersion({ specVersion: dsMockUtils.createMockU32(version) });
      dsMockUtils.createRpcStub('system', 'chain').resolves(dsMockUtils.createMockText(name));

      const result = await polymesh.getNetworkProperties();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getTreasuryBalance', () => {
    let fakeBalance: AccountBalance;

    beforeAll(() => {
      fakeBalance = {
        free: new BigNumber(500000),
        locked: new BigNumber(0),
      };
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });
    });

    test('should return the POLYX balance of the treasury account', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getTreasuryBalance();
      expect(result).toEqual(fakeBalance.free);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      dsMockUtils.getContextInstance().accountBalance.callsFake(async (_, cbFunc) => {
        cbFunc(fakeBalance);
        return unsubCallback;
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = sinon.stub();
      const result = await polymesh.getTreasuryBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeBalance.free);
    });
  });

  describe('method: getMySigningKeys', () => {
    test('should return a list of Signers', async () => {
      const fakeResult = [
        {
          type: SignerType.Account,
          value: '0xdummy',
        },
      ];

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getMySigningKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const getSigningKeysStub = dsMockUtils
        .getContextInstance()
        .getSigningKeys.resolves(unsubCallback);

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = (() => [] as unknown) as SubCallback<Signer[]>;
      const result = await polymesh.getMySigningKeys(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(getSigningKeysStub, callback);
    });
  });

  describe('method: onConnectionError', () => {
    test('should call the supplied listener when the event is emitted and return an unsubscribe callback', async () => {
      const polkadot = dsMockUtils.getApiInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const callback = sinon.stub();

      const unsub = polymesh.onConnectionError(callback);

      polkadot.emit('error');
      polkadot.emit('disconnected');

      unsub();

      polkadot.emit('error');

      sinon.assert.calledOnce(callback);
    });
  });

  describe('method: removeMySigningKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const signers = [
        {
          type: SignerType.Account,
          value: 'someAccount',
        },
      ];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeSigningKeys, 'prepare')
        .withArgs({ signers }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.removeMySigningKeys({ signers });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: onDisconnect', () => {
    test('should call the supplied listener when the event is emitted and return an unsubscribe callback', async () => {
      const polkadot = dsMockUtils.getApiInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const callback = sinon.stub();

      const unsub = polymesh.onDisconnect(callback);

      polkadot.emit('disconnected');
      polkadot.emit('error');

      unsub();

      polkadot.emit('disconnected');

      sinon.assert.calledOnce(callback);
    });
  });

  describe('method: getTransactionHistory', () => {
    test('should return a list of transactions', async () => {
      const address = 'someAddress';
      const key = 'someKey';
      const tag = TxTags.identity.CddRegisterDid;
      const moduleId = ModuleIdEnum.Identity;
      const callId = CallIdEnum.CddRegisterDid;

      sinon
        .stub(utilsModule, 'addressToKey')
        .withArgs(address)
        .returns(key);

      sinon
        .stub(utilsModule, 'txTagToExtrinsicIdentifier')
        .withArgs(tag)
        .returns({
          moduleId,
          callId,
        });

      /* eslint-disable @typescript-eslint/camelcase */
      const transactionsQueryResponse: ExtrinsicResult = {
        totalCount: 20,
        items: [
          {
            block_id: 1,
            address: address,
            success: 0,
          },
          {
            block_id: 2,
            success: 1,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: key,
          module_id: moduleId,
          call_id: callId,
          success: undefined,
          count: 2,
          skip: 1,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      let result = await polymesh.getTransactionHistory({
        address,
        tag,
        size: 2,
        start: 1,
      });

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[1].blockId).toEqual(2);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[1].address).toBeNull();
      expect(result.data[0].success).toBeFalsy();
      expect(result.data[1].success).toBeTruthy();
      expect(result.count).toEqual(20);
      expect(result.next).toEqual(3);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: undefined,
          module_id: undefined,
          call_id: undefined,
          success: undefined,
          count: undefined,
          skip: undefined,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      result = await polymesh.getTransactionHistory();

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(20);
      expect(result.next).toBeNull();
    });
  });
});
