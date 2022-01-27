import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  Checkpoint,
  Context,
  CorporateActionBase,
  DefaultPortfolio,
  DividendDistribution,
  TransactionQueue,
} from '~/internal';
import { getHistoryOfPaymentEventsForCa, getWithholdingTaxesOfCa } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  CorporateActionKind,
  CorporateActionTargets,
  TargetTreatment,
  TaxWithholding,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
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
    declarationDate = new Date('10/14/1987 UTC');
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
    paymentDate = new Date(new Date().getTime() + 60 * 60 * 24 * 365);
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
        kind: CorporateActionKind.UnpredictableBenefit,
      },
      context
    );

    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          /* eslint-disable @typescript-eslint/naming-convention */
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
          /* eslint-enable @typescript-eslint/naming-convention */
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

  test('should extend CorporateActionBase', () => {
    expect(DividendDistribution.prototype instanceof CorporateActionBase).toBe(true);
  });

  describe('constructor', () => {
    test('should assign parameters to instance', () => {
      expect(dividendDistribution.id).toEqual(id);
      expect(dividendDistribution.token.ticker).toBe(ticker);
      expect(dividendDistribution.declarationDate).toEqual(declarationDate);
      expect(dividendDistribution.description).toEqual(description);
      expect(dividendDistribution.targets).toEqual(targets);
      expect(dividendDistribution.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(dividendDistribution.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: checkpoint', () => {
    test('should just pass the call down the line', async () => {
      const fakeResult = 'checkpoint' as unknown as Checkpoint;
      sinon.stub(CorporateActionBase.prototype, 'checkpoint').resolves(fakeResult);

      const result = await dividendDistribution.checkpoint();

      expect(result).toEqual(fakeResult);
    });

    test('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(dividendDistribution.checkpoint()).rejects.toThrow(
        'The Dividend Distribution no longer exists'
      );
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
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

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
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;
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
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;
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

      dsMockUtils.createApolloQueryStub(
        getWithholdingTaxesOfCa({
          CAId: { ticker, localId: id.toNumber() },
        }),
        {
          getWithholdingTaxesOfCA: {
            taxes: fakeTax.toNumber(),
          },
        }
      );

      const result = await dividendDistribution.getWithheldTax();

      expect(result).toEqual(fakeTax);
    });

    test('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createApolloQueryStub(
        getWithholdingTaxesOfCa({
          CAId: { ticker, localId: id.toNumber() },
        }),
        {
          getWithholdingTaxesOfCA: {
            taxes: 0,
          },
        }
      );

      return expect(dividendDistribution.getWithheldTax()).rejects.toThrow(
        'The Dividend Distribution no longer exists'
      );
    });
  });

  describe('method: getParticipants', () => {
    test('should return the distribution participants', async () => {
      const excluded = entityMockUtils.getIdentityInstance({ did: 'excluded' });
      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      sinon
        .stub(dividendDistribution, 'checkpoint')
        .resolves(entityMockUtils.getCheckpointInstance());
      const allBalancesStub = entityMockUtils.getCheckpointAllBalancesStub();

      const balances = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
          balance: new BigNumber(10000),
        },
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
          balance: new BigNumber(0),
        },
        {
          identity: excluded,
          balance: new BigNumber(20000),
        },
      ];

      allBalancesStub.onFirstCall().resolves({ data: balances, next: 'notNull' });
      allBalancesStub.onSecondCall().resolves({ data: [], next: null });

      dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
        multi: [dsMockUtils.createMockBool(true)],
      });

      let result = await dividendDistribution.getParticipants();

      expect(result).toEqual([
        {
          identity: balances[0].identity,
          amount: balances[0].balance.multipliedBy(dividendDistribution.perShare),
          paid: true,
        },
      ]);

      dividendDistribution.paymentDate = new Date('10/14/1987');

      allBalancesStub.onThirdCall().resolves({ data: balances, next: null });

      result = await dividendDistribution.getParticipants();

      expect(result).toEqual([
        {
          identity: balances[0].identity,
          amount: balances[0].balance.multipliedBy(dividendDistribution.perShare),
          paid: false,
        },
      ]);
    });

    test("should return an empty array if the distribution checkpoint hasn't been created yet", async () => {
      sinon
        .stub(dividendDistribution, 'checkpoint')
        .resolves(entityMockUtils.getCheckpointScheduleInstance());

      const result = await dividendDistribution.getParticipants();

      expect(result).toEqual([]);
    });
  });

  describe('method: getParticipant', () => {
    test('should return the distribution participant', async () => {
      const did = 'someDid';
      const balance = new BigNumber(100);
      const excluded = entityMockUtils.getIdentityInstance({ did: 'excluded' });

      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      sinon.stub(dividendDistribution, 'checkpoint').resolves(
        entityMockUtils.getCheckpointInstance({
          balance,
        })
      );

      sinon
        .stub(utilsConversionModule, 'stringToIdentityId')
        .returns(dsMockUtils.createMockIdentityId(did));

      /* eslint-disable @typescript-eslint/naming-convention */
      sinon
        .stub(utilsConversionModule, 'corporateActionIdentifierToCaId')
        .returns(dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() }));
      /* eslint-enable @typescript-eslint/naming-convention */
      sinon.stub(utilsConversionModule, 'boolToBoolean').returns(false);

      dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
        returnValue: false,
      });

      let result = await dividendDistribution.getParticipant({
        identity: did,
      });

      expect(result).toEqual({
        identity: entityMockUtils.getIdentityInstance({ did }),
        amount: balance.multipliedBy(dividendDistribution.perShare),
        paid: false,
      });

      dividendDistribution.paymentDate = new Date('10/14/1987');

      result = await dividendDistribution.getParticipant({
        identity: did,
      });

      expect(result).toEqual({
        identity: entityMockUtils.getIdentityInstance({ did }),
        amount: balance.multipliedBy(dividendDistribution.perShare),
        paid: false,
      });

      result = await dividendDistribution.getParticipant();

      expect(result).toEqual({
        identity: entityMockUtils.getIdentityInstance(),
        amount: balance.multipliedBy(dividendDistribution.perShare),
        paid: false,
      });
    });

    test("should return null if the distribution checkpoint hasn't been created yet", async () => {
      sinon
        .stub(dividendDistribution, 'checkpoint')
        .resolves(entityMockUtils.getCheckpointScheduleInstance());

      const result = await dividendDistribution.getParticipant({
        identity: 'someDid',
      });

      expect(result).toEqual(null);
    });

    test('should return null if the identity is excluded of the distribution', async () => {
      const did = 'someDid';
      const excluded = entityMockUtils.getIdentityInstance({ did });
      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      sinon.stub(dividendDistribution, 'checkpoint').resolves(
        entityMockUtils.getCheckpointInstance({
          balance: new BigNumber(10),
        })
      );

      const result = await dividendDistribution.getParticipant({
        identity: did,
      });

      expect(result).toEqual(null);
    });
  });

  describe('method: reclaimFunds', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { distribution: dividendDistribution }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await dividendDistribution.reclaimFunds();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getPaymentHistory', () => {
    test('should return the amount of the withheld tax', async () => {
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventId = 'eventId';
      const datetime = '2020-10-10';
      const eventDid = 'eventDid';
      const balance = new BigNumber(100);
      const tax = new BigNumber(10);

      dsMockUtils.createQueryStub('system', 'blockHash', {
        multi: [dsMockUtils.createMockHash(blockHash)],
      });
      dsMockUtils.createApolloQueryStub(
        getHistoryOfPaymentEventsForCa({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: null,
          toDate: null,
          count: undefined,
          skip: undefined,
        }),
        {
          getHistoryOfPaymentEventsForCA: {
            totalCount: 1,
            items: [
              {
                blockId: blockId.toNumber(),
                eventId,
                datetime,
                eventDid,
                balance: balance.toNumber(),
                tax: tax.toNumber(),
              },
            ],
          },
        }
      );

      const result = await dividendDistribution.getPaymentHistory();

      expect(result.data).toEqual([
        {
          blockNumber: blockId,
          blockHash,
          date: new Date(`${datetime}Z`),
          target: entityMockUtils.getIdentityInstance({ did: eventDid }),
          amount: balance,
          withheldTax: tax,
        },
      ]);
    });

    test('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        getHistoryOfPaymentEventsForCa({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: null,
          toDate: null,
          count: undefined,
          skip: undefined,
        }),
        {
          getHistoryOfPaymentEventsForCA: {
            totalCount: 0,
            items: [],
          },
        }
      );
      const result = await dividendDistribution.getPaymentHistory();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });

    test('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createApolloQueryStub(
        getHistoryOfPaymentEventsForCa({
          CAId: { ticker, localId: id.toNumber() },
          fromDate: null,
          toDate: null,
          count: undefined,
          skip: undefined,
        }),
        {
          getHistoryOfPaymentEventsForCA: {
            totalCount: 0,
            items: [],
          },
        }
      );

      return expect(dividendDistribution.getPaymentHistory()).rejects.toThrow(
        'The Dividend Distribution no longer exists'
      );
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      dividendDistribution.targets = {
        treatment: TargetTreatment.Exclude,
        identities: [],
      };
      expect(dividendDistribution.toJson()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
        declarationDate: '1987-10-14T00:00:00.000Z',
        defaultTaxWithholding: '10',
        description: 'something',
        targets: {
          identities: [],
          treatment: TargetTreatment.Exclude,
        },
        taxWithholdings: [],
        currency: 'USD',
        expiryDate: null,
        paymentDate: dividendDistribution.paymentDate.toISOString(),
        maxAmount: '10000',
        origin: {
          did: 'someDid',
        },
        perShare: '10',
      });
    });
  });
});
