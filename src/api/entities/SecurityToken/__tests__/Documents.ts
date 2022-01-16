import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Namespace, SecurityToken, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TokenDocument } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsInternalModule from '~/utils/internal';

import { Documents } from '../Documents';

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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Documents.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const documents = new Documents(token, context);

      const args = {
        documents: [
          {
            name: 'someName',
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: token.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await documents.set(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all documents linked to the token', async () => {
      const token = entityMockUtils.getSecurityTokenInstance();
      dsMockUtils.createQueryStub('asset', 'assetDocuments');
      const requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');

      const expectedDocuments: TokenDocument[] = [
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
          ({
            args: [
              dsMockUtils.createMockTicker(token.ticker),
              dsMockUtils.createMockU32(new BigNumber(index)),
            ],
          } as unknown) as StorageKey,
          dsMockUtils.createMockDocument({
            uri: dsMockUtils.createMockDocumentUri(uri),
            name: dsMockUtils.createMockDocumentName(name),
            /* eslint-disable @typescript-eslint/naming-convention */
            content_hash: dsMockUtils.createMockDocumentHash({
              H128: dsMockUtils.createMockU8aFixed(contentHash, true),
            }),
            doc_type: dsMockUtils.createMockOption(
              type ? dsMockUtils.createMockDocumentType(type) : null
            ),
            filing_date: dsMockUtils.createMockOption(
              filedAt ? dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime())) : null
            ),
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        )
      );

      requestPaginatedStub.resolves({ entries, lastKey: null });

      const context = dsMockUtils.getContextInstance();
      const documents = new Documents(token, context);
      const result = await documents.get();

      expect(result).toEqual({ data: expectedDocuments, next: null });
    });
  });
});
