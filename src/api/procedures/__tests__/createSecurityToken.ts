import { bool, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetName,
  AssetType,
  Document,
  FundingRoundName,
  Ticker,
  TxTags,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareCreateSecurityToken,
} from '~/api/procedures/createSecurityToken';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  KnownTokenType,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
  TokenIdentifierType,
  TokenType,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('createSecurityToken procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: sinon.SinonStub;
  let stringToAssetNameStub: sinon.SinonStub<[string, Context], AssetName>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let tokenTypeToAssetTypeStub: sinon.SinonStub<[TokenType, Context], AssetType>;
  let tokenIdentifierToAssetIdentifierStub: sinon.SinonStub<
    [TokenIdentifier, Context],
    AssetIdentifier
  >;
  let stringToFundingRoundNameStub: sinon.SinonStub<[string, Context], FundingRoundName>;
  let tokenDocumentToDocumentStub: sinon.SinonStub<[TokenDocument, Context], Document>;
  let ticker: string;
  let name: string;
  let totalSupply: BigNumber;
  let isDivisible: boolean;
  let tokenType: TokenType;
  let tokenIdentifiers: TokenIdentifier[];
  let fundingRound: string;
  let documents: TokenDocument[];
  let rawTicker: Ticker;
  let rawName: AssetName;
  let rawTotalSupply: Balance;
  let rawIsDivisible: bool;
  let rawType: AssetType;
  let rawIdentifiers: AssetIdentifier[];
  let rawFundingRound: FundingRoundName;
  let rawDisableIu: bool;
  let rawDocuments: Document[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(1000),
          locked: new BigNumber(0),
          total: new BigNumber(1000),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    stringToAssetNameStub = sinon.stub(utilsConversionModule, 'stringToAssetName');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    tokenTypeToAssetTypeStub = sinon.stub(utilsConversionModule, 'tokenTypeToAssetType');
    tokenIdentifierToAssetIdentifierStub = sinon.stub(
      utilsConversionModule,
      'tokenIdentifierToAssetIdentifier'
    );
    stringToFundingRoundNameStub = sinon.stub(utilsConversionModule, 'stringToFundingRoundName');
    tokenDocumentToDocumentStub = sinon.stub(utilsConversionModule, 'tokenDocumentToDocument');
    ticker = 'someTicker';
    name = 'someName';
    totalSupply = new BigNumber(100);
    isDivisible = true;
    tokenType = KnownTokenType.EquityCommon;
    tokenIdentifiers = [
      {
        type: TokenIdentifierType.Isin,
        value: '12345',
      },
    ];
    fundingRound = 'Series A';
    documents = [
      {
        name: 'someDocument',
        uri: 'someUri',
        contentHash: 'someHash',
      },
    ];
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawName = dsMockUtils.createMockAssetName(name);
    rawTotalSupply = dsMockUtils.createMockBalance(totalSupply.toNumber());
    rawIsDivisible = dsMockUtils.createMockBool(isDivisible);
    rawType = dsMockUtils.createMockAssetType(tokenType);
    rawIdentifiers = tokenIdentifiers.map(({ type, value }) =>
      dsMockUtils.createMockAssetIdentifier({
        [type as 'Lei']: dsMockUtils.createMockU8aFixed(value),
      })
    );
    rawDocuments = documents.map(({ uri, contentHash, name: docName, type, filedAt }) =>
      dsMockUtils.createMockDocument({
        name: dsMockUtils.createMockDocumentName(docName),
        uri: dsMockUtils.createMockDocumentUri(uri),
        /* eslint-disable @typescript-eslint/naming-convention */
        content_hash: dsMockUtils.createMockDocumentHash(contentHash),
        doc_type: dsMockUtils.createMockOption(
          type ? dsMockUtils.createMockDocumentType(type) : null
        ),
        filing_date: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(filedAt.getTime()) : null
        ),
        /* eslint-enable @typescript-eslint/naming-convention */
      })
    );
    rawFundingRound = dsMockUtils.createMockFundingRoundName(fundingRound);
    rawDisableIu = dsMockUtils.createMockBool(false);
    args = {
      ticker,
      name,
      isDivisible,
      tokenType,
      tokenIdentifiers,
      fundingRound,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let createAssetTransaction: PolymeshTx<
    [AssetName, Ticker, Balance, bool, AssetType, Vec<AssetIdentifier>, Option<FundingRoundName>]
  >;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    dsMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(),
    });

    createAssetTransaction = dsMockUtils.createTxStub('asset', 'createAsset');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToBalanceStub.withArgs(totalSupply, mockContext, isDivisible).returns(rawTotalSupply);
    stringToAssetNameStub.withArgs(name, mockContext).returns(rawName);
    booleanToBoolStub.withArgs(isDivisible, mockContext).returns(rawIsDivisible);
    booleanToBoolStub.withArgs(false, mockContext).returns(rawDisableIu);
    tokenTypeToAssetTypeStub.withArgs(tokenType, mockContext).returns(rawType);
    tokenIdentifierToAssetIdentifierStub
      .withArgs(tokenIdentifiers[0], mockContext)
      .returns(rawIdentifiers[0]);
    stringToFundingRoundNameStub.withArgs(fundingRound, mockContext).returns(rawFundingRound);
    tokenDocumentToDocumentStub
      .withArgs(
        { uri: documents[0].uri, contentHash: documents[0].contentHash, name: documents[0].name },
        mockContext
      )
      .returns(rawDocuments[0]);
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

  test('should throw an error if a token with that ticker has already been launched', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.TokenCreated,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      `A Security Token with ticker "${ticker}" already exists`
    );
  });

  test("should throw an error if that ticker hasn't been reserved", () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      `You must first reserve ticker "${ticker}" in order to create a Security Token with it`
    );
  });

  test('should add a token creation transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareCreateSecurityToken.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      createAssetTransaction,
      { fee: undefined },
      rawName,
      rawTicker,
      rawIsDivisible,
      rawType,
      rawIdentifiers,
      rawFundingRound,
      rawDisableIu
    );
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));

    await prepareCreateSecurityToken.call(proc, {
      ...args,
      totalSupply: new BigNumber(0),
      tokenIdentifiers: undefined,
      fundingRound: undefined,
    });

    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      createAssetTransaction,
      { fee: undefined },
      rawName,
      rawTicker,
      rawIsDivisible,
      rawType,
      [],
      null,
      rawDisableIu
    );

    const issueTransaction = dsMockUtils.createTxStub('asset', 'issue');

    await prepareCreateSecurityToken.call(proc, { ...args, totalSupply });

    sinon.assert.calledWith(addTransactionStub, issueTransaction, {}, rawTicker, rawTotalSupply);
  });

  test('should waive protocol fees if the token was created in Ethereum', async () => {
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockClassicTickerRegistration({
          /* eslint-disable @typescript-eslint/naming-convention */
          eth_owner: 'someAddress',
          is_created: true,
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareCreateSecurityToken.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      createAssetTransaction,
      { fee: new BigNumber(0) },
      rawName,
      rawTicker,
      rawIsDivisible,
      rawType,
      rawIdentifiers,
      rawFundingRound,
      rawDisableIu
    );
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should add a document add transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
    const tx = dsMockUtils.createTxStub('asset', 'addDocuments');

    const result = await prepareCreateSecurityToken.call(proc, { ...args, documents });

    sinon.assert.calledWith(
      addTransactionStub,
      tx,
      { isCritical: false, batchSize: rawDocuments.length },
      rawDocuments,
      rawTicker
    );

    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });
});

describe('getAuthorization', () => {
  test('should return the appropriate roles and permissions', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getAuthorization(args)).toEqual({
      roles: [{ type: RoleType.TickerOwner, ticker }],
      permissions: {
        tokens: [],
        portfolios: [],
        transactions: [TxTags.asset.CreateAsset],
      },
    });

    expect(getAuthorization({ ...args, documents: [] })).toEqual({
      roles: [{ type: RoleType.TickerOwner, ticker }],
      permissions: {
        tokens: [],
        portfolios: [],
        transactions: [TxTags.asset.CreateAsset, TxTags.asset.AddDocuments],
      },
    });
  });
});
