import {
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareModifyComplianceRequirement,
} from '~/api/procedures/modifyComplianceRequirement';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, ConditionTarget, ConditionType, InputRequirement, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyComplianceRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let requirementToComplianceRequirementSpy: jest.SpyInstance<
    PolymeshPrimitivesComplianceManagerComplianceRequirement,
    [InputRequirement, Context]
  >;
  let ticker: string;
  let conditions: Condition[];
  let rawTicker: PolymeshPrimitivesTicker;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    requirementToComplianceRequirementSpy = jest.spyOn(
      utilsConversionModule,
      'requirementToComplianceRequirement'
    );
    ticker = 'SOME_TICKER';
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

  let modifyComplianceRequirementTransaction: PolymeshTx<[PolymeshPrimitivesTicker]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });

    modifyComplianceRequirementTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'changeComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);

    entityMockUtils.configureMocks({
      fungibleAssetOptions: {
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

  it('should throw an error if the supplied requirement id does not belong to the Asset', () => {
    const fakeConditions = ['condition'] as unknown as Condition[];
    args = {
      ticker,
      id: new BigNumber(2),
      conditions: fakeConditions,
    };
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyComplianceRequirement.call(proc, args)).rejects.toThrow(
      'The Compliance Requirement does not exist'
    );
  });

  it('should throw an error if the supplied requirement conditions have no change', () => {
    args = {
      ticker,
      id: new BigNumber(1),
      conditions,
    };
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyComplianceRequirement.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  it('should return a modify compliance requirement transaction spec', async () => {
    const fakeConditions = [{ claim: '' }] as unknown as Condition[];
    const fakeSenderConditions = 'senderConditions' as unknown as PolymeshPrimitivesCondition[];
    const fakeReceiverConditions = 'receiverConditions' as unknown as PolymeshPrimitivesCondition[];

    const rawComplianceRequirement = dsMockUtils.createMockComplianceRequirement({
      senderConditions: fakeSenderConditions,
      receiverConditions: fakeReceiverConditions,
      id: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    when(requirementToComplianceRequirementSpy)
      .calledWith({ conditions: fakeConditions, id: new BigNumber(1) }, mockContext)
      .mockReturnValue(rawComplianceRequirement);

    args = {
      ticker,
      id: new BigNumber(1),
      conditions: fakeConditions,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyComplianceRequirement.call(proc, args);

    expect(result).toEqual({
      transaction: modifyComplianceRequirementTransaction,
      args: [rawTicker, rawComplianceRequirement],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        ticker,
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ChangeComplianceRequirement],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
