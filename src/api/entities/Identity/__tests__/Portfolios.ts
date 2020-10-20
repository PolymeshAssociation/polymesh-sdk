import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { createPortfolio } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsModule from '~/utils';

import { Portfolios } from '../Portfolios';

describe('Portfolios class', () => {
  const did = 'someDid';
  let context: Mocked<Context>;
  let portfolios: Portfolios;
  let identity: Identity;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let prepareCreatePortfolioStub: SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identity = new Identity({ did }, context);
    portfolios = new Portfolios(identity, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
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

      prepareCreatePortfolioStub.withArgs({ name }, context).resolves(expectedQueue);

      const queue = await portfolios.createPortfolio({ name });

      expect(queue).toBe(expectedQueue);
    });
  });
});
