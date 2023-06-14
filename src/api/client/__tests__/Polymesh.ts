import { ApolloLink, GraphQLRequest } from '@apollo/client';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import { when } from 'jest-when';

import { Polymesh } from '~/api/client/Polymesh';
import { PolymeshError, PolymeshTransactionBatch } from '~/internal';
import { heartbeat } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode, TransactionArray } from '~/types';
import { SUPPORTED_NODE_VERSION_RANGE } from '~/utils/constants';
import * as internalUtils from '~/utils/internal';

jest.mock('@apollo/client/react', () => ({}));

jest.mock('@apollo/client/link/context', () => ({
  ...jest.requireActual('@apollo/client/link/context'),
  setContext: jest.fn().mockImplementation(cbFunc => {
    return new ApolloLink(cbFunc({} as GraphQLRequest, {}));
  }),
}));
jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/base/Context',
  require('~/testUtils/mocks/dataSources').mockContextModule('~/base/Context')
);
jest.mock(
  '@apollo/client',
  require('~/testUtils/mocks/dataSources').mockApolloModule('@apollo/client')
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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('Polymesh Class', () => {
  let versionSpy: jest.SpyInstance;
  beforeEach(() => {
    versionSpy = jest
      .spyOn(internalUtils, 'assertExpectedChainVersion')
      .mockClear()
      .mockImplementation()
      .mockResolvedValue(undefined);
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: connect', () => {
    it('should instantiate Context and return a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(polymesh instanceof Polymesh).toBe(true);
    });

    it('should instantiate Context with a Signing Manager and return a Polymesh instance', async () => {
      const signingManager = 'signingManager' as unknown as SigningManager;
      const createMock = dsMockUtils.getContextCreateMock();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareApiV2: null,
        signingManager,
      });
    });

    it('should instantiate Context with middleware credentials and return a Polymesh instance', async () => {
      const createMock = dsMockUtils.getContextCreateMock();
      const middleware = {
        link: 'someLink',
        key: 'someKey',
      };

      dsMockUtils.createApolloQueryMock(heartbeat(), true);

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middleware,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareApiV2: null,
        signingManager: undefined,
      });
    });

    it('should throw if the Polymesh version does not satisfy the supported version range', async () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unsupported Polymesh RPC node version. Please upgrade the SDK',
        data: { supportedVersionRange: SUPPORTED_NODE_VERSION_RANGE },
      });
      versionSpy.mockImplementation(() => {
        throw error;
      });

      await expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).rejects.toThrow(error);
    });

    it('should throw an error if the Polymesh version check could not connect to the node', async () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unable to connect',
      });
      versionSpy.mockImplementation(() => {
        throw error;
      });

      return expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).rejects.toThrowError(error);
    });

    it('should throw an error if the middleware credentials are incorrect', async () => {
      const middleware = {
        link: 'wrong',
        key: 'alsoWrong',
      };

      dsMockUtils.throwOnMiddlewareQuery(new Error('Forbidden'));

      let err;
      try {
        await Polymesh.connect({
          nodeUrl: 'wss://some.url',
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
          middleware,
        });
      } catch (e) {
        err = e;
      }

      expect(err).toBeUndefined();
    });

    it('should throw if Context fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });

    it('should throw if Polkadot fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation(new Error());

      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "The node couldn’t be reached"`
      );
    });

    it('should throw if Context create method fails', () => {
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

  describe('method: getSigningIdentity', () => {
    it('should return the signing Identity', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager: 'signingManager' as unknown as SigningManager,
      });

      const context = dsMockUtils.getContextInstance();
      const [result, signingIdentity] = await Promise.all([
        polymesh.getSigningIdentity(),
        context.getSigningIdentity(),
      ]);

      expect(result).toEqual(signingIdentity);
    });
  });

  describe('method: onConnectionError', () => {
    it('should call the supplied listener when the event is emitted and return an unsubscribe callback', async () => {
      const polkadot = dsMockUtils.getApiInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = jest.fn();

      const unsub = polymesh.onConnectionError(callback);

      polkadot.emit('error');
      polkadot.emit('disconnected');

      unsub();

      polkadot.emit('error');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('method: onDisconnect', () => {
    it('should call the supplied listener when the event is emitted and return an unsubscribe callback', async () => {
      const polkadot = dsMockUtils.getApiInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const callback = jest.fn();

      const unsub = polymesh.onDisconnect(callback);

      polkadot.emit('disconnected');
      polkadot.emit('error');

      unsub();

      polkadot.emit('disconnected');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('method: disconnect', () => {
    it('should call the underlying disconnect function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      await polymesh.disconnect();
      expect(dsMockUtils.getContextInstance().disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('method: setSigningAccount', () => {
    it('should call the underlying setSigningAccount function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager: 'signingManager' as unknown as SigningManager,
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      const address = 'address';

      await polymesh.setSigningAccount(address);
      expect(dsMockUtils.getContextInstance().setSigningAddress).toHaveBeenCalledWith(address);
    });
  });

  describe('method: setSigningManager', () => {
    it('should call the underlying setSigningManager function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager: 'signingManager' as unknown as SigningManager,
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });

      const signingManager = 'manager' as unknown as SigningManager;

      await polymesh.setSigningManager(signingManager);
      expect(dsMockUtils.getContextInstance().setSigningManager).toHaveBeenCalledWith(
        signingManager
      );
    });
  });

  describe('method: createTransactionBatch', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager: 'signingManager' as unknown as SigningManager,
        middleware: {
          link: 'someLink',
          key: 'someKey',
        },
      });
      const context = dsMockUtils.getContextInstance();

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransactionBatch<
        [void, void]
      >;
      const transactions = ['foo', 'bar', 'baz'] as unknown as TransactionArray<[void, void]>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { transactions }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await polymesh.createTransactionBatch({
        transactions,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });
});
