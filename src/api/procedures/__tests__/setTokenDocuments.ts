import { Vec } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Document, DocumentId, Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareSetTokenDocuments,
  prepareStorage,
  Storage,
} from '~/api/procedures/setTokenDocuments';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TokenDocument } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('setTokenDocuments procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let tokenDocumentToDocumentStub: sinon.SinonStub<[TokenDocument, Context], Document>;
  let ticker: string;
  let documents: TokenDocument[];
  let rawTicker: Ticker;
  let rawDocuments: Document[];
  let documentEntries: [[Ticker, DocumentId], Document][];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: { free: new BigNumber(500), locked: new BigNumber(0), total: new BigNumber(500) },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    tokenDocumentToDocumentStub = sinon.stub(utilsConversionModule, 'tokenDocumentToDocument');
    ticker = 'someTicker';
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
        name: dsMockUtils.createMockDocumentName(name),
        uri: dsMockUtils.createMockDocumentUri(uri),
        /* eslint-disable @typescript-eslint/naming-convention */
        content_hash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash, true),
        }),
        doc_type: dsMockUtils.createMockOption(
          type ? dsMockUtils.createMockDocumentType(type) : null
        ),
        filing_date: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(filedAt.getTime()) : null
        ),
        /* eslint-enabled @typescript-eslint/naming-convention */
      })
    );
    documentEntries = rawDocuments.map((doc, index) =>
      tuple([rawTicker, dsMockUtils.createMockU32(index)], doc)
    );
    args = {
      ticker,
      documents,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let removeDocumentsTransaction: PolymeshTx<[Vec<DocumentId>, Ticker]>;
  let addDocumentsTransaction: PolymeshTx<[Vec<Document>, Ticker]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    dsMockUtils.createQueryStub('asset', 'assetDocuments', {
      entries: [documentEntries[0]],
    });

    removeDocumentsTransaction = dsMockUtils.createTxStub('asset', 'removeDocuments');
    addDocumentsTransaction = dsMockUtils.createTxStub('asset', 'addDocuments');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    documents.forEach((doc, index) => {
      tokenDocumentToDocumentStub.withArgs(doc, mockContext).returns(rawDocuments[index]);
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the new list is the same as the current one', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      currentDocs: documents,
      currentDocIds: [],
    });

    return expect(prepareSetTokenDocuments.call(proc, args)).rejects.toThrow(
      'The supplied document list is equal to the current one'
    );
  });

  test('should add a remove documents transaction and an add documents transaction to the queue', async () => {
    const docIds = [documentEntries[0][0][1]];
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      currentDocIds: docIds,
      currentDocs: [],
    });

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(addTransactionStub.firstCall, {
      transaction: removeDocumentsTransaction,
      feeMultiplier: 1,
      args: [docIds, rawTicker],
    });
    sinon.assert.calledWith(addTransactionStub.secondCall, {
      transaction: addDocumentsTransaction,
      feeMultiplier: rawDocuments.length,
      args: [rawDocuments, rawTicker],
    });
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should not add a remove documents transaction if there are no documents linked to the token', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      currentDocIds: [],
      currentDocs: [],
    });

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(addTransactionStub.firstCall, {
      transaction: addDocumentsTransaction,
      feeMultiplier: rawDocuments.length,
      args: [rawDocuments, rawTicker],
    });
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should not add an add documents transaction if there are no documents passed as arguments', async () => {
    const docIds = [documentEntries[0][0][1]];
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      currentDocs: [documents[0]],
      currentDocIds: docIds,
    });

    const result = await prepareSetTokenDocuments.call(proc, { ...args, documents: [] });

    sinon.assert.calledWith(addTransactionStub.firstCall, {
      transaction: removeDocumentsTransaction,
      feeMultiplier: 1,
      args: [docIds, rawTicker],
    });
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        currentDocIds: [documentEntries[0][0][1]],
        currentDocs: [],
      });
      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          transactions: [TxTags.asset.AddDocuments, TxTags.asset.RemoveDocuments],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        currentDocIds: [],
        currentDocs: [],
      });
      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...args, documents: [] })).toEqual({
        permissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          transactions: [],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the current documents and their ids', async () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      dsMockUtils.createQueryStub('asset', 'assetDocuments', {
        entries: documentEntries,
      });

      const result = await boundFunc(args);

      expect(result).toEqual({
        currentDocs: documents,
        currentDocIds: documentEntries.map(([[, id]]) => id),
      });
    });
  });
});
