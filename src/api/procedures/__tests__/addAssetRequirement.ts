import BigNumber from 'bignumber.js';
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
  prepareAddAssetRequirement,
} from '~/api/procedures/addAssetRequirement';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, ConditionTarget, ConditionType, InputRequirement } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('addAssetRequirement procedure', () => {
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

    args = {
      ticker,
      conditions,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let addComplianceRequirementTransaction: PolymeshTx<[Ticker]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    addComplianceRequirementTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'addComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the supplied requirement is already a part of the Asset', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        complianceRequirementsGet: {
          requirements: [
            {
              conditions,
              id: new BigNumber(1),
            },
          ],
          defaultTrustedClaimIssuers: [],
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(prepareAddAssetRequirement.call(proc, args)).rejects.toThrow(
      'There already exists a Requirement with the same conditions for this Asset'
    );
  });

  it('should add an add compliance requirement transaction to the queue', async () => {
    const fakeConditions = ['condition'] as unknown as Condition[];
    const fakeSenderConditions = 'senderConditions' as unknown as MeshCondition[];
    const fakeReceiverConditions = 'receiverConditions' as unknown as MeshCondition[];

    requirementToComplianceRequirementStub
      .withArgs({ conditions: fakeConditions, id: new BigNumber(1) }, mockContext)
      .returns(
        dsMockUtils.createMockComplianceRequirement({
          /* eslint-disable @typescript-eslint/naming-convention */
          sender_conditions: fakeSenderConditions,
          receiver_conditions: fakeReceiverConditions,
          id: dsMockUtils.createMockU32(new BigNumber(1)),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      );

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const result = await prepareAddAssetRequirement.call(proc, {
      ...args,
      conditions: fakeConditions,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addComplianceRequirementTransaction,
      args: [rawTicker, fakeSenderConditions, fakeReceiverConditions],
    });

    expect(result).toEqual(expect.objectContaining({ ticker }));
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        ticker,
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.AddComplianceRequirement],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
