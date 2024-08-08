import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { AssetDocument } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsInternalModule from '~/utils/internal';

import { Documents } from '../../Base/Documents';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Documents class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Documents.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const documents = new Documents(asset, context);

      const args = {
        documents: [
          {
            name: 'someName',
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await documents.set(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve all documents linked to the Asset', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance();
      dsMockUtils.createQueryMock('asset', 'assetDocuments');
      const requestPaginatedSpy = jest.spyOn(utilsInternalModule, 'requestPaginated');

      const expectedDocuments: AssetDocument[] = [
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
      const entries = expectedDocuments.map(({ name, uri, contentHash, type, filedAt }, index) =>
        tuple(
          {
            args: [
              dsMockUtils.createMockAssetId(asset.id),
              dsMockUtils.createMockU32(new BigNumber(index)),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockOption(
            dsMockUtils.createMockDocument({
              uri: dsMockUtils.createMockBytes(uri),
              name: dsMockUtils.createMockBytes(name),
              contentHash: dsMockUtils.createMockDocumentHash({
                H128: dsMockUtils.createMockU8aFixed(contentHash, true),
              }),
              docType: dsMockUtils.createMockOption(
                type ? dsMockUtils.createMockBytes(type) : null
              ),
              filingDate: dsMockUtils.createMockOption(
                filedAt ? dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime())) : null
              ),
            })
          )
        )
      );

      requestPaginatedSpy.mockResolvedValue({ entries, lastKey: null });

      const context = dsMockUtils.getContextInstance();
      const documents = new Documents(asset, context);
      const result = await documents.get();

      expect(result).toEqual({ data: expectedDocuments, next: null });
    });
  });
});
