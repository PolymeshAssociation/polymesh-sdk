import { StorageKey, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Context,
  DefaultPortfolio,
  Identity,
  Namespace,
  NumberedPortfolio,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { Portfolios } from '../Portfolios';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Portfolios class', () => {
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const numberedPortfolioId = new BigNumber(1);
  const rawNumberedPortfolioId = dsMockUtils.createMockU64(numberedPortfolioId.toNumber());
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let u64ToBigNumberStub: sinon.SinonStub<[u64], BigNumber>;
  let portfolios: Portfolios;
  let identity: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    u64ToBigNumberStub = sinon.stub(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    identity = new Identity({ did }, mockContext);
    portfolios = new Portfolios(identity, mockContext);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getPortfolios', () => {
    test('should retrieve all the portfolios for the identity', async () => {
      dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), rawNumberedPortfolioId],
            dsMockUtils.createMockBytes()
          ),
        ],
      });

      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawIdentityId);
      u64ToBigNumberStub.returns(numberedPortfolioId);

      const result = await portfolios.getPortfolios();
      expect(result).toHaveLength(2);
      expect(result[0] instanceof DefaultPortfolio).toBe(true);
      expect(result[1] instanceof NumberedPortfolio).toBe(true);
      expect(result[0].owner.did).toEqual(did);
      expect(result[1].id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getCustodiedPortfolios', () => {
    test('should retrieve all the Portfolios custodied by the Identity', async () => {
      dsMockUtils.createQueryStub('portfolio', 'portfoliosInCustody');

      const entries = [
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind('Default'),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind({ User: rawNumberedPortfolioId }),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
      ];

      sinon.stub(utilsInternalModule, 'requestPaginated').resolves({ entries, lastKey: null });

      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawIdentityId);
      u64ToBigNumberStub.returns(numberedPortfolioId);

      const { data } = await portfolios.getCustodiedPortfolios();
      expect(data).toHaveLength(2);
      expect(data[0] instanceof DefaultPortfolio).toBe(true);
      expect(data[1] instanceof NumberedPortfolio).toBe(true);
      expect(data[0].owner.did).toEqual(did);
      expect((data[1] as NumberedPortfolio).id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getPortfolio', () => {
    test('should return the default portfolio for the current identity', async () => {
      const result = await portfolios.getPortfolio();
      expect(result instanceof DefaultPortfolio).toBe(true);
      expect(result.owner.did).toEqual(did);
    });

    test('should return a numbered portfolio', async () => {
      const portfolioId = new BigNumber(1);

      const result = await portfolios.getPortfolio({ portfolioId });

      expect(result instanceof NumberedPortfolio).toBe(true);
      expect(result.id).toEqual(portfolioId);
    });

    test("should throw an error if a numbered portfolio doesn't exist", () => {
      const portfolioId = new BigNumber(1);

      entityMockUtils.configureMocks({
        numberedPortfolioOptions: {
          exists: false,
        },
      });

      return expect(portfolios.getPortfolio({ portfolioId })).rejects.toThrow(
        "The Portfolio doesn't exist"
      );
    });
  });

  describe('method: create', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const name = 'someName';
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<NumberedPortfolio>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { name }, transformer: undefined }, mockContext)
        .resolves(expectedQueue);

      const queue = await portfolios.create({ name });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: delete', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const portfolioId = new BigNumber(5);
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { id: portfolioId, did }, transformer: undefined }, mockContext)
        .resolves(expectedQueue);

      let queue = await portfolios.delete({ portfolio: portfolioId });

      expect(queue).toBe(expectedQueue);

      queue = await portfolios.delete({
        portfolio: new NumberedPortfolio({ id: portfolioId, did }, mockContext),
      });

      expect(queue).toBe(expectedQueue);
    });
  });
});
