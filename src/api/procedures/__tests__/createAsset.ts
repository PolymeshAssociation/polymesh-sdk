import { bool, BTreeSet, Bytes, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareCreateAsset,
  prepareStorage,
  Storage,
} from '~/api/procedures/createAsset';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AssetDocument,
  ClaimType,
  Identity,
  KnownAssetType,
  RoleType,
  SecurityIdentifier,
  SecurityIdentifierType,
  StatType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { InternalAssetType, PolymeshTx, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('createAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance;
  let stringToBytesSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let nameToAssetNameSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let fundingRoundToAssetFundingRoundSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let stringToTickerKeySpy: jest.SpyInstance<TickerKey, [string, Context]>;
  let statisticStatTypesToBtreeStatTypeSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    [PolymeshPrimitivesStatisticsStatType[], Context]
  >;
  let internalAssetTypeToAssetTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesAssetAssetType,
    [InternalAssetType, Context]
  >;
  let securityIdentifierToAssetIdentifierSpy: jest.SpyInstance<
    PolymeshPrimitivesAssetIdentifier,
    [SecurityIdentifier, Context]
  >;
  let assetDocumentToDocumentSpy: jest.SpyInstance<
    PolymeshPrimitivesDocument,
    [AssetDocument, Context]
  >;
  let ticker: string;
  let signingIdentity: Identity;
  let name: string;
  let initialSupply: BigNumber;
  let isDivisible: boolean;
  let assetType: string;
  let securityIdentifiers: SecurityIdentifier[];
  let fundingRound: string;
  let documents: AssetDocument[];
  let rawTicker: PolymeshPrimitivesTicker;
  let rawName: Bytes;
  let rawInitialSupply: Balance;
  let rawIsDivisible: bool;
  let rawType: PolymeshPrimitivesAssetAssetType;
  let rawIdentifiers: PolymeshPrimitivesAssetIdentifier[];
  let rawFundingRound: Bytes;
  let rawDocuments: PolymeshPrimitivesDocument[];
  let args: Params;
  let protocolFees: BigNumber[];

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
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    nameToAssetNameSpy = jest.spyOn(utilsConversionModule, 'nameToAssetName');
    fundingRoundToAssetFundingRoundSpy = jest.spyOn(
      utilsConversionModule,
      'fundingRoundToAssetFundingRound'
    );
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    stringToTickerKeySpy = jest.spyOn(utilsConversionModule, 'stringToTickerKey');
    statisticStatTypesToBtreeStatTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    internalAssetTypeToAssetTypeSpy = jest.spyOn(
      utilsConversionModule,
      'internalAssetTypeToAssetType'
    );
    securityIdentifierToAssetIdentifierSpy = jest.spyOn(
      utilsConversionModule,
      'securityIdentifierToAssetIdentifier'
    );
    assetDocumentToDocumentSpy = jest.spyOn(utilsConversionModule, 'assetDocumentToDocument');
    ticker = 'TICKER';
    name = 'someName';
    signingIdentity = entityMockUtils.getIdentityInstance();
    initialSupply = new BigNumber(100);
    isDivisible = false;
    assetType = KnownAssetType.EquityCommon;
    securityIdentifiers = [
      {
        type: SecurityIdentifierType.Isin,
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
    rawName = dsMockUtils.createMockBytes(name);
    rawInitialSupply = dsMockUtils.createMockBalance(initialSupply);
    rawIsDivisible = dsMockUtils.createMockBool(isDivisible);
    rawType = dsMockUtils.createMockAssetType(assetType as KnownAssetType);
    rawIdentifiers = securityIdentifiers.map(({ type, value }) =>
      dsMockUtils.createMockAssetIdentifier({
        [type as 'Lei']: dsMockUtils.createMockU8aFixed(value),
      })
    );
    rawDocuments = documents.map(({ uri, contentHash, name: docName, type, filedAt }) =>
      dsMockUtils.createMockDocument({
        name: dsMockUtils.createMockBytes(docName),
        uri: dsMockUtils.createMockBytes(uri),
        contentHash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash),
        }),
        docType: dsMockUtils.createMockOption(type ? dsMockUtils.createMockBytes(type) : null),
        filingDate: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime())) : null
        ),
      })
    );
    rawFundingRound = dsMockUtils.createMockBytes(fundingRound);
    args = {
      ticker,
      name,
      isDivisible,
      assetType,
      securityIdentifiers,
      fundingRound,
      reservationRequired: true,
    };
    protocolFees = [new BigNumber(250), new BigNumber(150), new BigNumber(100)];
  });

  let createAssetTransaction: PolymeshTx<
    [
      Bytes,
      PolymeshPrimitivesTicker,
      Balance,
      bool,
      PolymeshPrimitivesAssetAssetType,
      Vec<PolymeshPrimitivesAssetIdentifier>,
      Option<Bytes>,
      bool
    ]
  >;

  beforeEach(() => {
    dsMockUtils.createQueryMock('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    createAssetTransaction = dsMockUtils.createTxMock('asset', 'createAsset');

    mockContext = dsMockUtils.getContextInstance({ withSigningManager: true });

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(bigNumberToBalanceSpy)
      .calledWith(initialSupply, mockContext, isDivisible)
      .mockReturnValue(rawInitialSupply);
    when(nameToAssetNameSpy).calledWith(name, mockContext).mockReturnValue(rawName);
    when(booleanToBoolSpy).calledWith(isDivisible, mockContext).mockReturnValue(rawIsDivisible);
    when(stringToTickerKeySpy)
      .calledWith(ticker, mockContext)
      .mockReturnValue({ Ticker: rawTicker });
    when(internalAssetTypeToAssetTypeSpy)
      .calledWith(assetType as KnownAssetType, mockContext)
      .mockReturnValue(rawType);
    when(securityIdentifierToAssetIdentifierSpy)
      .calledWith(securityIdentifiers[0], mockContext)
      .mockReturnValue(rawIdentifiers[0]);
    when(fundingRoundToAssetFundingRoundSpy)
      .calledWith(fundingRound, mockContext)
      .mockReturnValue(rawFundingRound);
    when(assetDocumentToDocumentSpy)
      .calledWith(
        { uri: documents[0].uri, contentHash: documents[0].contentHash, name: documents[0].name },
        mockContext
      )
      .mockReturnValue(rawDocuments[0]);

    when(mockContext.getProtocolFees)
      .calledWith({ tags: [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset] })
      .mockResolvedValue([
        { tag: TxTags.asset.RegisterTicker, fees: protocolFees[0] },
        { tag: TxTags.asset.CreateAsset, fees: protocolFees[1] },
      ]);
    when(mockContext.getProtocolFees)
      .calledWith({ tags: [TxTags.asset.RegisterCustomAssetType] })
      .mockResolvedValue([{ tag: TxTags.asset.RegisterCustomAssetType, fees: protocolFees[2] }]);
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

  it('should throw an error if an Asset with that ticker has already been launched', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.AssetCreated,
      signingIdentity,
    });

    return expect(prepareCreateAsset.call(proc, args)).rejects.toThrow(
      `An Asset with ticker "${ticker}" already exists`
    );
  });

  it("should throw an error if that ticker hasn't been reserved and reservation is required", () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Free,
      signingIdentity,
    });

    return expect(prepareCreateAsset.call(proc, args)).rejects.toThrow(
      `You must first reserve ticker "${ticker}" in order to create an Asset with it`
    );
  });

  it('should throw an error if the ticker contains non numeric characters', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
      signingIdentity,
    });

    return expect(
      prepareCreateAsset.call(proc, { ...args, ticker: 'SOME_TICKER' })
    ).rejects.toThrow('New Tickers can only contain alphanumeric values');
  });

  it('should add an Asset creation transaction to the batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
      signingIdentity,
    });

    let result = await prepareCreateAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });

    result = await prepareCreateAsset.call(proc, {
      ...args,
      initialSupply: new BigNumber(0),
      securityIdentifiers: undefined,
      fundingRound: undefined,
      requireInvestorUniqueness: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [rawName, rawTicker, rawIsDivisible, rawType, [], null],
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });

    const issueTransaction = dsMockUtils.createTxMock('asset', 'issue');

    result = await prepareCreateAsset.call(proc, { ...args, initialSupply });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
        },
        {
          transaction: issueTransaction,
          args: [rawTicker, rawInitialSupply],
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should add an Asset creation transaction to the batch when reservationRequired is false', async () => {
    let proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
      signingIdentity,
    });

    let result = await prepareCreateAsset.call(proc, {
      ...args,
      reservationRequired: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });

    proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Free,
      signingIdentity,
    });

    result = await prepareCreateAsset.call(proc, {
      ...args,
      reservationRequired: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          fee: protocolFees[0].plus(protocolFees[1]),
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should add a document add transaction to the batch', async () => {
    const rawValue = dsMockUtils.createMockBytes('something');
    const rawTypeId = dsMockUtils.createMockU32(new BigNumber(10));
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: {
        rawValue,
        id: rawTypeId,
      },
      status: TickerReservationStatus.Free,
      signingIdentity,
    });
    const createAssetTx = dsMockUtils.createTxMock('asset', 'createAsset');
    const addDocumentsTx = dsMockUtils.createTxMock('asset', 'addDocuments');

    when(internalAssetTypeToAssetTypeSpy)
      .calledWith({ Custom: rawTypeId }, mockContext)
      .mockReturnValue(rawType);
    const result = await prepareCreateAsset.call(proc, {
      ...args,
      documents,
      reservationRequired: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTx,
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
          fee: protocolFees[0].plus(protocolFees[1]).plus(protocolFees[2]),
        },
        {
          transaction: addDocumentsTx,
          feeMultiplier: new BigNumber(rawDocuments.length),
          args: [rawDocuments, rawTicker],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should add a set statistics transaction to the batch', async () => {
    const mockStatsBtree = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesStatisticsStatType>([]);

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
      signingIdentity,
    });
    const createAssetTx = dsMockUtils.createTxMock('asset', 'createAsset');
    const addStatsTx = dsMockUtils.createTxMock('statistics', 'setActiveAssetStats');
    const issuer = entityMockUtils.getIdentityInstance();
    statisticStatTypesToBtreeStatTypeSpy.mockReturnValue(mockStatsBtree);

    const result = await prepareCreateAsset.call(proc, {
      ...args,
      initialStatistics: [
        { type: StatType.Balance },
        { type: StatType.ScopedCount, claimIssuer: { claimType: ClaimType.Accredited, issuer } },
      ],
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTx,
          args: [rawName, rawTicker, rawIsDivisible, rawType, rawIdentifiers, rawFundingRound],
        },
        {
          transaction: addStatsTx,
          args: [{ Ticker: rawTicker }, mockStatsBtree],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should add a create asset with custom type transaction to the batch', async () => {
    const rawValue = dsMockUtils.createMockBytes('something');
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: {
        id: dsMockUtils.createMockU32(),
        rawValue,
      },
      status: TickerReservationStatus.Reserved,
      signingIdentity,
    });
    const createAssetWithCustomTypeTx = dsMockUtils.createTxMock(
      'asset',
      'createAssetWithCustomType'
    );

    const result = await prepareCreateAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetWithCustomTypeTx,
          args: [rawName, rawTicker, rawIsDivisible, rawValue, rawIdentifiers, rawFundingRound],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
        customTypeData: null,
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });

      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);

      expect(result).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });

      proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({
        ...args,
        documents: [{ uri: 'www.doc.com', name: 'myDoc' }],
        initialStatistics: [{ type: StatType.Count }],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [
            TxTags.asset.CreateAsset,
            TxTags.asset.AddDocuments,
            TxTags.asset.RegisterCustomAssetType,
            TxTags.statistics.SetActiveAssetStats,
          ],
        },
      });

      proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(new BigNumber(10)),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, documents: [] });

      expect(result).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });

      proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
        customTypeData: {
          id: dsMockUtils.createMockU32(new BigNumber(10)),
          rawValue: dsMockUtils.createMockBytes('something'),
        },
        status: TickerReservationStatus.Free,
        signingIdentity,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, documents: [], reservationRequired: false });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.asset.CreateAsset],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    beforeEach(() => {
      mockContext.getSigningIdentity.mockResolvedValue(signingIdentity);
    });

    it('should return the custom asset type ID and bytes representation along with ticker reservation status', async () => {
      const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: null,
            status: TickerReservationStatus.Reserved,
          },
        },
      });

      let result = await boundFunc({ assetType: KnownAssetType.EquityCommon } as Params);

      expect(result).toEqual({
        customTypeData: null,
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });

      const rawValue = dsMockUtils.createMockBytes('something');
      when(stringToBytesSpy).calledWith('something', mockContext).mockReturnValue(rawValue);
      let id = dsMockUtils.createMockU32();

      const customTypesMock = dsMockUtils.createQueryMock('asset', 'customTypesInverse', {
        returnValue: dsMockUtils.createMockOption(id),
      });

      result = await boundFunc({ assetType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });

      id = dsMockUtils.createMockU32(new BigNumber(10));
      customTypesMock.mockResolvedValue(dsMockUtils.createMockOption(id));

      result = await boundFunc({ assetType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
        status: TickerReservationStatus.Reserved,
        signingIdentity,
      });
    });
  });
});
