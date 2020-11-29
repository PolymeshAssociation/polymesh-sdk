import { Vec } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Document, DocumentId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getRequiredRoles,
  Params,
  prepareSetTokenDocuments,
} from '~/api/procedures/setTokenDocuments';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TokenDocument } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

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
      contextOptions: { balance: { free: new BigNumber(500), locked: new BigNumber(0) } },
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
        contentHash: 'someHash',
      },
      {
        name: 'otherDocument',
        uri: 'otherUri',
        contentHash: 'otherHash',
      },
    ];
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawDocuments = documents.map(({ name, uri, contentHash, type, filedAt }) =>
      dsMockUtils.createMockDocument({
        name: dsMockUtils.createMockDocumentName(name),
        uri: dsMockUtils.createMockDocumentUri(uri),
        /* eslint-disable @typescript-eslint/camelcase */
        content_hash: dsMockUtils.createMockDocumentHash(contentHash),
        doc_type: dsMockUtils.createMockOption(
          type ? dsMockUtils.createMockDocumentType(type) : null
        ),
        filing_date: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(filedAt.getTime()) : null
        ),
        /* eslint-enabled @typescript-eslint/camelcase */
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
    dsMockUtils.createQueryStub('asset', 'assetDocuments', { entries: documentEntries });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareSetTokenDocuments.call(proc, args)).rejects.toThrow(
      'The supplied document list is equal to the current one'
    );
  });

  test('should add a remove documents transaction and an add documents transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDocumentsTransaction,
      { batchSize: 1 },
      [documentEntries[0][0][1]],
      rawTicker
    );
    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      addDocumentsTransaction,
      { batchSize: rawDocuments.length },
      rawDocuments,
      rawTicker
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove documents transaction if there are no documents linked to the token', async () => {
    dsMockUtils.createQueryStub('asset', 'assetDocuments', {
      entries: [],
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      addDocumentsTransaction,
      { batchSize: rawDocuments.length },
      rawDocuments,
      rawTicker
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add an add documents transaction if there are no documents passed as arguments', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenDocuments.call(proc, { ...args, documents: [] });

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDocumentsTransaction,
      { batchSize: 1 },
      [documentEntries[0][0][1]],
      rawTicker
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
