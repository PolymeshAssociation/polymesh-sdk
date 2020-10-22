import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { createPortfolio } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { Portfolios } from '../Portfolios';

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
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let prepareCreatePortfolioStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    u64ToBigNumberStub = sinon.stub(utilsModule, 'u64ToBigNumber');
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    identity = new Identity({ did }, mockContext);
    portfolios = new Portfolios(identity, mockContext);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
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

  describe('method: getPortfolio', () => {
    test('should return the default portfolio for the current identity', async () => {
      const result = await portfolios.getPortfolio();
      expect(result instanceof DefaultPortfolio).toBe(true);
      expect(result.owner.did).toEqual(did);
    });

    test('should return a numbered portfolio', async () => {
      const portfolioId = new BigNumber(1);
      const portfolioName = 'someName';

      dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        returnValue: dsMockUtils.createMockBytes(portfolioName),
      });

      stringToIdentityIdStub.returns(dsMockUtils.createMockIdentityId(did));
      numberToU64Stub.returns(dsMockUtils.createMockU64(portfolioId.toNumber()));

      const result = await portfolios.getPortfolio({ portfolioId });

      expect(result instanceof NumberedPortfolio).toBe(true);
      expect((result as NumberedPortfolio).id).toEqual(portfolioId);
    });

    test("should throw an error ir portfolio doesn't exist", async () => {
      const portfolioId = new BigNumber(0);

      dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        returnValue: dsMockUtils.createMockBytes(),
      });

      stringToIdentityIdStub.returns(dsMockUtils.createMockIdentityId(did));
      numberToU64Stub.returns(dsMockUtils.createMockU64(portfolioId.toNumber()));

      return expect(portfolios.getPortfolio({ portfolioId })).rejects.toThrow(
        "The Portfolio doesn't exist"
      );
    });
  });

  describe('method: createPortfolio', () => {
    beforeAll(() => {
      prepareCreatePortfolioStub = sinon.stub(createPortfolio, 'prepare');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const name = 'someName';
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<NumberedPortfolio>;

      prepareCreatePortfolioStub.withArgs({ name }, mockContext).resolves(expectedQueue);

      const queue = await portfolios.createPortfolio({ name });

      expect(queue).toBe(expectedQueue);
    });
  });
});
