import { bool, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { AnyNumber, ITuple } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetType,
  Document,
  FundingRoundName,
  IdentifierType,
  Ticker,
  TokenName,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { getRoles, Params, prepareCreateSecurityToken } from '~/api/procedures/createSecurityToken';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  KnownTokenIdentifierType,
  KnownTokenType,
  RoleType,
  TickerReservationStatus,
  TokenDocument,
  TokenIdentifier,
  TokenIdentifierType,
  TokenType,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
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
  let stringToTokenNameStub: sinon.SinonStub<[string, Context], TokenName>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let tokenTypeToAssetTypeStub: sinon.SinonStub<[TokenType, Context], AssetType>;
  let tokenIdentifierTypeToIdentifierTypeStub: sinon.SinonStub<
    [TokenIdentifierType, Context],
    IdentifierType
  >;
  let stringToAssetIdentifierStub: sinon.SinonStub<[string, Context], AssetIdentifier>;
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
  let rawName: TokenName;
  let rawTotalSupply: Balance;
  let rawIsDivisible: bool;
  let rawType: AssetType;
  let rawIdentifiers: [IdentifierType, AssetIdentifier][];
  let rawFundingRound: FundingRoundName;
  let rawDocuments: Document[];
  let args: Params;
  let fee: number;

  beforeAll(() => {
    polkadotMockUtils.initMocks({ contextOptions: { balance: new BigNumber(500) } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    stringToTokenNameStub = sinon.stub(utilsModule, 'stringToTokenName');
    booleanToBoolStub = sinon.stub(utilsModule, 'booleanToBool');
    tokenTypeToAssetTypeStub = sinon.stub(utilsModule, 'tokenTypeToAssetType');
    tokenIdentifierTypeToIdentifierTypeStub = sinon.stub(
      utilsModule,
      'tokenIdentifierTypeToIdentifierType'
    );
    stringToAssetIdentifierStub = sinon.stub(utilsModule, 'stringToAssetIdentifier');
    stringToFundingRoundNameStub = sinon.stub(utilsModule, 'stringToFundingRoundName');
    tokenDocumentToDocumentStub = sinon.stub(utilsModule, 'tokenDocumentToDocument');
    ticker = 'someTicker';
    name = 'someName';
    totalSupply = new BigNumber(100);
    isDivisible = true;
    tokenType = KnownTokenType.Equity;
    tokenIdentifiers = [
      {
        type: KnownTokenIdentifierType.Isin,
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
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    rawName = polkadotMockUtils.createMockTokenName(name);
    rawTotalSupply = polkadotMockUtils.createMockBalance(totalSupply.toNumber());
    rawIsDivisible = polkadotMockUtils.createMockBool(isDivisible);
    rawType = polkadotMockUtils.createMockAssetType(tokenType);
    rawIdentifiers = tokenIdentifiers.map(({ type, value }) => {
      return [
        polkadotMockUtils.createMockIdentifierType(type as KnownTokenIdentifierType),
        polkadotMockUtils.createMockAssetIdentifier(value),
      ];
    });
    rawDocuments = documents.map(({ name, uri, contentHash }) =>
      polkadotMockUtils.createMockDocument({
        name: polkadotMockUtils.createMockDocumentName(name),
        uri: polkadotMockUtils.createMockDocumentUri(uri),
        // eslint-disable-next-line @typescript-eslint/camelcase
        content_hash: polkadotMockUtils.createMockDocumentHash(contentHash),
      })
    );
    rawFundingRound = polkadotMockUtils.createMockFundingRoundName(fundingRound);
    args = {
      ticker,
      name,
      totalSupply,
      isDivisible,
      tokenType,
      tokenIdentifiers,
      fundingRound,
    };
    fee = 250;
  });

  let addTransactionStub: sinon.SinonStub;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let transaction: PolymeshTx<[
    TokenName | string,
    string | Ticker | Uint8Array,
    Balance | AnyNumber | Uint8Array,
    bool | boolean | Uint8Array,
    (
      | AssetType
      | { equity: any }
      | { debt: any }
      | { commodity: any }
      | { structuredProduct: any }
      | { custom: any }
      | string
      | Uint8Array
    ),
    (
      | Vec<ITuple<[IdentifierType, AssetIdentifier]>>
      | [
          IdentifierType | { isin: any } | { cusip: any } | { custom: any } | string | Uint8Array,
          AssetIdentifier | string
        ][]
    ),
    Option<FundingRoundName> | null | object | string | Uint8Array
  ]>;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    polkadotMockUtils.createQueryStub('asset', 'assetCreationFee', {
      returnValue: polkadotMockUtils.createMockBalance(fee * Math.pow(10, 6)),
    });
    polkadotMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: polkadotMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = polkadotMockUtils.createTxStub('asset', 'createToken');

    mockContext = polkadotMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToBalanceStub.withArgs(totalSupply, mockContext).returns(rawTotalSupply);
    stringToTokenNameStub.withArgs(name, mockContext).returns(rawName);
    booleanToBoolStub.withArgs(isDivisible, mockContext).returns(rawIsDivisible);
    tokenTypeToAssetTypeStub.withArgs(tokenType, mockContext).returns(rawType);
    tokenIdentifierTypeToIdentifierTypeStub
      .withArgs(tokenIdentifiers[0].type, mockContext)
      .returns(rawIdentifiers[0][0]);
    stringToAssetIdentifierStub
      .withArgs(tokenIdentifiers[0].value, mockContext)
      .returns(rawIdentifiers[0][1]);
    stringToFundingRoundNameStub.withArgs(fundingRound, mockContext).returns(rawFundingRound);
    tokenDocumentToDocumentStub.withArgs(documents[0], mockContext).returns(rawDocuments[0]);
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

  test('should throw an error if a token with that ticker has already been launched', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.TokenCreated,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

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
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      `You must first reserve ticker "${ticker}" in order to create a Security Token with it`
    );
  });

  test("should throw an error if the signing account doesn't have enough balance", () => {
    polkadotMockUtils.createQueryStub('asset', 'assetCreationFee', {
      returnValue: polkadotMockUtils.createMockBalance(600000000),
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      'Not enough POLYX balance to pay for token creation'
    );
  });

  test('should add a token creation transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareCreateSecurityToken.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      transaction,
      sinon.match({
        fee: new BigNumber(fee),
      }),
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
      sinon.match({
        fee: new BigNumber(fee),
      }),
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
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;
    const tx = polkadotMockUtils.createTxStub('asset', 'addDocuments');

    const result = await prepareCreateSecurityToken.call(proc, { ...args, documents });

    sinon.assert.calledWith(addTransactionStub, tx, {}, rawTicker, rawDocuments);

    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRoles', () => {
  test('should return a ticker owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRoles(args)).toEqual([{ type: RoleType.TickerOwner, ticker }]);
  });
});
