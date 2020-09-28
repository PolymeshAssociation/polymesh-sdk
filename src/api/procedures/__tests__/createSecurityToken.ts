import { bool, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetName,
  AssetType,
  Document,
  DocumentName,
  FundingRoundName,
  Ticker,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareCreateSecurityToken,
} from '~/api/procedures/createSecurityToken';
import { Context } from '~/base';
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
import { PolymeshTx, TokenDocumentData } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('createSecurityToken procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context], Balance>;
  let stringToAssetNameStub: sinon.SinonStub<[string, Context], AssetName>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let tokenTypeToAssetTypeStub: sinon.SinonStub<[TokenType, Context], AssetType>;
  let tokenIdentifierToAssetIdentifierStub: sinon.SinonStub<
    [TokenIdentifier, Context],
    AssetIdentifier
  >;
  let stringToFundingRoundNameStub: sinon.SinonStub<[string, Context], FundingRoundName>;
  let stringToDocumentNameStub: sinon.SinonStub<[string, Context], DocumentName>;
  let tokenDocumentDataToDocumentStub: sinon.SinonStub<[TokenDocumentData, Context], Document>;
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
  let rawDocuments: Document[];
  let rawDocumentTuples: [DocumentName, Document][];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: { balance: { free: new BigNumber(1000), locked: new BigNumber(0) } },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    stringToAssetNameStub = sinon.stub(utilsModule, 'stringToAssetName');
    booleanToBoolStub = sinon.stub(utilsModule, 'booleanToBool');
    tokenTypeToAssetTypeStub = sinon.stub(utilsModule, 'tokenTypeToAssetType');
    tokenIdentifierToAssetIdentifierStub = sinon.stub(
      utilsModule,
      'tokenIdentifierToAssetIdentifier'
    );
    stringToFundingRoundNameStub = sinon.stub(utilsModule, 'stringToFundingRoundName');
    stringToDocumentNameStub = sinon.stub(utilsModule, 'stringToDocumentName');
    tokenDocumentDataToDocumentStub = sinon.stub(utilsModule, 'tokenDocumentDataToDocument');
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
    rawDocuments = documents.map(({ uri, contentHash }) =>
      dsMockUtils.createMockDocument({
        uri: dsMockUtils.createMockDocumentUri(uri),
        // eslint-disable-next-line @typescript-eslint/camelcase
        content_hash: dsMockUtils.createMockDocumentHash(contentHash),
      })
    );
    rawDocumentTuples = documents.map(({ name: documentName }, index) =>
      tuple(dsMockUtils.createMockDocumentName(documentName), rawDocuments[index])
    );
    rawFundingRound = dsMockUtils.createMockFundingRoundName(fundingRound);
    args = {
      ticker,
      name,
      totalSupply,
      isDivisible,
      tokenType,
      tokenIdentifiers,
      fundingRound,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let transaction: PolymeshTx<[
    AssetName,
    Ticker,
    Balance,
    bool,
    AssetType,
    Vec<AssetIdentifier>,
    Option<FundingRoundName>
  ]>;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    dsMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = dsMockUtils.createTxStub('asset', 'createAsset');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToBalanceStub.withArgs(totalSupply, mockContext).returns(rawTotalSupply);
    stringToAssetNameStub.withArgs(name, mockContext).returns(rawName);
    booleanToBoolStub.withArgs(isDivisible, mockContext).returns(rawIsDivisible);
    tokenTypeToAssetTypeStub.withArgs(tokenType, mockContext).returns(rawType);
    tokenIdentifierToAssetIdentifierStub
      .withArgs(tokenIdentifiers[0], mockContext)
      .returns(rawIdentifiers[0]);
    stringToFundingRoundNameStub.withArgs(fundingRound, mockContext).returns(rawFundingRound);
    stringToDocumentNameStub
      .withArgs(documents[0].name, mockContext)
      .returns(rawDocumentTuples[0][0]);
    tokenDocumentDataToDocumentStub
      .withArgs({ uri: documents[0].uri, contentHash: documents[0].contentHash }, mockContext)
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
      transaction,
      {},
      rawName,
      rawTicker,
      rawTotalSupply,
      rawIsDivisible,
      rawType,
      rawIdentifiers,
      rawFundingRound
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));

    await prepareCreateSecurityToken.call(proc, {
      ...args,
      tokenIdentifiers: undefined,
      fundingRound: undefined,
    });

    sinon.assert.calledWith(
      addTransactionStub.secondCall,
      transaction,
      {},
      rawName,
      rawTicker,
      rawTotalSupply,
      rawIsDivisible,
      rawType,
      [],
      null
    );
  });

  test('should add a document add transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
    const tx = dsMockUtils.createTxStub('asset', 'batchAddDocument');

    const result = await prepareCreateSecurityToken.call(proc, { ...args, documents });

    sinon.assert.calledWith(
      addTransactionStub,
      tx,
      { isCritical: false, batchSize: rawDocumentTuples.length },
      rawDocumentTuples,
      rawTicker
    );

    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRequiredRoles', () => {
  test('should return a ticker owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TickerOwner, ticker }]);
  });
});
