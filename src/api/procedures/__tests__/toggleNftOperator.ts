import { bool } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';

import {
  getAuthorization,
  Params,
  prepareToggleNftOperator,
} from '~/api/procedures/toggleNftOperator';
import { Context, NftCollection, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('toggleNftOperator procedure', () => {
  const signerAddress = 'signerAddress';
  const operator = 'operatorAddress';

  let mockContext: Mocked<Context>;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawOperator: AccountId;
  let rawTrue: bool;
  let rawFalse: bool;

  const buildCollection = (opts: { exists?: boolean; isApproved?: boolean }): NftCollection => {
    const collection = entityMockUtils.getNftCollectionInstance({
      exists: opts.exists ?? true,
    }) as unknown as NftCollection & { isOperatorApproved: jest.Mock };
    collection.isOperatorApproved = jest.fn().mockResolvedValue(opts.isApproved ?? false);

    return collection;
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    rawAssetId = dsMockUtils.createMockAssetId('0x12341234123412341234123412341234');
    rawOperator = dsMockUtils.createMockAccountId(operator);
    rawTrue = dsMockUtils.createMockBool(true);
    rawFalse = dsMockUtils.createMockBool(false);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({ signingAddress: signerAddress });
    dsMockUtils.createTxMock('nft', 'setApprovalForAll');

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawOperator);
    jest
      .spyOn(utilsConversionModule, 'booleanToBool')
      .mockImplementation(value => (value ? rawTrue : rawFalse));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return a transaction spec approving the operator', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareToggleNftOperator.call(proc, {
      collection: buildCollection({}),
      operator,
      approve: true,
    });

    expect(result).toEqual({
      transaction: mockContext.polymeshApi.tx.nft.setApprovalForAll,
      args: [rawAssetId, rawOperator, rawTrue],
      resolver: undefined,
    });
  });

  it('should return a transaction spec revoking the operator', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareToggleNftOperator.call(proc, {
      collection: buildCollection({ isApproved: true }),
      operator,
      approve: false,
    });

    expect(result.args).toEqual([rawAssetId, rawOperator, rawFalse]);
  });

  it('should throw if nothing would change', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await expect(
      prepareToggleNftOperator.call(proc, {
        collection: buildCollection({ isApproved: true }),
        operator,
        approve: true,
      })
    ).rejects.toThrow(
      new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The operator is already approved',
      })
    );

    await expect(
      prepareToggleNftOperator.call(proc, {
        collection: buildCollection({}),
        operator,
        approve: false,
      })
    ).rejects.toThrow('The operator is not approved');
  });

  it('should throw if the operator is the signing Account', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleNftOperator.call(proc, {
        collection: buildCollection({}),
        operator: signerAddress,
        approve: true,
      })
    ).rejects.toThrow('An Account cannot be its own operator');
  });

  it('should throw if the collection does not exist', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleNftOperator.call(proc, {
        collection: buildCollection({ exists: false }),
        operator,
        approve: true,
      })
    ).rejects.toThrow("The NFT collection doesn't exist");
  });

  it('should throw NotSupported on a chain without NFT approvals', () => {
    dsMockUtils.reset();
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('nft', 'issueNft');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleNftOperator.call(proc, {
        collection: buildCollection({}),
        operator,
        approve: true,
      })
    ).rejects.toThrow(expect.objectContaining({ code: ErrorCode.NotSupported }));
  });

  describe('getAuthorization', () => {
    it('should require only the extrinsic permission', () => {
      expect(getAuthorization()).toEqual({
        permissions: {
          transactions: [TxTags.nft.SetApprovalForAll],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
