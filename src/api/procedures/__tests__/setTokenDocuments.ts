import { Vec } from '@polkadot/types';
import { ITuple } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Document, DocumentName, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareSetTokenDocuments,
} from '~/api/procedures/setTokenDocuments';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TokenDocument } from '~/types';
import { PolymeshTx, TokenDocumentData } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

describe('setTokenDocuments procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let tokenDocumentDataToDocumentStub: sinon.SinonStub<[TokenDocumentData, Context], Document>;
  let stringToDocumentNameStub: sinon.SinonStub<[string, Context], DocumentName>;
  let ticker: string;
  let documents: TokenDocument[];
  let rawTicker: Ticker;
  let rawDocuments: [DocumentName, Document][];
  let documentEntries: [[Ticker, DocumentName], Document][];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: { balance: { free: new BigNumber(500), locked: new BigNumber(0) } },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    tokenDocumentDataToDocumentStub = sinon.stub(
      utilsConversionModule,
      'tokenDocumentDataToDocument'
    );
    stringToDocumentNameStub = sinon.stub(utilsConversionModule, 'stringToDocumentName');
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
    rawDocuments = documents.map(({ name, uri, contentHash }) =>
      tuple(
        dsMockUtils.createMockDocumentName(name),
        dsMockUtils.createMockDocument({
          uri: dsMockUtils.createMockDocumentUri(uri),
          // eslint-disable-next-line @typescript-eslint/camelcase
          content_hash: dsMockUtils.createMockDocumentHash(contentHash),
        })
      )
    );
    documentEntries = rawDocuments.map(([name, doc]) => tuple([rawTicker, name], doc));
    args = {
      ticker,
      documents,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let batchRemoveDocumentTransaction: PolymeshTx<[Vec<DocumentName>, Ticker]>;
  let batchAddDocumentTransaction: PolymeshTx<[Vec<ITuple<[DocumentName, Document]>>, Ticker]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    dsMockUtils.createQueryStub('asset', 'assetDocuments', {
      entries: [documentEntries[0]],
    });

    batchRemoveDocumentTransaction = dsMockUtils.createTxStub('asset', 'batchRemoveDocument');
    batchAddDocumentTransaction = dsMockUtils.createTxStub('asset', 'batchAddDocument');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    documents.forEach(({ uri, contentHash, name }, index) => {
      stringToDocumentNameStub.withArgs(name, mockContext).returns(rawDocuments[index][0]);
      tokenDocumentDataToDocumentStub
        .withArgs({ uri, contentHash }, mockContext)
        .returns(rawDocuments[index][1]);
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
      batchRemoveDocumentTransaction,
      { batchSize: 1 },
      [rawDocuments[0][0]],
      rawTicker
    );
    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      batchAddDocumentTransaction,
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
      batchAddDocumentTransaction,
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
      batchRemoveDocumentTransaction,
      { batchSize: 1 },
      [rawDocuments[0][0]],
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
