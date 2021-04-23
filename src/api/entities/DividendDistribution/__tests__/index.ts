import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  Checkpoint,
  Context,
  CorporateAction,
  DefaultPortfolio,
  DividendDistribution,
  Entity,
  TransactionQueue,
} from '~/internal';
import { getWithholdingTaxesOfCA } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { CorporateActionTargets, TargetTreatment, TaxWithholding } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('DividendDistribution class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;
  let declarationDate: Date;
  let description: string;
  let targets: CorporateActionTargets;
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: TaxWithholding[];
  let origin: DefaultPortfolio;
  let currency: string;
  let perShare: BigNumber;
  let maxAmount: BigNumber;
  let expiryDate: Date | null;
  let paymentDate: Date;
  let dividendDistribution: DividendDistribution;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
    declarationDate = new Date('10/14/1987');
    description = 'something';
    targets = {
      identities: [entityMockUtils.getIdentityInstance()],
      treatment: TargetTreatment.Include,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [];
    origin = entityMockUtils.getDefaultPortfolioInstance();
    currency = 'USD';
    perShare = new BigNumber(10);
    maxAmount = new BigNumber(10000);
    expiryDate = null;
    paymentDate = new Date('10/14/2021');
    dividendDistribution = new DividendDistribution(
      {
        id,
        ticker,
        declarationDate,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        origin,
        currency,
        perShare,
        maxAmount,
        expiryDate,
        paymentDate,
      },
      context
    );

    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          /* eslint-disable @typescript-eslint/camelcase */
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          per_share: 20000000,
          amount: 50000000000,
          remaining: 40000000000,
          payment_at: new Date(new Date().getTime() + 60 * 60 * 1000).getTime(),
          expires_at: null,
          reclaimed: false,
          /* eslint-enable @typescript-eslint/camelcase */
        })
      ),
    });
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
    expect(DividendDistribution.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign parameters to instance', () => {
      expect(dividendDistribution.id).toEqual(id);
      expect(dividendDistribution.ticker).toBe(ticker);
      expect(dividendDistribution.declarationDate).toEqual(declarationDate);
      expect(dividendDistribution.description).toEqual(description);
      expect(dividendDistribution.targets).toEqual(targets);
      expect(dividendDistribution.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(dividendDistribution.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: checkpoint', () => {
    test('should just pass the call down the line', async () => {
      const fakeResult = ('checkpoint' as unknown) as Checkpoint;
      sinon.stub(CorporateAction.prototype, 'checkpoint').resolves(fakeResult);

      const result = await dividendDistribution.checkpoint();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: exists', () => {
    test('should return whether the Distribution exists', async () => {
      let result = await dividendDistribution.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await dividendDistribution.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: claim', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { distribution: dividendDistribution }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await dividendDistribution.claim();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: pay', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;
      const identityTargets = ['identityDid'];

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { targets: identityTargets, distribution: dividendDistribution },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await dividendDistribution.pay({ targets: identityTargets });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: details', () => {
    test('should return the distribution details', async () => {
      const result = await dividendDistribution.details();

      expect(result).toEqual({
        remainingFunds: new BigNumber(40000),
        fundsReclaimed: false,
      });
    });

    test('should throw an error if the Dividend Distribution does not exist', async () => {
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      let err;
      try {
        await dividendDistribution.details();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe('The Dividend Distribution no longer exists');
    });
  });

  describe('method: modifyCheckpoint', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;
      const args = {
        checkpoint: new Date(),
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { distribution: dividendDistribution, ...args }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const queue = await dividendDistribution.modifyCheckpoint(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getWithheldTax', () => {
    test('should return the amount of the withheld tax', async () => {
      const fakeTax = new BigNumber(100);
      const from = 1589816265000;
      const to = 1599819865000;

      dsMockUtils.createApolloQueryStub(
        getWithholdingTaxesOfCA({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: null,
          toDate: null,
        }),
        {
          getWithholdingTaxesOfCA: {
            taxes: fakeTax.toNumber(),
          },
        }
      );

      let result = await dividendDistribution.getWithheldTax();

      expect(result).toEqual(fakeTax);

      dsMockUtils.createApolloQueryStub(
        getWithholdingTaxesOfCA({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: '2020-05-18',
          toDate: '2020-09-11',
        }),
        {
          getWithholdingTaxesOfCA: {
            taxes: fakeTax.toNumber(),
          },
        }
      );

      result = await dividendDistribution.getWithheldTax({
        from: new Date(from),
        to: new Date(to),
      });

      expect(result).toEqual(fakeTax);
    });

    test('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        getWithholdingTaxesOfCA({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: null,
          toDate: null,
        }),
        {}
      );
      const result = await dividendDistribution.getWithheldTax();
      expect(result).toBeNull();
    });
  });
});
