import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareAddAssetRequirement,
} from '~/api/procedures/addAssetRequirement';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, ConditionTarget, ConditionType, InputRequirement, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('addAssetRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAssetIdSpy: jest.SpyInstance<PolymeshPrimitivesAssetAssetId, [string, Context]>;
  let requirementToComplianceRequirementSpy: jest.SpyInstance<
    Promise<PolymeshPrimitivesComplianceManagerComplianceRequirement>,
    [InputRequirement, Context]
  >;
  let assetId: string;
  let asset: BaseAsset;
  let conditions: Condition[];
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let args: Params;

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
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
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
      asset,
      conditions,
    };
  });

  let addComplianceRequirementTransaction: PolymeshTx<[PolymeshPrimitivesAssetAssetId]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });

    addComplianceRequirementTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'addComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(stringToAssetIdSpy).calledWith(assetId, mockContext).mockReturnValue(rawAssetId);
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
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareAddAssetRequirement.call(proc, {
        ...args,
        asset: entityMockUtils.getBaseAssetInstance({
          complianceRequirementsGet: {
            requirements: [
              {
                conditions,
                id: new BigNumber(1),
              },
            ],
            defaultTrustedClaimIssuers: [],
          },
          assetId,
        }),
      })
    ).rejects.toThrow('There already exists a Requirement with the same conditions for this Asset');
  });

  it('should return an add compliance requirement transaction spec', async () => {
    const fakeConditions = ['condition'] as unknown as Condition[];
    const fakeSenderConditions = 'senderConditions' as unknown as PolymeshPrimitivesCondition[];
    const fakeReceiverConditions = 'receiverConditions' as unknown as PolymeshPrimitivesCondition[];

    when(requirementToComplianceRequirementSpy)
      .calledWith({ conditions: fakeConditions, id: new BigNumber(1) }, mockContext)
      .mockResolvedValue(
        dsMockUtils.createMockComplianceRequirement({
          senderConditions: fakeSenderConditions,
          receiverConditions: fakeReceiverConditions,
          id: dsMockUtils.createMockU32(new BigNumber(1)),
        })
      );

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareAddAssetRequirement.call(proc, {
      ...args,
      conditions: fakeConditions,
    });

    expect(result).toEqual({
      transaction: addComplianceRequirementTransaction,
      args: [rawAssetId, fakeSenderConditions, fakeReceiverConditions],
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
          transactions: [TxTags.complianceManager.AddComplianceRequirement],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
