import { Keyring } from '@polkadot/api';
import { Signer as PolkadotSigner } from '@polkadot/api/types';
import { ApolloLink, GraphQLRequest } from 'apollo-link';
import * as apolloLinkContextModule from 'apollo-link-context';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Identity, PolymeshError, TickerReservation, TransactionQueue } from '~/internal';
import { heartbeat } from '~/middleware/queries';
import { Polymesh } from '~/Polymesh';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { AccountBalance, ErrorCode, SubCallback, TickerReservationStatus } from '~/types';
import { tuple } from '~/types/utils';
import { SUPPORTED_VERSION_RANGE } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as internalUtils from '~/utils/internal';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/base/Context',
  require('~/testUtils/mocks/dataSources').mockContextModule('~/base/Context')
);
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
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('Polymesh Class', () => {
  let versionStub: sinon.SinonStub;
  beforeEach(() => {
    versionStub = sinon.stub(internalUtils, 'assertExpectedChainVersion').resolves(undefined);
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    sinon.restore();
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
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
      const accountSeed = 'Alice'.padEnd(66, ' ');
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        accountSeed,
        accountUri: undefined,
        accountMnemonic: undefined,
        keyring: undefined,
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
        accountSeed: undefined,
        accountUri: undefined,
        accountMnemonic: undefined,
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
        keyring: { keyring },
        accountSeed: undefined,
        accountUri: undefined,
        accountMnemonic: undefined,
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
        accountUri,
        accountSeed: undefined,
        accountMnemonic: undefined,
        keyring: undefined,
      });
    });

    test('should instantiate Context with a mnemonic and return a Polymesh instance', async () => {
      const accountMnemonic =
        'lorem ipsum dolor sit amet consectetur adipiscing elit nam hendrerit consectetur sagittis';
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountMnemonic,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        accountMnemonic,
        accountSeed: undefined,
        accountUri: undefined,
        keyring: undefined,
      });
    });

    test('should instantiate Context with middleware credentials and return a Polymesh instance', async () => {
      const accountUri = '//uri';
      const createStub = dsMockUtils.getContextCreateStub();
      const middleware = {
        link: 'someLink',
        key: 'someKey',
      };

      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri,
        middleware,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountUri,
        accountSeed: undefined,
        accountMnemonic: undefined,
        keyring: undefined,
      });
    });

    it('should warn if the Polymesh version does not satisfy the supported version range', async () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unsupported Polymesh version. Please upgrade the SDK',
        data: { supportedVersionRange: SUPPORTED_VERSION_RANGE },
      });
      versionStub.rejects(error);
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {
        // no-op
      });

      await expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).resolves.not.toThrow();
      expect(warn).toBeCalled();
      warn.mockRestore();
    });

    it('should throw an error if the Polymesh version check could not connect to the node', async () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unable to connect',
      });
      versionStub.rejects(error);

      return expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).rejects.toThrowError(error);
    });

    test('should throw an error if the middleware credentials are incorrect', async () => {
      const accountUri = '//uri';
      const middleware = {
        link: 'wrong',
        key: 'alsoWrong',
      };

      dsMockUtils.throwOnMiddlewareQuery(new Error('Forbidden'));

      let err;
      try {
        await Polymesh.connect({
          nodeUrl: 'wss://some.url',
          accountUri,
          middleware,
        });
      } catch (e) {
        err = e;
      }

      expect(err.message).toBe('Incorrect middleware URL or API key');

      dsMockUtils.throwOnMiddlewareQuery(new Error('Missing Authentication Token'));
      err = undefined;

      try {
        await Polymesh.connect({
          nodeUrl: 'wss://some.url',
          accountUri,
          middleware,
        });
      } catch (e) {
        err = e;
      }

      expect(err.message).toBe('Incorrect middleware URL or API key');

      // other errors are caught when performing queries later on
      dsMockUtils.throwOnMiddlewareQuery(new Error('Anything else'));
      err = undefined;

      try {
        await Polymesh.connect({
          nodeUrl: 'wss://some.url',
          accountUri,
          middleware,
        });
      } catch (e) {
        err = e;
      }

      expect(err).toBeUndefined();
    });

    test('should set an optional signer for the polkadot API', async () => {
      const accountSeed = 'Alice'.padEnd(66, ' ');
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
        accountSeed,
        accountUri: undefined,
        accountMnemonic: undefined,
        keyring: undefined,
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

  describe('method: getAccountBalance', () => {
    test('should return the free and locked POLYX balance of the current account', async () => {
      const fakeBalance = {
        free: new BigNumber(100),
        locked: new BigNumber(0),
        total: new BigNumber(100),
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
        total: new BigNumber(100),
      };
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      let result = await polymesh.getAccountBalance({ account: 'someId' });
      expect(result).toEqual(fakeBalance);

      result = await polymesh.getAccountBalance({
        account: new Account({ address: 'someId ' }, dsMockUtils.getContextInstance()),
      });
      expect(result).toEqual(fakeBalance);
    });

    test('should allow subscription (with and without a supplied account id)', async () => {
      const fakeBalance = {
        free: new BigNumber(100),
        locked: new BigNumber(0),
        total: new BigNumber(100),
      };
      const unsubCallback = 'unsubCallback';
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      let accountBalanceStub = (dsMockUtils.getContextInstance().getCurrentAccount()
        .getBalance as sinon.SinonStub).resolves(unsubCallback);

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = (() => 1 as unknown) as SubCallback<AccountBalance>;
      let result = await polymesh.getAccountBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);

      accountBalanceStub = entityMockUtils.getAccountGetBalanceStub().resolves(unsubCallback);
      const account = 'someId';
      result = await polymesh.getAccountBalance({ account }, callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.reserveTicker(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: claimClassicTicker', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const args = {
        ticker: 'SOMETICKER',
        ethereumSignature: 'someSig',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<TickerReservation>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.claimClassicTicker(args);

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
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
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

      const tickerReservations = await polymesh.getTickerReservations({ owner: did });

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of ticker reservations owned by the Identity', async () => {
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

    test('should filter out tickers with unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('someTicker')],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(unreadableTicker)],
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
    test('should return a specific ticker reservation owned by the Identity', async () => {
      const ticker = 'TEST';
      const expiry = new Date();

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId('someDid'),
          expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiry.getTime())),
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

    test('should throw if ticker is already a token', async () => {
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

      return expect(polymesh.getTickerReservation({ ticker })).rejects.toThrow(
        `${ticker} token has been created`
      );
    });
  });

  describe('method: getIdentity', () => {
    test('should return an Identity object with the passed did', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const params = { did: 'testDid' };

      const result = await polymesh.getIdentity(params);
      const context = dsMockUtils.getContextInstance();

      expect(result).toMatchObject(new Identity(params, context));
    });

    test('should throw an error if the Identity does not exist', async () => {
      entityMockUtils.configureMocks({ identityOptions: { exists: false } });
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      return expect(polymesh.getIdentity({ did: 'nonExistent' })).rejects.toThrow(
        'The Identity does not exist'
      );
    });
  });

  describe('method: getCurrentIdentity', () => {
    test('should return the current Identity', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const context = dsMockUtils.getContextInstance();
      const [result, currentIdentity] = await Promise.all([
        polymesh.getCurrentIdentity(),
        context.getCurrentIdentity(),
      ]);

      expect(result).toEqual(currentIdentity);
    });
  });

  describe('method: getAccount', () => {
    test('should return an Account object with the passed address', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const params = { address: 'testAddress' };

      const result = polymesh.getAccount(params);

      expect(result.address).toBe(params.address);
    });

    test('should return the current Account if no address is passed', async () => {
      const address = 'someAddress';
      dsMockUtils.configureMocks({ contextOptions: { currentPairAddress: address } });
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = polymesh.getAccount();

      expect(result.address).toBe(address);
    });
  });

  describe('method: getAccounts', () => {
    test('should return the list of signer accounts associated to the SDK', async () => {
      const accounts = [entityMockUtils.getAccountInstance()];
      dsMockUtils.configureMocks({
        contextOptions: {
          getAccounts: accounts,
        },
      });
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = polymesh.getAccounts();

      expect(result).toEqual(accounts);
    });
  });

  describe('method: isIdentityValid', () => {
    test('should return true if the supplied Identity exists', async () => {
      const did = 'someDid';

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const result = await polymesh.isIdentityValid({
        identity: entityMockUtils.getIdentityInstance({ did }),
      });

      expect(result).toBe(true);
    });

    test('should return false if the supplied Identity is invalid', async () => {
      const did = 'someDid';
      entityMockUtils.configureMocks({ identityOptions: { exists: false } });

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

  describe('method: getTreasuryAccount', () => {
    test('should return the treasury account', async () => {
      const treasuryAddress = '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR';
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      expect(polymesh.getTreasuryAccount().address).toEqual(treasuryAddress);
    });
  });

  describe('method: getSecurityTokens', () => {
    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
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

      const securityTokens = await polymesh.getSecurityTokens({ owner: 'someDid' });

      expect(securityTokens).toHaveLength(1);
      expect(securityTokens[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of security tokens owned by the current Identity if no did is supplied', async () => {
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

    test('should filter out tokens whose tickers have unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('someTicker')],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(unreadableTicker)],
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

  describe('method: transferPolyx', () => {
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.transferPolyx(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getSecurityToken', () => {
    test('should return a specific Security Token', async () => {
      const ticker = 'TEST';

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const securityToken = await polymesh.getSecurityToken({ ticker });
      expect(securityToken.ticker).toBe(ticker);
    });

    test('should throw if the Security Token does not exist', async () => {
      const ticker = 'TEST';
      entityMockUtils.configureMocks({ securityTokenOptions: { exists: false } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      return expect(polymesh.getSecurityToken({ ticker })).rejects.toThrow(
        `There is no Security Token with ticker "${ticker}"`
      );
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
        total: new BigNumber(500000),
      };
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });
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

      entityMockUtils.getAccountInstance().getBalance.callsFake(async cbFunc => {
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

  describe('method: registerIdentity', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const args = {
        targetAccount: 'someTarget',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Identity>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await polymesh.registerIdentity(args);

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

  describe('method: getLatestBlock', () => {
    test('should return the latest block number', async () => {
      const blockNumber = new BigNumber(100);

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true, latestBlock: blockNumber } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      const result = await polymesh.getLatestBlock();

      expect(result).toEqual(blockNumber);
    });
  });

  describe('method: disconnect', () => {
    test('should call the underlying disconnect function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      await polymesh.disconnect();
      sinon.assert.calledOnce(dsMockUtils.getContextInstance().disconnect);
    });
  });

  describe('method: getNetworkVersion', () => {
    test('should return the network version', async () => {
      const networkVersion = '1.0.0';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true, networkVersion } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      const result = await polymesh.getNetworkVersion();

      expect(result).toEqual(networkVersion);
    });
  });

  describe('method: addSigner', () => {
    test('should call the underlying addPair function', async () => {
      const pair = {
        address: '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR',
        publicKey: 'someKey',
        meta: {},
      };
      dsMockUtils.configureMocks({
        contextOptions: {
          addPair: pair,
        },
      });
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      let params:
        | {
            accountSeed: string;
          }
        | {
            accountUri: string;
          }
        | {
            accountMnemonic: string;
          } = { accountSeed: '0x1' };

      let account = polymesh.addSigner(params);
      expect(account.address).toBe(pair.address);

      params = { accountMnemonic: 'something' };

      account = polymesh.addSigner(params);
      expect(account.address).toBe(pair.address);

      params = { accountUri: '//Something' };

      account = polymesh.addSigner(params);
      expect(account.address).toBe(pair.address);
    });
  });

  describe('method: setSigner', () => {
    test('should call the underlying setPair function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      const address = 'address';

      polymesh.setSigner(address);
      sinon.assert.calledWith(dsMockUtils.getContextInstance().setPair, address);
    });
  });
});
