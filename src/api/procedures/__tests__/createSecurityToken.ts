import { bool, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
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
  createRegisterCustomAssetTypeResolver,
  getAuthorization,
  Params,
  prepareCreateSecurityToken,
  prepareStorage,
  Storage,
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
} from '~/types';
import { InternalTokenType, PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
  let internalTokenTypeToAssetTypeStub: sinon.SinonStub<[InternalTokenType, Context], AssetType>;
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
  let tokenType: string;
  let tokenIdentifiers: TokenIdentifier[];
  let fundingRound: string;
  let requireInvestorUniqueness: boolean;
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
    internalTokenTypeToAssetTypeStub = sinon.stub(
      utilsConversionModule,
      'internalTokenTypeToAssetType'
    );
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
    requireInvestorUniqueness = true;
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
    rawType = dsMockUtils.createMockAssetType(tokenType as KnownTokenType);
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
        content_hash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash),
        }),
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
    rawDisableIu = dsMockUtils.createMockBool(!requireInvestorUniqueness);
    args = {
      ticker,
      name,
      isDivisible,
      tokenType,
      tokenIdentifiers,
      fundingRound,
      requireInvestorUniqueness,
      reservationRequired: true,
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
    booleanToBoolStub.withArgs(!requireInvestorUniqueness, mockContext).returns(rawDisableIu);
    internalTokenTypeToAssetTypeStub
      .withArgs(tokenType as KnownTokenType, mockContext)
      .returns(rawType);
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
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      `A Security Token with ticker "${ticker}" already exists`
    );
  });

  test("should throw an error if that ticker hasn't been reserved and reservation is required", () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

    return expect(prepareCreateSecurityToken.call(proc, args)).rejects.toThrow(
      `You must first reserve ticker "${ticker}" in order to create a Security Token with it`
    );
  });

  test('should throw an error if that ticker is reserved by some other identity', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
      expiryDate: null,
      status: TickerReservationStatus.Reserved,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

    return expect(
      prepareCreateSecurityToken.call(proc, { ...args, reservationRequired: false })
    ).rejects.toThrow(`Ticker "${ticker}" is reserved by some other identity`);
  });

  test('should add a token creation transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

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
      requireInvestorUniqueness: false,
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
      rawIsDivisible // disable IU = true
    );

    const issueTransaction = dsMockUtils.createTxStub('asset', 'issue');

    await prepareCreateSecurityToken.call(proc, { ...args, totalSupply });

    sinon.assert.calledWith(addTransactionStub, issueTransaction, {}, rawTicker, rawTotalSupply);
  });

  test('should add a token creation transaction to the queue when reservationRequired is false', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Reserved,
    });

    let result = await prepareCreateSecurityToken.call(proc, {
      ...args,
      reservationRequired: false,
    });

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

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    result = await prepareCreateSecurityToken.call(proc, {
      ...args,
      reservationRequired: false,
    });

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
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: null,
    });

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
    const rawValue = dsMockUtils.createMockBytes('something');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: {
        rawValue,
        id: dsMockUtils.createMockU32(10),
      },
    });
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

  test('should add a register custom asset type transaction to the queue and use the id for asset creation', async () => {
    const rawValue = dsMockUtils.createMockBytes('something');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
      customTypeData: {
        id: dsMockUtils.createMockU32(),
        rawValue,
      },
    });
    const registerAssetTypeTx = dsMockUtils.createTxStub('asset', 'registerCustomAssetType');
    const createTokenTx = dsMockUtils.createTxStub('asset', 'createAsset');

    const newCustomType = dsMockUtils.createMockAssetType({
      Custom: dsMockUtils.createMockU32(10),
    });
    addTransactionStub
      .withArgs(registerAssetTypeTx, sinon.match.object, rawValue)
      .returns([newCustomType]);

    const result = await prepareCreateSecurityToken.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, registerAssetTypeTx, sinon.match.object, rawValue);

    sinon.assert.calledWith(
      addTransactionStub,
      createTokenTx,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      newCustomType,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any
    );

    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  describe('createRegisterCustomAssetTypeResolver', () => {
    const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);
    const rawId = dsMockUtils.createMockU32(id.toNumber());
    const rawValue = dsMockUtils.createMockBytes('something');

    beforeEach(() => {
      filterEventRecordsStub.returns([
        dsMockUtils.createMockIEvent([
          dsMockUtils.createMockIdentityId('someDid'),
          rawId,
          rawValue,
        ]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
    });

    test('should return the new custom AssetType', () => {
      const fakeResult = ('assetType' as unknown) as AssetType;
      internalTokenTypeToAssetTypeStub.withArgs({ Custom: rawId }, mockContext).returns(fakeResult);
      const result = createRegisterCustomAssetTypeResolver(mockContext)({} as ISubmittableResult);

      expect(result).toBe(fakeResult);
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        customTypeData: null,
      });

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });

      proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
      });

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...args, documents: [{ uri: 'www.doc.com', name: 'myDoc' }] })).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [
            TxTags.asset.CreateAsset,
            TxTags.asset.AddDocuments,
            TxTags.asset.RegisterCustomAssetType,
          ],
        },
      });

      proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(10),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
      });

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...args, documents: [] })).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });

      proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(10),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
      });

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...args, documents: [], reservationRequired: false })).toEqual({
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the custom asset type ID and bytes representation', async () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      let result = await boundFunc({ tokenType: KnownTokenType.EquityCommon } as Params);

      expect(result).toEqual({
        customTypeData: null,
      });

      const rawValue = dsMockUtils.createMockBytes('something');
      sinon
        .stub(utilsConversionModule, 'stringToBytes')
        .withArgs('something', mockContext)
        .returns(rawValue);
      let id = dsMockUtils.createMockU32();

      const customTypesStub = dsMockUtils.createQueryStub('asset', 'customTypesInverse', {
        returnValue: id,
      });

      result = await boundFunc({ tokenType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
      });

      id = dsMockUtils.createMockU32(10);
      customTypesStub.resolves(id);

      result = await boundFunc({ tokenType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
      });
    });
  });
});
