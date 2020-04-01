import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setTokenDocuments } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import * as utilsModule from '~/utils';

import { Documents } from '../Documents';

describe('Documents class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Documents.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
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
        polkadotMockUtils.createMockDocument({
          name: polkadotMockUtils.createMockDocumentName(name),
          uri: polkadotMockUtils.createMockDocumentUri(uri),
          // eslint-disable-next-line @typescript-eslint/camelcase
          content_hash: polkadotMockUtils.createMockDocumentHash(contentHash),
        })
      );
      /* eslint-disable @typescript-eslint/camelcase */
      const links = [
        polkadotMockUtils.createMockLink({
          link_data: polkadotMockUtils.createMockLinkData({
            documentOwned: rawDocuments[0],
          }),
          expiry: polkadotMockUtils.createMockOption(),
          link_id: polkadotMockUtils.createMockU64(1),
        }),
        polkadotMockUtils.createMockLink({
          link_data: polkadotMockUtils.createMockLinkData({
            documentOwned: rawDocuments[1],
          }),
          expiry: polkadotMockUtils.createMockOption(),
          link_id: polkadotMockUtils.createMockU64(2),
        }),
      ];
      /* eslint-enable @typescript-eslint/camelcase */
      polkadotMockUtils.createQueryStub('identity', 'links', {
        entries: links,
      });

      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const documents = new Documents(token, context);
      const result = await documents.get();

      expect(result).toEqual(expectedDocuments);
    });
  });
});
