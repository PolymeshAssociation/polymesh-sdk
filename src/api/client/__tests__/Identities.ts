import sinon from 'sinon';

import { Identities } from '~/api/client/Identities';
import { Context, Identity, NumberedPortfolio, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Identities Class', () => {
  let context: Mocked<Context>;
  let identities: Identities;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identities = new Identities(context);
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

  describe('method: getIdentity', () => {
    it('should return an Identity object with the passed did', async () => {
      const params = { did: 'testDid' };

      const identity = new Identity(params, context);
      context.getIdentity.onFirstCall().resolves(identity);

      const result = await identities.getIdentity(params);

      expect(result).toMatchObject(identity);
    });
  });

  describe('method: registerIdentity', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        targetAccount: 'someTarget',
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Identity>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identities.registerIdentity(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createPortfolio', () => {
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const args = { names: ['someName'] };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<NumberedPortfolio>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(sinon.match({ args, transformer: sinon.match.func }), context)
        .resolves(expectedQueue);

      const queue = await identities.createPortfolio({ name: 'someName' });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createPortfolios', () => {
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const args = { names: ['someName'] };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<NumberedPortfolio>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identities.createPortfolios(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: isIdentityValid', () => {
    it('should return true if the supplied Identity exists', async () => {
      const did = 'someDid';

      const result = await identities.isIdentityValid({
        identity: entityMockUtils.getIdentityInstance({ did }),
      });

      expect(result).toBe(true);
    });

    it('should return false if the supplied Identity is invalid', async () => {
      const did = 'someDid';
      entityMockUtils.configureMocks({ identityOptions: { exists: false } });

      const result = await identities.isIdentityValid({ identity: did });

      expect(result).toBe(false);
    });
  });
});
