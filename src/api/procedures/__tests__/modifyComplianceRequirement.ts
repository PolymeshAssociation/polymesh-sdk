import {
  ComplianceRequirement,
  Condition as MeshCondition,
  Ticker,
  TxTags,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyComplianceRequirement,
} from '~/api/procedures/modifyComplianceRequirement';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, ConditionTarget, ConditionType, InputRequirement } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyComplianceRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let requirementToComplianceRequirementStub: sinon.SinonStub<
    [InputRequirement, Context],
    ComplianceRequirement
  >;
  let ticker: string;
  let conditions: Condition[];
  let rawTicker: Ticker;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    requirementToComplianceRequirementStub = sinon.stub(
      utilsConversionModule,
      'requirementToComplianceRequirement'
    );
    ticker = 'someTicker';
    conditions = [
      {
        type: ConditionType.IsIdentity,
        identity: entityMockUtils.getIdentityInstance(),
        target: ConditionTarget.Both,
      },
      {
        type: ConditionType.IsExternalAgent,
        target: ConditionTarget.Both,
      },
    ];
  });

  let addTransactionStub: sinon.SinonStub;

  let modifyComplianceRequirementTransaction: PolymeshTx<[Ticker]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(50),
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    modifyComplianceRequirementTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'changeComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);

    entityMockUtils.configureMocks({
      assetOptions: {
        complianceRequirementsGet: {
          requirements: [
            {
              conditions,
              id: 1,
            },
          ],
          defaultTrustedClaimIssuers: [],
        },
      },
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the supplied requirement id does not belong to the Asset', () => {
    const fakeConditions = ['condition'] as unknown as Condition[];
    args = {
      ticker,
      id: 2,
      conditions: fakeConditions,
    };
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyComplianceRequirement.call(proc, args)).rejects.toThrow(
      'The Compliance Requirement does not exist'
    );
  });

  test('should throw an error if the supplied requirement conditions have no change', () => {
    args = {
      ticker,
      id: 1,
      conditions,
    };
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyComplianceRequirement.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  test('should add a modify compliance requirement transaction to the queue', async () => {
    const fakeConditions = [{ claim: '' }] as unknown as Condition[];
    const fakeSenderConditions = 'senderConditions' as unknown as MeshCondition[];
    const fakeReceiverConditions = 'receiverConditions' as unknown as MeshCondition[];

    const rawComplianceRequirement = dsMockUtils.createMockComplianceRequirement({
      /* eslint-disable @typescript-eslint/naming-convention */
      sender_conditions: fakeSenderConditions,
      receiver_conditions: fakeReceiverConditions,
      id: dsMockUtils.createMockU32(1),
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    requirementToComplianceRequirementStub
      .withArgs({ conditions: fakeConditions, id: 1 }, mockContext)
      .returns(rawComplianceRequirement);

    args = {
      ticker,
      id: 1,
      conditions: fakeConditions,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareModifyComplianceRequirement.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: modifyComplianceRequirementTransaction,
      args: [rawTicker, rawComplianceRequirement],
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        ticker,
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ChangeComplianceRequirement],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
