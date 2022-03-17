import { SigningManager } from '@polymathnetwork/signing-manager-types';
import { ApolloLink, GraphQLRequest } from 'apollo-link';
import * as apolloLinkContextModule from 'apollo-link-context';
import semver from 'semver';
import sinon from 'sinon';

import { heartbeat } from '~/middleware/queries';
import { Polymesh } from '~/Polymesh';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { SUPPORTED_VERSION_RANGE } from '~/utils/constants';

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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  'websocket-as-promised',
  require('~/testUtils/mocks/dataSources').mockWebSocketAsPromisedModule()
);

describe('Polymesh Class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: create', () => {
    beforeAll(() => {
      sinon.stub(apolloLinkContextModule, 'setContext').callsFake(cbFunc => {
        return new ApolloLink(cbFunc({} as GraphQLRequest, {}));
      });
    });

    it('should instantiate Context and return a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(polymesh instanceof Polymesh).toBe(true);
    });

    it('should instantiate Context with a Signing Manager and return a Polymesh instance', async () => {
      const signingManager = 'signingManager' as unknown as SigningManager;
      const createStub = dsMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        signingManager,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        middlewareV2Api: null,
        middlewareDiffLogger: undefined,
        signingManager,
      });
    });

    it('should instantiate Context with middleware credentials and return a Polymesh instance', async () => {
      const createStub = dsMockUtils.getContextCreateStub();
      const middleware = {
        link: 'someLink',
        key: 'someKey',
      };

      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        middleware,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        middlewareV2Api: null,
        middlewareDiffLogger: undefined,
        signingManager: undefined,
      });
    });

    it('should throw an error if the Polymesh version does not satisfy the supported version range', async () => {
      jest.spyOn(semver, 'satisfies').mockImplementationOnce(() => false);

      let err;
      try {
        await Polymesh.connect({
          nodeUrl: 'wss://some.url',
        });
      } catch (e) {
        err = e;
      }

      expect(err.message).toBe('Unsupported Polymesh version. Please upgrade the SDK');
      expect(err.data.supportedVersionRange).toBe(SUPPORTED_VERSION_RANGE);
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

      const callback = sinon.stub();

      const unsub = polymesh.onConnectionError(callback);

      polkadot.emit('error');
      polkadot.emit('disconnected');

      unsub();

      polkadot.emit('error');

      sinon.assert.calledOnce(callback);
    });
  });

  describe('method: onDisconnect', () => {
    it('should call the supplied listener when the event is emitted and return an unsubscribe callback', async () => {
      const polkadot = dsMockUtils.getApiInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
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
      sinon.assert.calledOnce(dsMockUtils.getContextInstance().disconnect);
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

      polymesh.setSigningAccount(address);
      sinon.assert.calledWith(dsMockUtils.getContextInstance().setSigningAddress, address);
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

      polymesh.setSigningManager(signingManager);
      sinon.assert.calledWith(dsMockUtils.getContextInstance().setSigningManager, signingManager);
    });
  });
});
