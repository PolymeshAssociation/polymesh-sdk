import { u32, Vec } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRemoveAssetDocuments,
} from '~/api/procedures/removeAssetDocuments';
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

describe('removeAssetDocuments procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToU32Spy: jest.SpyInstance<u32, [BigNumber, Context]>;
  let assetId: string;
  let asset: BaseAsset;
  let documentIds: BigNumber[];
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawDocumentIds: u32[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(500),
          locked: new BigNumber(0),
          total: new BigNumber(500),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    documentIds = [new BigNumber(1), new BigNumber(2), new BigNumber(3)];
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawDocumentIds = [];
    args = {
      asset,
      documentIds,
    };
  });

  let removeDocumentsTransaction: PolymeshTx<[Vec<u32>, PolymeshPrimitivesAssetAssetId]>;

  beforeEach(() => {
    removeDocumentsTransaction = dsMockUtils.createTxMock('asset', 'removeDocuments');

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    documentIds.forEach((id, index) => {
      rawDocumentIds[index] = dsMockUtils.createMockU32(id);
      when(bigNumberToU32Spy).calledWith(id, mockContext).mockReturnValue(rawDocumentIds[index]);
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

  it('should throw an error if the document IDs list is empty', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    expect(() => prepareRemoveAssetDocuments.call(proc, { ...args, documentIds: [] })).toThrow(
      'The document IDs list cannot be empty'
    );
  });

  it('should add a remove documents transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareRemoveAssetDocuments.call(proc, args);

    expect(result).toEqual({
      transaction: removeDocumentsTransaction,
      feeMultiplier: new BigNumber(rawDocumentIds.length),
      args: [rawDocumentIds, rawAssetId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.asset.RemoveDocuments],
          portfolios: [],
        },
      });
    });
  });
});
