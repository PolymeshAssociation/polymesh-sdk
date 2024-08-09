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
  prepareRemoveAssetRequirement,
} from '~/api/procedures/removeAssetRequirement';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('removeAssetRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: BaseAsset;
  let requirement: BigNumber;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let senderConditions: PolymeshPrimitivesCondition[][];
  let receiverConditions: PolymeshPrimitivesCondition[][];
  let rawComplianceRequirement: PolymeshPrimitivesComplianceManagerComplianceRequirement[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetId = '0x1234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });

    requirement = new BigNumber(1);

    args = {
      asset,
      requirement,
    };
  });

  let removeComplianceRequirementTransaction: PolymeshTx<[PolymeshPrimitivesAssetAssetID]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });

    removeComplianceRequirementTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'removeComplianceRequirement'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);

    senderConditions = [
      'senderConditions0' as unknown as PolymeshPrimitivesCondition[],
      'senderConditions1' as unknown as PolymeshPrimitivesCondition[],
    ];
    receiverConditions = [
      'receiverConditions0' as unknown as PolymeshPrimitivesCondition[],
      'receiverConditions1' as unknown as PolymeshPrimitivesCondition[],
    ];
    rawComplianceRequirement = senderConditions.map(
      (sConditions, index) =>
        ({
          /* eslint-disable @typescript-eslint/naming-convention */
          sender_conditions: sConditions,
          receiver_conditions: receiverConditions[index],
          /* eslint-enable @typescript-eslint/naming-convention */
          id: dsMockUtils.createMockU32(new BigNumber(index)),
        } as unknown as PolymeshPrimitivesComplianceManagerComplianceRequirement)
    );

    dsMockUtils.createQueryMock('complianceManager', 'assetCompliances', {
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the supplied id is not present in the current requirements', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const complianceRequirementId = new BigNumber(10);

    return expect(
      prepareRemoveAssetRequirement.call(proc, {
        ...args,
        requirement: { id: complianceRequirementId, conditions: [] },
      })
    ).rejects.toThrow(`There is no compliance requirement with id "${complianceRequirementId}"`);
  });

  it('should return a remove compliance requirement transaction spec', async () => {
    const rawId = dsMockUtils.createMockU32(requirement);
    jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockClear().mockReturnValue(rawId);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareRemoveAssetRequirement.call(proc, args);

    expect(result).toEqual({
      transaction: removeComplianceRequirementTransaction,
      args: [rawAssetId, rawId],
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
          transactions: [TxTags.complianceManager.RemoveComplianceRequirement],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
