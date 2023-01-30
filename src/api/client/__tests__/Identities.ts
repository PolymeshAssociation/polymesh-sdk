import { when } from 'jest-when';

import { Identities } from '~/api/client/Identities';
import { createPortfolioTransformer } from '~/api/entities/Venue';
import { Context, Identity, NumberedPortfolio, PolymeshTransaction } from '~/internal';
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
      context.getIdentity.mockResolvedValue(identity);

      const result = await identities.getIdentity(params);

      expect(result).toMatchObject(identity);
    });
  });

  describe('method: registerIdentity', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        targetAccount: 'someTarget',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Identity>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.registerIdentity(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: registerIdentityWithCdd', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      const args = {
        targetAccount: 'someTarget',
        expiry,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Identity>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.registerIdentityWithCdd(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createPortfolio', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args = { name: 'someName' };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { names: [args.name] }, transformer: createPortfolioTransformer },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolio(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createPortfolios', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args = { names: ['someName'] };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolios(args);

      expect(tx).toBe(expectedTransaction);
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
