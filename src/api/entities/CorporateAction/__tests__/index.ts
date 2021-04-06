import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Checkpoint } from '~/api/entities/Checkpoint';
import {
  CheckpointSchedule,
  Context,
  CorporateAction,
  Entity,
  linkCaDocs,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  CalendarUnit,
  CorporateActionKind,
  CorporateActionTargets,
  TargetTreatment,
  TaxWithholding,
} from '~/types';

jest.mock(
  '~/api/entities/Checkpoint',
  require('~/testUtils/mocks/entities').mockCheckpointModule('~/api/entities/Checkpoint')
);
jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);

describe('CorporateAction class', () => {
  let context: Context;
  let id: BigNumber;
  let ticker: string;
  let declarationDate: Date;
  let kind: CorporateActionKind;
  let description: string;
  let targets: CorporateActionTargets;
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: TaxWithholding[];

  let corporateAction: CorporateAction;

  let corporateActionsQueryStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
    declarationDate = new Date('10/14/1987');
    kind = CorporateActionKind.UnpredictableBenefit;
    description = 'someDescription';
    targets = {
      identities: [],
      treatment: TargetTreatment.Exclude,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [];

    corporateActionsQueryStub = dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockCorporateAction({
          kind,
          /* eslint-disable @typescript-eslint/camelcase */
          decl_date: declarationDate.getTime(),
          record_date: dsMockUtils.createMockRecordDate({
            date: new Date('10/14/2019').getTime(),
            checkpoint: { Scheduled: [dsMockUtils.createMockU64(1), dsMockUtils.createMockU64(1)] },
          }),
          targets: {
            identities: [],
            treatment: TargetTreatment.Exclude,
          },
          details: 'something',
          default_withholding_tax: 100000,
          withholding_tax: [],
          /* eslint-enable @typescript-eslint/camelcase */
        })
      ),
    });

    corporateAction = new CorporateAction(
      {
        id,
        ticker,
        kind,
        declarationDate,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
      },
      context
    );
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(CorporateAction.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign parameters to instance', () => {
      expect(corporateAction.id).toEqual(id);
      expect(corporateAction.ticker).toBe(ticker);
      expect(corporateAction.declarationDate).toEqual(declarationDate);
      expect(corporateAction.description).toEqual(description);
      expect(corporateAction.targets).toEqual(targets);
      expect(corporateAction.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(corporateAction.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(CorporateAction.isUniqueIdentifiers({ ticker: 'SYMBOL', id: new BigNumber(1) })).toBe(
        true
      );
      expect(CorporateAction.isUniqueIdentifiers({})).toBe(false);
      expect(CorporateAction.isUniqueIdentifiers({ ticker: 'SYMBOL' })).toBe(false);
      expect(CorporateAction.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: linkCaDocs', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        documents: [
          {
            name: 'someName',
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(linkCaDocs, 'prepare')
        .withArgs({ id, ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await corporateAction.linkCaDocs(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: exists', () => {
    test('should return whether the CA exists', async () => {
      let result = await corporateAction.exists();

      expect(result).toBe(true);

      corporateActionsQueryStub.resolves(dsMockUtils.createMockOption());

      result = await corporateAction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: checkpoint', () => {
    let schedulePointsQueryStub: sinon.SinonStub;

    beforeEach(() => {
      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            schedule: {
              start: new Date('10/14/1987').getTime(),
              period: {
                unit: 'Month',
                amount: 2,
              },
            },
            id: 1,
            at: new Date('10/14/1987').getTime(),
            remaining: 2,
          }),
        ],
      });

      schedulePointsQueryStub = dsMockUtils.createQueryStub('checkpoint', 'schedulePoints', {
        returnValue: [],
      });
    });

    test('should throw an error if the Corporate Action does not exist', async () => {
      corporateActionsQueryStub.resolves(dsMockUtils.createMockOption());

      let err;
      try {
        await corporateAction.checkpoint();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe('The Corporate Action no longer exists');
    });

    test('should return the Checkpoint Schedule associated to the Corporate Action', async () => {
      const result = (await corporateAction.checkpoint()) as CheckpointSchedule;

      expect(result.id).toEqual(new BigNumber(1));
      expect(result.period).toEqual({ unit: CalendarUnit.Month, amount: 2 });
      expect(result.start).toEqual(new Date('10/14/1987'));
    });

    test('should return null if the CA does not have a record date', async () => {
      corporateActionsQueryStub.resolves(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind,
            /* eslint-disable @typescript-eslint/camelcase */
            decl_date: declarationDate.getTime(),
            record_date: null,
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            details: 'something',
            default_withholding_tax: 100000,
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/camelcase */
          })
        )
      );
      const result = await corporateAction.checkpoint();

      expect(result).toBeNull();
    });

    test('should return null if the CA does not have a record date', async () => {
      schedulePointsQueryStub.resolves(['someCheckpoint', dsMockUtils.createMockU64(1)]);
      let result = (await corporateAction.checkpoint()) as Checkpoint;

      expect(result.id).toEqual(new BigNumber(1));
      expect(result instanceof Checkpoint);

      corporateActionsQueryStub.resolves(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind,
            /* eslint-disable @typescript-eslint/camelcase */
            decl_date: declarationDate.getTime(),
            record_date: dsMockUtils.createMockRecordDate({
              date: new Date('10/14/1987').getTime(),
              checkpoint: { Existing: dsMockUtils.createMockU64(1) },
            }),
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            details: 'something',
            default_withholding_tax: 100000,
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/camelcase */
          })
        )
      );

      result = (await corporateAction.checkpoint()) as Checkpoint;

      expect(result.id).toEqual(new BigNumber(1));
      expect(result instanceof Checkpoint);
    });
  });
});
