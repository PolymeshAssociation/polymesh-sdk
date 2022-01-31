import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Entity, NumberedPortfolio, TransactionQueue } from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('NumberedPortfolio class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(NumberedPortfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign Identity and id to instance', () => {
      const did = 'someDid';
      const id = new BigNumber(1);
      const identity = entityMockUtils.getIdentityInstance({ did });
      const portfolio = new NumberedPortfolio({ did, id }, context);

      expect(portfolio.owner).toEqual(identity);
      expect(portfolio.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid', id: new BigNumber(1) })).toBe(
        true
      );
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({})).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid', id: 3 })).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 1, id: new BigNumber(1) })).toBe(false);
    });
  });

  describe('method: modifyName', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const name = 'newName';
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<NumberedPortfolio>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { id, did, name }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await numberedPortfolio.modifyName({ name });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getName', () => {
    test('should return the name of the Portfolio', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const portfolioName = 'someName';
      const rawPortfolioName = dsMockUtils.createMockText(portfolioName);
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        returnValue: rawPortfolioName,
      });

      const result = await numberedPortfolio.getName();

      expect(result).toEqual(portfolioName);
    });
  });

  describe('method: createdAt', () => {
    const id = new BigNumber(1);
    const did = 'someDid';
    const variables = {
      moduleId: ModuleIdEnum.Portfolio,
      eventId: EventIdEnum.PortfolioCreated,
      eventArg0: did,
      eventArg1: id.toString(),
    };

    test('should return the event identifier object of the portfolio creation', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/naming-convention */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx.toNumber(),
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const result = await numberedPortfolio.createdAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await numberedPortfolio.createdAt();
      expect(result).toBeNull();
    });
  });

  describe('method: exists', () => {
    test('should return whether the portfolio exists', async () => {
      const did = 'someDid';
      const id = new BigNumber(1);
      const portfolioId = new BigNumber(0);

      const portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        size: new BigNumber(0),
      });

      sinon
        .stub(utilsConversionModule, 'stringToIdentityId')
        .returns(dsMockUtils.createMockIdentityId(did));
      sinon
        .stub(utilsConversionModule, 'bigNumberToU64')
        .returns(dsMockUtils.createMockU64(portfolioId));

      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      let result = await numberedPortfolio.exists();
      expect(result).toBe(false);

      portfoliosStub.size.resolves(dsMockUtils.createMockU64(new BigNumber(10)));

      result = await numberedPortfolio.exists();
      expect(result).toBe(true);
    });
  });
});
