import * as polkadotRef from '@polkadot/api';
import { ApiOptions } from '@polkadot/api/types';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import { when } from 'jest-when';

import { Polymesh } from '~/api/client/Polymesh';
import { PolymeshError, PolymeshTransactionBatch } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode, TransactionArray } from '~/types';
import * as internalUtils from '~/utils/internal';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/base/Context',
  require('~/testUtils/mocks/dataSources').mockContextModule('~/base/Context')
);
const mockCreateHttpLink = jest.fn();

// wraps the shared Apollo mock so the options `createMiddlewareApi` builds can be asserted on
jest.mock('@apollo/client/core', () => {
  const actual = jest.requireActual('@apollo/client/core');

  return {
    ...require('~/testUtils/mocks/dataSources').mockApolloModule('@apollo/client/core')(),
    createHttpLink: (...args: unknown[]): unknown => {
      mockCreateHttpLink(...args);

      return actual.createHttpLink(...args);
    },
  };
});
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
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('Polymesh Class', () => {
  let assertExpectedChainVersionSpy: jest.SpyInstance;
  beforeEach(() => {
    assertExpectedChainVersionSpy = jest
      .spyOn(internalUtils, 'assertExpectedChainVersion')
      .mockClear()
      .mockImplementation()
      .mockResolvedValue(0);
    jest.spyOn(internalUtils, 'warnUnexpectedSqVersion').mockImplementation();
    dsMockUtils.configureMocks({ contextOptions: undefined });
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
      const apiPromiseCreateSpy = jest.spyOn(polkadotRef.ApiPromise, 'create');
      const signingManager = 'signingManager' as unknown as SigningManager;
      const createMock = dsMockUtils.getContextCreateMock();
      const typesBundle = {} as Required<ApiOptions>['typesBundle'];
      const metadata = {
        someHashAndVersion: '0x00',
      } as const;

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager,
        polkadot: {
          metadata,
          noInitWarn: true,
          typesBundle,
        },
      });

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApiV2: null,
        signingManager,
      });
      expect(apiPromiseCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata,
          noInitWarn: true,
          typesBundle,
        })
      );
    });

    it('should instantiate Context with an HTTP provider and return a Polymesh instance', async () => {
      const signingManager = 'signingManager' as unknown as SigningManager;
      const createMock = dsMockUtils.getContextCreateMock();

      await Polymesh.connect({
        nodeUrl: 'https://some.url',
        signingManager,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApiV2: null,
        signingManager,
      });
    });

    it('should forward `initWasm: false` so that connecting does not wait on the WASM backend', async () => {
      const apiPromiseCreateSpy = jest.spyOn(polkadotRef.ApiPromise, 'create');
      dsMockUtils.getContextCreateMock();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        polkadot: {
          initWasm: false,
        },
      });

      expect(apiPromiseCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          initWasm: false,
        })
      );
    });

    it('should not pass `initWasm` when it is not supplied, leaving the polkadot default in place', async () => {
      const apiPromiseCreateSpy = jest.spyOn(polkadotRef.ApiPromise, 'create');
      dsMockUtils.getContextCreateMock();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(apiPromiseCreateSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({
          initWasm: expect.anything(),
        })
      );
    });

    it('should instantiate Context with middleware V2 URL and return a Polymesh instance', async () => {
      const createMock = dsMockUtils.getContextCreateMock();

      const middlewareV2 = {
        link: 'someLink',
        key: '',
      };

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middlewareV2,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
    });

    it('should send the api key header only when a key is configured', async () => {
      mockCreateHttpLink.mockClear();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middlewareV2: { link: 'someLink' },
      });

      expect(mockCreateHttpLink).toHaveBeenLastCalledWith(
        expect.objectContaining({ uri: 'someLink', headers: {} })
      );

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middlewareV2: { link: 'someLink', key: 'someKey' },
      });

      expect(mockCreateHttpLink).toHaveBeenLastCalledWith(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect.objectContaining({ headers: { 'x-api-key': 'someKey' } })
      );
    });

    it('should instantiate Context with Polkadot config and return  Polymesh instance', async () => {
      const createMock = dsMockUtils.getContextCreateMock();

      const metadata = {
        someHashAndVersion: '0x00',
      } as const;

      const polkadot = {
        metadata,
      };

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        polkadot,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
    });

    it('should throw if the Polymesh version does not satisfy the supported version range', async () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unsupported Polymesh spec version. Please upgrade the SDK',
      });
      assertExpectedChainVersionSpy.mockImplementation(() => {
        throw error;
      });

      await expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).rejects.toThrow(error);
    });

    it('should throw an error if the Polymesh version check could not connect to the node', () => {
      const error = new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unable to connect',
      });
      assertExpectedChainVersionSpy.mockImplementation(() => {
        throw error;
      });

      return expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
        })
      ).rejects.toThrowError(error);
    });

    it('should throw an error if the middleware V2 URL is incorrect', () => {
      const middlewareV2 = {
        link: 'wrong',
        key: '',
      };

      const context = dsMockUtils.getContextInstance();

      context.getMiddlewareMetadata = jest.fn().mockImplementation(() => {
        throw new Error('Network error');
      });

      dsMockUtils.getContextCreateMock().mockResolvedValue(context);

      return expect(
        Polymesh.connect({
          nodeUrl: 'wss://some.url',
          middlewareV2,
        })
      ).rejects.toThrow('Could not query for middleware V2 metadata');
    });

    it('should throw an error if the middleware V2 URL is incompatible with given node URl', async () => {
      const genesisHash = 'someOtherHash';

      const context = dsMockUtils.getContextInstance();
      jest.spyOn(context.polymeshApi.genesisHash, 'toString').mockReturnValue(genesisHash);
      dsMockUtils.getContextCreateMock().mockResolvedValue(context);

      const connection = Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middlewareV2: {
          link: 'someLink',
          key: '',
        },
      });
      await expect(connection).rejects.toThrow(
        'Middleware V2 URL is for a different chain than the given node URL'
      );

      dsMockUtils.configureMocks({
        contextOptions: { getMiddlewareMetadata: undefined },
      });

      await expect(connection).rejects.toThrow(
        'Middleware V2 URL is for a different chain than the given node URL'
      );
    });

    it('should throw if Context fails in the connection process', () => {
      dsMockUtils.throwOnApiCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });

    it('should throw if Polkadot fails in the connection process', () => {
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
        middlewareV2: {
          link: 'someLink',
          key: '',
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
        middlewareV2: {
          link: 'someLink',
          key: '',
        },
      });

      const address = 'address';

      polymesh.setSigningAccount(address);
      expect(dsMockUtils.getContextInstance().setSigningAddress).toHaveBeenCalledWith(address);
    });
  });

  describe('method: setSigningManager', () => {
    it('should call the underlying setSigningManager function', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager: 'signingManager' as unknown as SigningManager,
        middlewareV2: {
          link: 'someLink',
          key: '',
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
        middlewareV2: {
          link: 'someLink',
          key: '',
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
