import { Vec } from '@polkadot/types';
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
  prepareSetAssetRequirements,
} from '~/api/procedures/setAssetRequirements';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, Requirement } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('setAssetRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let requirementToComplianceRequirementStub: sinon.SinonStub<
    [Requirement, Context],
    ComplianceRequirement
  >;
  let complianceRequirementToRequirementStub: sinon.SinonStub<
    [ComplianceRequirement, Context],
    Requirement
  >;
  let assetCompliancesStub: sinon.SinonStub;
  let ticker: string;
  let requirements: Condition[][];
  let rawTicker: Ticker;
  let senderConditions: MeshCondition[][];
  let receiverConditions: MeshCondition[][];
  let rawComplianceRequirements: ComplianceRequirement[];
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
    complianceRequirementToRequirementStub = sinon.stub(
      utilsConversionModule,
      'complianceRequirementToRequirement'
    );
    ticker = 'someTicker';
    requirements = ([
      ['condition0', 'condition1'],
      ['condition1', 'condition2', 'condition3'],
      ['condition4'],
    ] as unknown) as Condition[][];
    senderConditions = [
      ('senderConditions0' as unknown) as MeshCondition[],
      ('senderConditions1' as unknown) as MeshCondition[],
      ('senderConditions2' as unknown) as MeshCondition[],
    ];
    receiverConditions = [
      ('receiverConditions0' as unknown) as MeshCondition[],
      ('receiverConditions1' as unknown) as MeshCondition[],
      ('receiverConditions2' as unknown) as MeshCondition[],
    ];
    rawComplianceRequirements = senderConditions.map((sConditions, index) =>
      dsMockUtils.createMockComplianceRequirement({
        /* eslint-disable @typescript-eslint/naming-convention */
        sender_conditions: sConditions,
        receiver_conditions: receiverConditions[index],
        id: dsMockUtils.createMockU32(index),
        /* eslint-enable @typescript-eslint/naming-convention */
      })
    );
    rawTicker = dsMockUtils.createMockTicker(ticker);
    /* eslint-enable @typescript-eslint/naming-convention */
    args = {
      ticker,
      requirements,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let resetAssetComplianceTransaction: PolymeshTx<[Ticker]>;
  let replaceComplianceRequirementTransaction: PolymeshTx<Vec<ComplianceRequirement>>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(50),
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    assetCompliancesStub = dsMockUtils.createQueryStub('complianceManager', 'assetCompliances', {
      returnValue: [],
    });

    resetAssetComplianceTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'resetAssetCompliance'
    );
    replaceComplianceRequirementTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'replaceAssetCompliance'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    requirements.forEach((condition, index) => {
      const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
        /* eslint-disable @typescript-eslint/naming-convention */
        sender_conditions: senderConditions[index],
        receiver_conditions: receiverConditions[index],
        id: dsMockUtils.createMockU32(index),
        /* eslint-enable @typescript-eslint/naming-convention */
      });
      requirementToComplianceRequirementStub
        .withArgs({ conditions: condition, id: index }, mockContext)
        .returns(complianceRequirement);
      complianceRequirementToRequirementStub
        .withArgs(
          sinon.match({
            /* eslint-disable @typescript-eslint/naming-convention */
            sender_conditions: senderConditions[index],
            receiver_conditions: receiverConditions[index],
            /* eslint-enable @typescript-eslint/naming-convention */
          }),
          mockContext
        )
        .returns({ conditions: condition, id: index });
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

  test('should throw an error if condition limit is reached', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareSetAssetRequirements.call(proc, {
        ticker,
        requirements: (new Array(50) as unknown) as Condition[][],
      })
    ).rejects.toThrow('Condition limit reached');
  });

  test('should throw an error if the new list is the same as the current one', () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: rawComplianceRequirements,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareSetAssetRequirements.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  test('should add a reset asset compliance transaction to the queue if the new requirements are empty', async () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: rawComplianceRequirements,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, { ...args, requirements: [] });

    sinon.assert.calledWith(addTransactionStub, resetAssetComplianceTransaction, {}, rawTicker);

    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should add a replace compliance requirement transactions to the queue', async () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: rawComplianceRequirements.slice(0, -1),
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      replaceComplianceRequirementTransaction,
      {},
      rawTicker
    );

    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        ticker,
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [
            TxTags.complianceManager.ResetAssetCompliance,
            TxTags.complianceManager.AddComplianceRequirement,
          ],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
