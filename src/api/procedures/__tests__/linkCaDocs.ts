import { Vec } from '@polkadot/types';
import { PalletCorporateActionsCaId, PolymeshPrimitivesDocument } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { Document, DocumentId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareLinkCaDocs } from '~/api/procedures/linkCaDocs';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AssetDocument, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('linkCaDocs procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let id: BigNumber;
  let documents: AssetDocument[];
  let rawTicker: Ticker;
  let rawDocuments: PolymeshPrimitivesDocument[];
  let rawDocumentIds: DocumentId[];
  let documentEntries: [[Ticker, DocumentId], PolymeshPrimitivesDocument][];
  let args: Params;
  let rawCaId: PalletCorporateActionsCaId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'someTicker';
    id = new BigNumber(1);
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
    rawTicker = dsMockUtils.createMockTicker(ticker);
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
    documentEntries = [];
    rawDocumentIds = [];
    rawDocuments.forEach((doc, index) => {
      const rawId = dsMockUtils.createMockU32(new BigNumber(index));
      documentEntries.push(tuple([rawTicker, rawId], doc));
      rawDocumentIds.push(rawId);
    });
    args = {
      id,
      ticker,
      documents,
    };
    rawCaId = dsMockUtils.createMockCAId({ ticker, localId: id });
    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
  });

  let addTransactionStub: sinon.SinonStub;
  let linkCaDocTransaction: PolymeshTx<[Vec<Document>, Ticker]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    dsMockUtils.createQueryStub('asset', 'assetDocuments', {
      entries: [documentEntries[0], documentEntries[1]],
    });

    linkCaDocTransaction = dsMockUtils.createTxStub('corporateAction', 'linkCaDoc');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
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

  it('should throw an error if some of the provided documents are not associated to the Asset', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const name = 'customName';

    let error;

    try {
      await prepareLinkCaDocs.call(proc, {
        id,
        ticker,
        documents: [
          documents[0],
          {
            name,
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the provided documents are not associated with the Asset');
    expect(error.data.documents.length).toEqual(1);
    expect(error.data.documents[0].name).toEqual(name);
  });

  it('should add a link ca doc transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareLinkCaDocs.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: linkCaDocTransaction,
      args: [rawCaId, rawDocumentIds],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.corporateAction.LinkCaDoc],
          portfolios: [],
        },
      });
    });
  });
});
