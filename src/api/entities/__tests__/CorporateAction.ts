import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, CorporateAction, CorporateActionBase, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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

  let corporateAction: CorporateAction;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    assetId = '0x12341234123412341234123412341234';
    declarationDate = new Date('10/14/1987 UTC');
    kind = CorporateActionKind.UnpredictableBenefit;
    description = 'someDescription';
    targets = {
      identities: [],
      treatment: TargetTreatment.Exclude,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [];

    corporateAction = new CorporateAction(
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

  it('should extend CorporateActionBase', () => {
    expect(CorporateAction.prototype instanceof CorporateActionBase).toBe(true);
  });

  describe('method: modifyCheckpoint', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const args = {
        checkpoint: new Date(),
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { corporateAction, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateAction.modifyCheckpoint(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
