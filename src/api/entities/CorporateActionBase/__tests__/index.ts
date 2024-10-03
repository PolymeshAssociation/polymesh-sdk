import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  CorporateActionBase,
  Entity,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBTreeSet, createMockU64 } from '~/testUtils/mocks/dataSources';
import {
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
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CorporateAction class', () => {
  let context: Context;
  let id: BigNumber;
  let assetId: string;
  let declarationDate: Date;
  let kind: CorporateActionKind;
  let description: string;
  let targets: CorporateActionTargets;
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: TaxWithholding[];

  let corporateAction: CorporateActionBase;

  let corporateActionsQueryMock: jest.Mock;

  // eslint-disable-next-line require-jsdoc
  class NonAbstract extends CorporateActionBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modifyCheckpoint = {} as any;
  }

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    assetId = '0x1234';
    declarationDate = new Date('10/14/1987 UTC');
    kind = CorporateActionKind.UnpredictableBenefit;
    description = 'someDescription';
    targets = {
      identities: [],
      treatment: TargetTreatment.Exclude,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [];

    corporateActionsQueryMock = dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockCorporateAction({
          kind,
          /* eslint-disable @typescript-eslint/naming-convention */
          decl_date: new BigNumber(declarationDate.getTime()),
          record_date: dsMockUtils.createMockRecordDate({
            date: new BigNumber(new Date('10/14/2019').getTime()),
            checkpoint: {
              Scheduled: [
                dsMockUtils.createMockU64(new BigNumber(1)),
                dsMockUtils.createMockU64(new BigNumber(1)),
              ],
            },
          }),
          targets: {
            identities: [],
            treatment: TargetTreatment.Exclude,
          },
          default_withholding_tax: new BigNumber(100000),
          withholding_tax: [],
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });

    corporateAction = new NonAbstract(
      {
        id,
        assetId,
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
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(CorporateActionBase.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign parameters to instance', () => {
      expect(corporateAction.id).toEqual(id);
      expect(corporateAction.asset.id).toBe(assetId);
      expect(corporateAction.declarationDate).toEqual(declarationDate);
      expect(corporateAction.description).toEqual(description);
      expect(corporateAction.targets).toEqual(targets);
      expect(corporateAction.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(corporateAction.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        CorporateActionBase.isUniqueIdentifiers({ assetId: 'SYMBOL', id: new BigNumber(1) })
      ).toBe(true);
      expect(CorporateActionBase.isUniqueIdentifiers({})).toBe(false);
      expect(CorporateActionBase.isUniqueIdentifiers({ assetId: 'SYMBOL' })).toBe(false);
      expect(CorporateActionBase.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: linkDocuments', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        documents: [
          {
            name: 'someName',
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { id, asset: corporateAction.asset, ...args }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateAction.linkDocuments(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the CA exists', async () => {
      let result = await corporateAction.exists();

      expect(result).toBe(true);

      corporateActionsQueryMock.mockResolvedValue(dsMockUtils.createMockOption());

      result = await corporateAction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: checkpoint', () => {
    let schedulePointsQueryMock: jest.Mock;

    beforeEach(() => {
      dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
        returnValue: dsMockUtils.createMockOption(),
      });

      schedulePointsQueryMock = dsMockUtils.createQueryMock('checkpoint', 'schedulePoints', {
        returnValue: [
          dsMockUtils.createMockU64(new BigNumber(1)),
          dsMockUtils.createMockU64(new BigNumber(2)),
        ],
      });
    });

    it('should throw an error if the Corporate Action does not exist', () => {
      corporateActionsQueryMock.mockResolvedValue(dsMockUtils.createMockOption());

      return expect(corporateAction.checkpoint()).rejects.toThrow(
        'The Corporate Action no longer exists'
      );
    });

    it('should return the Checkpoint Schedule associated to the Corporate Action', async () => {
      dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCheckpointSchedule({
            pending: createMockBTreeSet([createMockU64(new BigNumber(1))]),
          })
        ),
      });
      const result = (await corporateAction.checkpoint()) as CheckpointSchedule;

      expect(result.id).toEqual(new BigNumber(1));
    });

    it('should return null if the CA does not have a record date', async () => {
      corporateActionsQueryMock.mockResolvedValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind,
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: new BigNumber(declarationDate.getTime()),
            record_date: dsMockUtils.createMockOption(),
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: new BigNumber(100000),
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        )
      );
      const result = await corporateAction.checkpoint();

      expect(result).toBeNull();
    });

    it('should return a Checkpoint if the CA has a record date', async () => {
      schedulePointsQueryMock.mockResolvedValue([
        dsMockUtils.createMockU64(new BigNumber(new Date().getTime())),
        [dsMockUtils.createMockU64(new BigNumber(1))],
      ]);
      let result = (await corporateAction.checkpoint()) as Checkpoint;

      expect(result.id).toEqual(new BigNumber(1));
      expect(result instanceof Checkpoint);

      corporateActionsQueryMock.mockResolvedValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind,
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: new BigNumber(declarationDate.getTime()),
            record_date: dsMockUtils.createMockOption(
              dsMockUtils.createMockRecordDate({
                date: createMockU64(new BigNumber(new Date('10/14/1987').getTime())),
                checkpoint: { Existing: dsMockUtils.createMockU64(new BigNumber(1)) },
              })
            ),
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: new BigNumber(100000),
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        )
      );

      result = (await corporateAction.checkpoint()) as Checkpoint;

      expect(result.id).toEqual(new BigNumber(1));
      expect(result).toBeInstanceOf(Checkpoint);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(corporateAction.toHuman()).toEqual({
        id: '1',
        assetId: '0x1234',
        ticker: '0x1234',
        declarationDate: '1987-10-14T00:00:00.000Z',
        defaultTaxWithholding: '10',
        description: 'someDescription',
        targets: {
          identities: [],
          treatment: TargetTreatment.Exclude,
        },
        taxWithholdings: [],
      });
    });
  });
});
