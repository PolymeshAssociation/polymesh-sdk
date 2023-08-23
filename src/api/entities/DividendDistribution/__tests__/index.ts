import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Checkpoint,
  Context,
  CorporateActionBase,
  DefaultPortfolio,
  DividendDistribution,
  PolymeshTransaction,
} from '~/internal';
import { distributionPaymentsQuery, distributionQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  CorporateActionKind,
  CorporateActionTargets,
  TargetTreatment,
  TaxWithholding,
} from '~/types';
import { MAX_DECIMALS } from '~/utils/constants';
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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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
    const targetIdentity = entityMockUtils.getIdentityInstance({
      did: 'targetDid',
      toHuman: 'targetDid',
    });
    targets = {
      identities: [entityMockUtils.getIdentityInstance(), targetIdentity],
      treatment: TargetTreatment.Include,
    };
    defaultTaxWithholding = new BigNumber(0.123456);
    taxWithholdings = [
      {
        identity: targetIdentity,
        percentage: new BigNumber(5),
      },
    ];
    origin = entityMockUtils.getDefaultPortfolioInstance();
    currency = 'USD';
    perShare = new BigNumber(0.234567);
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

    dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          perShare: new BigNumber(20000000),
          amount: new BigNumber(50000000000),
          remaining: new BigNumber(40000000000),
          paymentAt: new BigNumber(new Date(new Date().getTime() + 60 * 60 * 1000).getTime()),
          expiresAt: dsMockUtils.createMockOption(),
          reclaimed: false,
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
    procedureMockUtils.cleanup();
  });

  it('should extend CorporateActionBase', () => {
    expect(DividendDistribution.prototype instanceof CorporateActionBase).toBe(true);
  });

  describe('constructor', () => {
    it('should assign parameters to instance', () => {
      expect(dividendDistribution.id).toEqual(id);
      expect(dividendDistribution.asset.ticker).toBe(ticker);
      expect(dividendDistribution.declarationDate).toEqual(declarationDate);
      expect(dividendDistribution.description).toEqual(description);
      expect(dividendDistribution.targets).toEqual(targets);
      expect(dividendDistribution.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(dividendDistribution.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: checkpoint', () => {
    it('should just pass the call down the line', async () => {
      const fakeResult = 'checkpoint' as unknown as Checkpoint;
      jest.spyOn(CorporateActionBase.prototype, 'checkpoint').mockResolvedValue(fakeResult);

      const result = await dividendDistribution.checkpoint();

      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(dividendDistribution.checkpoint()).rejects.toThrow(
        'The Dividend Distribution no longer exists'
      );
    });
  });

  describe('method: exists', () => {
    it('should return whether the Distribution exists', async () => {
      let result = await dividendDistribution.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await dividendDistribution.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: claim', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { distribution: dividendDistribution }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await dividendDistribution.claim();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: pay', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const identityTargets = ['identityDid'];

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { targets: identityTargets, distribution: dividendDistribution },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await dividendDistribution.pay({ targets: identityTargets });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: details', () => {
    it('should return the distribution details', async () => {
      const result = await dividendDistribution.details();

      expect(result).toEqual({
        remainingFunds: new BigNumber(40000),
        fundsReclaimed: false,
      });
    });

    it('should throw an error if the Dividend Distribution does not exist', async () => {
      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
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
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const args = {
        checkpoint: new Date(),
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { corporateAction: dividendDistribution, ...args }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await dividendDistribution.modifyCheckpoint(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getWithheldTax', () => {
    it('should return the amount of the withheld tax', async () => {
      const fakeTax = new BigNumber(1000000);

      dsMockUtils.createApolloQueryMock(
        distributionQuery({
          id: `${ticker}/${id.toString()}`,
        }),
        {
          distribution: {
            taxes: fakeTax.toNumber(),
          },
        }
      );

      const result = await dividendDistribution.getWithheldTax();

      expect(result).toEqual(new BigNumber(1));
    });

    it('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createApolloQueryMock(
        distributionQuery({
          id: `${ticker}/${id.toString()}`,
        }),
        {
          distribution: {
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
    it('should return the distribution participants', async () => {
      const excluded = entityMockUtils.getIdentityInstance({ did: 'excluded', isEqual: true });

      const balances = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'someDid', isEqual: false }),
          balance: new BigNumber(10),
        },
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'otherDid', isEqual: false }),
          balance: new BigNumber(0),
        },
        {
          identity: excluded,
          balance: new BigNumber(20),
        },
      ];

      const allBalancesMock = jest.fn();

      allBalancesMock
        .mockResolvedValueOnce({ data: balances, next: 'notNull' })
        .mockResolvedValueOnce({ data: [], next: null });

      entityMockUtils.configureMocks({
        checkpointOptions: {
          allBalances: allBalancesMock,
        },
      });

      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      jest
        .spyOn(dividendDistribution, 'checkpoint')
        .mockResolvedValue(entityMockUtils.getCheckpointInstance());

      dsMockUtils.createQueryMock('capitalDistribution', 'holderPaid', {
        multi: [dsMockUtils.createMockBool(true)],
      });

      let result = await dividendDistribution.getParticipants();

      const amount = balances[0].balance.multipliedBy(dividendDistribution.perShare);
      const amountAfterTax = amount
        .minus(
          amount.multipliedBy(defaultTaxWithholding).dividedBy(100).decimalPlaces(MAX_DECIMALS)
        )
        .decimalPlaces(MAX_DECIMALS);

      expect(result).toEqual([
        {
          identity: balances[0].identity,
          amount,
          taxWithholdingPercentage: defaultTaxWithholding,
          amountAfterTax,
          paid: true,
        },
      ]);

      expect(result[0].amountAfterTax.decimalPlaces()).toBeLessThanOrEqual(MAX_DECIMALS);

      dividendDistribution.paymentDate = new Date('10/14/1987');

      balances[0].identity = entityMockUtils.getIdentityInstance({
        did: 'targetDid',
        isEqual: false,
      });
      balances[0].identity.isEqual.mockReturnValueOnce(false).mockReturnValue(true);

      allBalancesMock.mockResolvedValue({ data: balances, next: null });

      result = await dividendDistribution.getParticipants();

      expect(result).toEqual([
        expect.objectContaining({
          identity: balances[0].identity,
          amount,
          taxWithholdingPercentage: new BigNumber(5),
          paid: false,
        }),
      ]);
      expect(result[0].amountAfterTax.decimalPlaces()).toBeLessThanOrEqual(MAX_DECIMALS);
    });

    it("should return an empty array if the distribution checkpoint hasn't been created yet", async () => {
      jest
        .spyOn(dividendDistribution, 'checkpoint')
        .mockResolvedValue(entityMockUtils.getCheckpointScheduleInstance());

      const result = await dividendDistribution.getParticipants();

      expect(result).toEqual([]);
    });
  });

  describe('method: getParticipant', () => {
    it('should return the distribution participant', async () => {
      const did = 'someDid';
      const balance = new BigNumber(100);
      const excluded = entityMockUtils.getIdentityInstance({ did: 'excluded' });

      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      jest.spyOn(dividendDistribution, 'checkpoint').mockResolvedValue(
        entityMockUtils.getCheckpointInstance({
          balance,
        })
      );

      jest
        .spyOn(utilsConversionModule, 'stringToIdentityId')
        .mockReturnValue(dsMockUtils.createMockIdentityId(did));

      jest
        .spyOn(utilsConversionModule, 'corporateActionIdentifierToCaId')
        .mockReturnValue(dsMockUtils.createMockCAId({ ticker, localId: id }));
      jest.spyOn(utilsConversionModule, 'boolToBoolean').mockReturnValue(false);

      dsMockUtils.createQueryMock('capitalDistribution', 'holderPaid', {
        returnValue: false,
      });

      let result = await dividendDistribution.getParticipant({
        identity: entityMockUtils.getIdentityInstance({ isEqual: false, did }),
      });

      expect(result?.identity.did).toBe(did);
      expect(result?.amount).toEqual(balance.multipliedBy(dividendDistribution.perShare));
      expect(result?.paid).toBe(false);
      expect(result?.taxWithholdingPercentage).toEqual(defaultTaxWithholding);
      expect(result?.amountAfterTax.decimalPlaces()).toBeLessThanOrEqual(MAX_DECIMALS);

      dividendDistribution.paymentDate = new Date('10/14/1987');

      const targetIdentity = entityMockUtils.getIdentityInstance({
        isEqual: false,
        did: 'targetDid',
      });
      targetIdentity.isEqual.mockReturnValueOnce(false).mockReturnValue(true);

      result = await dividendDistribution.getParticipant({
        identity: targetIdentity,
      });

      expect(result?.identity.did).toBe('targetDid');
      expect(result?.amount).toEqual(balance.multipliedBy(dividendDistribution.perShare));
      expect(result?.paid).toBe(false);
      expect(result?.taxWithholdingPercentage).toEqual(new BigNumber(5));
      expect(result?.amountAfterTax.decimalPlaces()).toBeLessThanOrEqual(MAX_DECIMALS);

      context.getSigningIdentity = jest
        .fn()
        .mockResolvedValue(entityMockUtils.getIdentityInstance({ did, isEqual: false }));

      result = await dividendDistribution.getParticipant();

      expect(result?.identity.did).toBe(did);
      expect(result?.amount).toEqual(balance.multipliedBy(dividendDistribution.perShare));
      expect(result?.paid).toBe(false);
      expect(result?.taxWithholdingPercentage).toEqual(defaultTaxWithholding);
      expect(result?.amountAfterTax.decimalPlaces()).toBeLessThanOrEqual(MAX_DECIMALS);
    });

    it("should return null if the distribution checkpoint hasn't been created yet", async () => {
      jest
        .spyOn(dividendDistribution, 'checkpoint')
        .mockResolvedValue(entityMockUtils.getCheckpointScheduleInstance());

      const result = await dividendDistribution.getParticipant({
        identity: 'someDid',
      });

      expect(result).toEqual(null);
    });

    it('should return null if the identity is excluded of the distribution', async () => {
      const did = 'someDid';
      const excluded = entityMockUtils.getIdentityInstance({ did });
      dividendDistribution.targets = {
        identities: [excluded],
        treatment: TargetTreatment.Exclude,
      };
      jest.spyOn(dividendDistribution, 'checkpoint').mockResolvedValue(
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
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { distribution: dividendDistribution }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await dividendDistribution.reclaimFunds();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getPaymentHistory', () => {
    it('should return the amount of the withheld tax', async () => {
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventId = 'eventId';
      const datetime = '2020-10-10';
      const eventDid = 'eventDid';
      const balance = new BigNumber(100);
      const tax = new BigNumber(10);
      const size = new BigNumber(1);
      const start = new BigNumber(0);

      dsMockUtils.createApolloQueryMock(
        distributionPaymentsQuery(
          {
            distributionId: `${ticker}/${id.toString()}`,
          },
          size,
          start
        ),
        {
          distributionPayments: {
            totalCount: 1,
            nodes: [
              {
                eventId,
                targetId: eventDid,
                datetime,
                amount: balance.toNumber(),
                tax: tax.toNumber(),

                createdBlock: {
                  blockId: blockId.toNumber(),
                  hash: blockHash,
                },
              },
            ],
          },
        }
      );

      const {
        data: [result],
      } = await dividendDistribution.getPaymentHistory({
        size,
        start,
      });

      expect(result.blockNumber).toEqual(blockId);
      expect(result.blockHash).toEqual(blockHash);
      expect(result.date).toEqual(new Date(`${datetime}Z`));
      expect(result.target.did).toBe(eventDid);
      expect(result.amount).toEqual(balance.shiftedBy(-6));
      expect(result.withheldTax).toEqual(tax.shiftedBy(-4));
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryMock(
        distributionPaymentsQuery({
          distributionId: `${ticker}/${id.toString()}`,
        }),
        {
          distributionPayments: {
            totalCount: 0,
            nodes: [],
          },
        }
      );
      const result = await dividendDistribution.getPaymentHistory();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });

    it('should throw an error if the Dividend Distribution does not exist', () => {
      dsMockUtils.createQueryMock('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createApolloQueryMock(
        distributionPaymentsQuery({
          distributionId: `${ticker}/${id.toString()}`,
        }),
        {
          distributionPayments: {
            totalCount: 0,
            nodes: [],
          },
        }
      );

      return expect(dividendDistribution.getPaymentHistory()).rejects.toThrow(
        'The Dividend Distribution no longer exists'
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      dividendDistribution.targets = {
        treatment: TargetTreatment.Exclude,
        identities: [],
      };
      expect(dividendDistribution.toHuman()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
        declarationDate: '1987-10-14T00:00:00.000Z',
        defaultTaxWithholding: '0.123456',
        description: 'something',
        targets: {
          identities: [],
          treatment: TargetTreatment.Exclude,
        },
        taxWithholdings: [
          {
            identity: 'targetDid',
            percentage: '5',
          },
        ],
        currency: 'USD',
        expiryDate: null,
        paymentDate: dividendDistribution.paymentDate.toISOString(),
        maxAmount: '10000',
        origin: { did: 'someDid' },
        perShare: '0.234567',
      });
    });
  });
});
