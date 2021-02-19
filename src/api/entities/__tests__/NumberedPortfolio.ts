import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  Context,
  deletePortfolio,
  Entity,
  NumberedPortfolio,
  renamePortfolio,
  TransactionQueue,
} from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('NumberedPortfolio class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend entity', () => {
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

  describe('method: delete', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon.stub(deletePortfolio, 'prepare').withArgs({ id, did }, context).resolves(expectedQueue);

      const queue = await numberedPortfolio.delete();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modifyName', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const name = 'newName';
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<NumberedPortfolio>;

      sinon
        .stub(renamePortfolio, 'prepare')
        .withArgs({ id, did, name }, context)
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
      const eventIdx = 1;
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/camelcase */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/camelcase */
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
        returnValue: dsMockUtils.createMockBytes(),
      });

      sinon
        .stub(utilsConversionModule, 'stringToIdentityId')
        .returns(dsMockUtils.createMockIdentityId(did));
      sinon
        .stub(utilsConversionModule, 'numberToU64')
        .returns(dsMockUtils.createMockU64(portfolioId.toNumber()));

      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      let result = await numberedPortfolio.exists();
      expect(result).toBe(false);

      portfoliosStub.resolves(dsMockUtils.createMockBytes('portfolioName'));

      result = await numberedPortfolio.exists();
      expect(result).toBe(true);
    });
  });
});
