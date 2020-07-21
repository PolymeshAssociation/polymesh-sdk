import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setTokenDocuments } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { Documents } from '../Documents';

describe('Documents class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
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

      sinon
        .stub(setTokenDocuments, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
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
      sinon.stub(utilsModule, 'signerToSignatory');

      const expectedDocuments = [
        {
          name: 'someDocument',
          uri: 'someUri',
          contentHash: 'someHash',
        },
        {
          name: 'otherDocument',
          uri: 'otherUri',
          contentHash: 'otherHash',
        },
      ];
      const rawDocuments = expectedDocuments.map(({ name, uri, contentHash }) =>
        dsMockUtils.createMockDocument({
          name: dsMockUtils.createMockDocumentName(name),
          uri: dsMockUtils.createMockDocumentUri(uri),
          // eslint-disable-next-line @typescript-eslint/camelcase
          content_hash: dsMockUtils.createMockDocumentHash(contentHash),
        })
      );

      const signatory = dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId('tokenDid'),
      });
      const ids = [dsMockUtils.createMockU64(1), dsMockUtils.createMockU64(2)];
      /* eslint-disable @typescript-eslint/camelcase */
      const linkEntries = [
        tuple(
          [signatory, ids[0]],
          dsMockUtils.createMockLink({
            link_data: dsMockUtils.createMockLinkData({
              DocumentOwned: rawDocuments[0],
            }),
            expiry: dsMockUtils.createMockOption(),
            link_id: ids[0],
          })
        ),
        tuple(
          [signatory, ids[1]],
          dsMockUtils.createMockLink({
            link_data: dsMockUtils.createMockLinkData({
              DocumentOwned: rawDocuments[1],
            }),
            expiry: dsMockUtils.createMockOption(),
            link_id: ids[1],
          })
        ),
      ];
      /* eslint-enable @typescript-eslint/camelcase */
      dsMockUtils.createQueryStub('identity', 'links', {
        entries: linkEntries,
      });

      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const documents = new Documents(token, context);
      const result = await documents.get();

      expect(result).toEqual(expectedDocuments);
    });
  });
});
