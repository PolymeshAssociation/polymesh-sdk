import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareModifyComplianceRequirement,
} from '~/api/procedures/modifyComplianceRequirement';
import { BaseAsset, Context } from '~/internal';
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
  let stringToAssetIdSpy: jest.SpyInstance<PolymeshPrimitivesAssetAssetID, [string, Context]>;
  let requirementToComplianceRequirementSpy: jest.SpyInstance<
    PolymeshPrimitivesComplianceManagerComplianceRequirement,
    [InputRequirement, Context]
  >;
  let assetId: string;
  let asset: BaseAsset;
  let conditions: Condition[];
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let args: Params;
  let modifyComplianceRequirementTransaction: PolymeshTx<[PolymeshPrimitivesAssetAssetID]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
    requirementToComplianceRequirementSpy = jest.spyOn(
      utilsConversionModule,
      'requirementToComplianceRequirement'
    );
    assetId = '0x1234';
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

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });

    modifyComplianceRequirementTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'changeComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(stringToAssetIdSpy).calledWith(assetId, mockContext).mockReturnValue(rawAssetId);

    asset = entityMockUtils.getBaseAssetInstance({
      assetId,
      complianceRequirementsGet: {
        requirements: [
          {
            conditions,
            id: new BigNumber(1),
          },
        ],
        defaultTrustedClaimIssuers: [],
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
      asset,
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
      asset,
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
      asset,
      id: new BigNumber(1),
      conditions: fakeConditions,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyComplianceRequirement.call(proc, args);

    expect(result).toEqual({
      transaction: modifyComplianceRequirementTransaction,
      args: [rawAssetId, rawComplianceRequirement],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        asset,
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ChangeComplianceRequirement],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
