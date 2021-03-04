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
import { Condition, Requirement, RoleType } from '~/types';
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
  let rawComplianceRequirement: ComplianceRequirement[];
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
    rawComplianceRequirement = senderConditions.map(
      (sConditions, index) =>
        ({
          /* eslint-disable @typescript-eslint/camelcase */
          sender_conditions: sConditions,
          receiver_conditions: receiverConditions[index],
          /* eslint-enable @typescript-eslint/camelcase */
        } as ComplianceRequirement)
    );
    rawTicker = dsMockUtils.createMockTicker(ticker);
    /* eslint-enable @typescript-eslint/camelcase */
    args = {
      ticker,
      requirements,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let resetAssetComplianceTransaction: PolymeshTx<[Ticker]>;
  let addComplianceRequirementTransaction: PolymeshTx<
    [Ticker, Vec<MeshCondition>, Vec<MeshCondition>]
  >;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    assetCompliancesStub = dsMockUtils.createQueryStub('complianceManager', 'assetCompliances', {
      returnValue: [],
    });

    resetAssetComplianceTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'resetAssetCompliance'
    );
    addComplianceRequirementTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'addComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    requirements.forEach((condition, index) => {
      const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
        /* eslint-disable @typescript-eslint/camelcase */
        sender_conditions: senderConditions[index],
        receiver_conditions: receiverConditions[index],
        id: dsMockUtils.createMockU32(1),
        /* eslint-enable @typescript-eslint/camelcase */
      });
      requirementToComplianceRequirementStub
        .withArgs({ conditions: condition, id: 1 }, mockContext)
        .returns(complianceRequirement);
      complianceRequirementToRequirementStub
        .withArgs(
          sinon.match({
            /* eslint-disable @typescript-eslint/camelcase */
            sender_conditions: senderConditions[index],
            receiver_conditions: receiverConditions[index],
            /* eslint-enable @typescript-eslint/camelcase */
          }),
          mockContext
        )
        .returns({ conditions: condition, id: 1 });
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

  test('should throw an error if compliance requirements conditions limit is reached', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareSetAssetRequirements.call(proc, {
        ticker,
        requirements: (new Array(50) as unknown) as Condition[][],
      })
    ).rejects.toThrow('Compliance Requirements Conditions limit reached');
  });

  test('should throw an error if the new list is the same as the current one', () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: rawComplianceRequirement,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareSetAssetRequirements.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  test('should add a reset asset compliance transaction and add compliance requirement transactions to the queue', async () => {
    const currentComplianceRequirement = rawComplianceRequirement.slice(0, -1);
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: currentComplianceRequirement,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      resetAssetComplianceTransaction,
      {},
      rawTicker
    );
    senderConditions.forEach((sConditions, index) => {
      sinon.assert.calledWith(
        addTransactionStub.getCall(index + 1),
        addComplianceRequirementTransaction,
        {},
        rawTicker,
        sConditions,
        receiverConditions[index]
      );
    });

    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token', async () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: [],
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, args);

    senderConditions.forEach((sConditions, index) => {
      sinon.assert.calledWith(
        addTransactionStub.getCall(index),
        addComplianceRequirementTransaction,
        {},
        rawTicker,
        sConditions,
        receiverConditions[index]
      );
    });
    sinon.assert.callCount(addTransactionStub, senderConditions.length);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should not add an asset compliance transactions if there are no claim issuers passed as arguments', async () => {
    const currentComplianceRequirement = rawComplianceRequirement;
    assetCompliancesStub.withArgs(rawTicker).returns({
      requirements: currentComplianceRequirement,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, { ...args, requirements: [] });

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      resetAssetComplianceTransaction,
      {},
      rawTicker
    );
    sinon.assert.calledOnce(addTransactionStub);
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
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
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
