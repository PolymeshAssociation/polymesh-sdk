import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import * as internalUtils from '@polymeshassociation/polymesh-sdk/utils/internal';
import { SigningManager } from '@polymeshassociation/signing-manager-types';

import { ConfidentialPolymesh } from '~/api/client/Polymesh';
import { PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { SUPPORTED_NODE_VERSION_RANGE } from '~/utils/constants';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '@apollo/client/core',
  require('~/testUtils/mocks/dataSources').mockApolloModule('@apollo/client/core')
);

jest.mock(
  '@polymeshassociation/polymesh-sdk/base/Context',
  require('~/testUtils/mocks/dataSources').mockContextModule(
    '@polymeshassociation/polymesh-sdk/base/Context'
  )
);

describe('ConfidentialPolymesh Class', () => {
  let versionSpy: jest.SpyInstance;
  beforeEach(() => {
    versionSpy = jest
      .spyOn(internalUtils, 'assertExpectedChainVersion')
      .mockClear()
      .mockImplementation()
      .mockResolvedValue(undefined);
    jest.spyOn(internalUtils, 'assertExpectedSqVersion').mockImplementation();
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
      const polymesh = await ConfidentialPolymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(polymesh instanceof ConfidentialPolymesh).toBe(true);
    });

    it('should instantiate Context with a Signing Manager and return a Polymesh instance', async () => {
      const signingManager = 'signingManager' as unknown as SigningManager;
      const createMock = dsMockUtils.getContextCreateMock();

      await ConfidentialPolymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApiV2: null,
        signingManager,
      });
    });

    it('should instantiate Context with middleware V2 URL and return a Polymesh instance', async () => {
      const createMock = dsMockUtils.getContextCreateMock();

      const middlewareV2 = {
        link: 'someLink',
        key: '',
      };

      await ConfidentialPolymesh.connect({
        nodeUrl: 'wss://some.url',
        middlewareV2,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
    });

    it('should instantiate Context with Polkadot config and return ConfidentialPolymesh instance', async () => {
      const createMock = dsMockUtils.getContextCreateMock();

      const metadata = {
        someHashAndVersion: '0x00',
      } as const;

      const polkadot = {
        metadata,
      };

      await ConfidentialPolymesh.connect({
        nodeUrl: 'wss://some.url',
        polkadot,
      });

      expect(createMock).toHaveBeenCalledTimes(1);
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
        ConfidentialPolymesh.connect({
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
        ConfidentialPolymesh.connect({
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
        ConfidentialPolymesh.connect({
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

      const connection = ConfidentialPolymesh.connect({
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

    it('should throw if Context fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = ConfidentialPolymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });

    it('should throw if Polkadot fails in the connection process', async () => {
      dsMockUtils.throwOnApiCreation(new Error());

      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = ConfidentialPolymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "The node couldn’t be reached"`
      );
    });

    it('should throw if Context create method fails', () => {
      dsMockUtils.throwOnContextCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = ConfidentialPolymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });
  });
});
