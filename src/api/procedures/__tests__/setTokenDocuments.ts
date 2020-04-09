import { u64, Vec } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Document, Link, Signatory, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareSetTokenDocuments,
} from '~/api/procedures/setTokenDocuments';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TokenDocument } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('setTokenDocuments procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let tokenDocumentToDocumentStub: sinon.SinonStub<[TokenDocument, Context], Document>;
  let ticker: string;
  let documents: TokenDocument[];
  let rawTicker: Ticker;
  let rawDocuments: Document[];
  let links: Link[];
  let args: Params;

  let tokenSignatory: Signatory;
  let linkIds: u64[];

  beforeAll(() => {
    polkadotMockUtils.initMocks({ contextOptions: { balance: new BigNumber(500) } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    sinon.stub(utilsModule, 'signerToSignatory');
    tokenDocumentToDocumentStub = sinon.stub(utilsModule, 'tokenDocumentToDocument');
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
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    rawDocuments = documents.map(({ name, uri, contentHash }) =>
      polkadotMockUtils.createMockDocument({
        name: polkadotMockUtils.createMockDocumentName(name),
        uri: polkadotMockUtils.createMockDocumentUri(uri),
        // eslint-disable-next-line @typescript-eslint/camelcase
        content_hash: polkadotMockUtils.createMockDocumentHash(contentHash),
      })
    );
    tokenSignatory = polkadotMockUtils.createMockSignatory({
      Identity: polkadotMockUtils.createMockIdentityId('tokenDid'),
    });
    linkIds = [polkadotMockUtils.createMockU64(1), polkadotMockUtils.createMockU64(2)];
    /* eslint-disable @typescript-eslint/camelcase */
    links = [
      polkadotMockUtils.createMockLink({
        link_data: polkadotMockUtils.createMockLinkData({
          DocumentOwned: rawDocuments[0],
        }),
        expiry: polkadotMockUtils.createMockOption(),
        link_id: linkIds[0],
      }),
      polkadotMockUtils.createMockLink({
        link_data: polkadotMockUtils.createMockLinkData({
          DocumentOwned: rawDocuments[1],
        }),
        expiry: polkadotMockUtils.createMockOption(),
        link_id: linkIds[1],
      }),
    ];
    /* eslint-enable @typescript-eslint/camelcase */
    args = {
      ticker,
      documents,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let removeDocumentsTransaction: PolymeshTx<[Ticker, Vec<u64>]>;
  let addDocumentsTransaction: PolymeshTx<[Ticker, Vec<Document>]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    polkadotMockUtils.createQueryStub('identity', 'links', {
      entries: [tuple([tokenSignatory, linkIds[0]], links[0])],
    });

    removeDocumentsTransaction = polkadotMockUtils.createTxStub('asset', 'removeDocuments');
    addDocumentsTransaction = polkadotMockUtils.createTxStub('asset', 'addDocuments');

    mockContext = polkadotMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    documents.forEach((document, index) => {
      tokenDocumentToDocumentStub.withArgs(document, mockContext).returns(rawDocuments[index]);
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the new list is the same as the current one', () => {
    polkadotMockUtils.createQueryStub('identity', 'links', {
      entries: links.map(link => tuple([tokenSignatory, link.link_id], link)),
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetTokenDocuments.call(proc, args)).rejects.toThrow(
      'The supplied document list is equal to the current one'
    );
  });

  test('should add a remove documents transaction and an add documents transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDocumentsTransaction,
      {},
      rawTicker,
      [links[0].link_id]
    );
    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      addDocumentsTransaction,
      {},
      rawTicker,
      rawDocuments
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove documents transaction if there are no documents linked to the token', async () => {
    polkadotMockUtils.createQueryStub('identity', 'links', {
      entries: [],
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenDocuments.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      addDocumentsTransaction,
      {},
      rawTicker,
      rawDocuments
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add an add documents transaction if there are no documents passed as arguments', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetTokenDocuments.call(proc, { ...args, documents: [] });

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      removeDocumentsTransaction,
      {},
      rawTicker,
      [links[0].link_id]
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
