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
  prepareRemoveAssetRequirement,
} from '~/api/procedures/removeAssetRequirement';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('removeAssetRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let requirement: number;
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
    ticker = 'someTicker';
    requirement = 2;

    args = {
      ticker,
      requirement,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let removeComplianceRequirementTransaction: PolymeshTx<[Ticker]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(50),
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    removeComplianceRequirementTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'removeComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);

    senderConditions = [
      ('senderConditions0' as unknown) as MeshCondition[],
      ('senderConditions1' as unknown) as MeshCondition[],
    ];
    receiverConditions = [
      ('receiverConditions0' as unknown) as MeshCondition[],
      ('receiverConditions1' as unknown) as MeshCondition[],
    ];
    rawComplianceRequirement = senderConditions.map(
      (sConditions, index) =>
        ({
          /* eslint-disable @typescript-eslint/naming-convention */
          sender_conditions: sConditions,
          receiver_conditions: receiverConditions[index],
          /* eslint-enable @typescript-eslint/naming-convention */
          id: dsMockUtils.createMockU32(index),
        } as ComplianceRequirement)
    );

    dsMockUtils.createQueryStub('complianceManager', 'assetCompliances', {
      returnValue: {
        requirements: rawComplianceRequirement,
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

  test('should throw an error if the supplied id is not present in the current requirements', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
    const complianceRequirementId = 1;

    return expect(
      prepareRemoveAssetRequirement.call(proc, {
        ...args,
        requirement: { id: complianceRequirementId, conditions: [] },
      })
    ).rejects.toThrow(`There is no compliance requirement with id "${complianceRequirementId}"`);
  });

  test('should add a remove compliance requirement transaction to the queue', async () => {
    const rawId = dsMockUtils.createMockU32(requirement);
    sinon.stub(utilsConversionModule, 'numberToU32').returns(rawId);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareRemoveAssetRequirement.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: removeComplianceRequirementTransaction,
      args: [rawTicker, rawId],
    });

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
          transactions: [TxTags.complianceManager.RemoveComplianceRequirement],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
