import { Vec } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesDocument } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareAddAssetDocuments,
} from '~/api/procedures/addAssetDocuments';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AssetDocument, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('addAssetDocuments procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetDocumentToDocumentSpy: jest.SpyInstance<
    PolymeshPrimitivesDocument,
    [AssetDocument, Context]
  >;
  let assetId: string;
  let asset: BaseAsset;
  let documents: AssetDocument[];
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawDocuments: PolymeshPrimitivesDocument[];
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
    assetDocumentToDocumentSpy = jest.spyOn(utilsConversionModule, 'assetDocumentToDocument');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    documents = [
      {
        name: 'someDocument',
        uri: 'someUri',
        contentHash: '0x01',
      },
      {
        name: 'otherDocument',
        uri: 'otherUri',
        contentHash: '0x02',
      },
    ];
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawDocuments = documents.map(({ name, uri, contentHash, type, filedAt }) =>
      dsMockUtils.createMockDocument({
        name: dsMockUtils.createMockBytes(name),
        uri: dsMockUtils.createMockBytes(uri),
        contentHash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash, true),
        }),
        docType: dsMockUtils.createMockOption(type ? dsMockUtils.createMockBytes(type) : null),
        filingDate: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime())) : null
        ),
      })
    );
    args = {
      asset,
      documents,
    };
  });

  let addDocumentsTransaction: PolymeshTx<
    [Vec<PolymeshPrimitivesDocument>, PolymeshPrimitivesAssetAssetId]
  >;

  beforeEach(() => {
    addDocumentsTransaction = dsMockUtils.createTxMock('asset', 'addDocuments');

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    documents.forEach((doc, index) => {
      when(assetDocumentToDocumentSpy)
        .calledWith(doc, mockContext)
        .mockReturnValue(rawDocuments[index]!);
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

  it('should throw an error if the documents list is empty', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    expect(() => prepareAddAssetDocuments.call(proc, { ...args, documents: [] })).toThrow(
      'The documents list cannot be empty'
    );
  });

  it('should add an add documents transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareAddAssetDocuments.call(proc, args);

    expect(result).toEqual({
      transaction: addDocumentsTransaction,
      feeMultiplier: new BigNumber(rawDocuments.length),
      args: [rawDocuments, rawAssetId],
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
          transactions: [TxTags.asset.AddDocuments],
          portfolios: [],
        },
      });
    });
  });
});
