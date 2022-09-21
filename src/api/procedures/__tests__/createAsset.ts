import { bool, BTreeSet, Bytes, Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesStatisticsStatType,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetName,
  AssetType,
  FundingRoundName,
  Ticker,
} from 'polymesh-types/types';
import sinon from 'sinon';

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
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let bigNumberToBalanceStub: sinon.SinonStub;
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let nameToAssetNameStub: sinon.SinonStub<[string, Context], Bytes>;
  let fundingRoundToAssetFundingRoundStub: sinon.SinonStub<[string, Context], Bytes>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let statisticStatTypesToBtreeStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatType[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatType>
  >;
  let internalAssetTypeToAssetTypeStub: sinon.SinonStub<[InternalAssetType, Context], AssetType>;
  let securityIdentifierToAssetIdentifierStub: sinon.SinonStub<
    [SecurityIdentifier, Context],
    PolymeshPrimitivesAssetIdentifier
  >;
  let assetDocumentToDocumentStub: sinon.SinonStub<
    [AssetDocument, Context],
    PolymeshPrimitivesDocument
  >;
  let ticker: string;
  let name: string;
  let initialSupply: BigNumber;
  let isDivisible: boolean;
  let assetType: string;
  let securityIdentifiers: SecurityIdentifier[];
  let fundingRound: string;
  let requireInvestorUniqueness: boolean;
  let documents: AssetDocument[];
  let rawTicker: Ticker;
  let rawName: Bytes;
  let rawInitialSupply: Balance;
  let rawIsDivisible: bool;
  let rawType: AssetType;
  let rawIdentifiers: PolymeshPrimitivesAssetIdentifier[];
  let rawFundingRound: Bytes;
  let rawDisableIu: bool;
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
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    nameToAssetNameStub = sinon.stub(utilsConversionModule, 'nameToAssetName');
    fundingRoundToAssetFundingRoundStub = sinon.stub(
      utilsConversionModule,
      'fundingRoundToAssetFundingRound'
    );
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    internalAssetTypeToAssetTypeStub = sinon.stub(
      utilsConversionModule,
      'internalAssetTypeToAssetType'
    );
    securityIdentifierToAssetIdentifierStub = sinon.stub(
      utilsConversionModule,
      'securityIdentifierToAssetIdentifier'
    );
    assetDocumentToDocumentStub = sinon.stub(utilsConversionModule, 'assetDocumentToDocument');
    ticker = 'SOME_TICKER';
    name = 'someName';
    initialSupply = new BigNumber(100);
    isDivisible = true;
    assetType = KnownAssetType.EquityCommon;
    securityIdentifiers = [
      {
        type: SecurityIdentifierType.Isin,
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
    rawDisableIu = dsMockUtils.createMockBool(!requireInvestorUniqueness);
    args = {
      ticker,
      name,
      isDivisible,
      assetType,
      securityIdentifiers,
      fundingRound,
      requireInvestorUniqueness,
      reservationRequired: true,
    };
    protocolFees = [new BigNumber(250), new BigNumber(150), new BigNumber(100)];
  });

  let createAssetTransaction: PolymeshTx<
    [
      AssetName,
      Ticker,
      Balance,
      bool,
      AssetType,
      Vec<AssetIdentifier>,
      Option<FundingRoundName>,
      bool
    ]
  >;

  beforeEach(() => {
    dsMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(),
    });

    createAssetTransaction = dsMockUtils.createTxStub('asset', 'createAsset');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    bigNumberToBalanceStub
      .withArgs(initialSupply, mockContext, isDivisible)
      .returns(rawInitialSupply);
    nameToAssetNameStub.withArgs(name, mockContext).returns(rawName);
    booleanToBoolStub.withArgs(isDivisible, mockContext).returns(rawIsDivisible);
    booleanToBoolStub.withArgs(!requireInvestorUniqueness, mockContext).returns(rawDisableIu);
    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
    internalAssetTypeToAssetTypeStub
      .withArgs(assetType as KnownAssetType, mockContext)
      .returns(rawType);
    securityIdentifierToAssetIdentifierStub
      .withArgs(securityIdentifiers[0], mockContext)
      .returns(rawIdentifiers[0]);
    fundingRoundToAssetFundingRoundStub
      .withArgs(fundingRound, mockContext)
      .returns(rawFundingRound);
    assetDocumentToDocumentStub
      .withArgs(
        { uri: documents[0].uri, contentHash: documents[0].contentHash, name: documents[0].name },
        mockContext
      )
      .returns(rawDocuments[0]);

    mockContext.getProtocolFees
      .withArgs({ tags: [TxTags.asset.RegisterTicker, TxTags.asset.CreateAsset] })
      .resolves([
        { tag: TxTags.asset.RegisterTicker, fees: protocolFees[0] },
        { tag: TxTags.asset.CreateAsset, fees: protocolFees[1] },
      ]);
    mockContext.getProtocolFees
      .withArgs({ tags: [TxTags.asset.RegisterCustomAssetType] })
      .resolves([{ tag: TxTags.asset.RegisterCustomAssetType, fees: protocolFees[2] }]);
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
    });

    return expect(prepareCreateAsset.call(proc, args)).rejects.toThrow(
      `An Asset with ticker "${ticker}" already exists`
    );
  });

  it("should throw an error if that ticker hasn't been reserved and reservation is required", () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Free,
    });

    return expect(prepareCreateAsset.call(proc, args)).rejects.toThrow(
      `You must first reserve ticker "${ticker}" in order to create an Asset with it`
    );
  });

  it('should add an Asset creation transaction to the batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
    });

    let result = await prepareCreateAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
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
          args: [rawName, rawTicker, rawIsDivisible, rawType, [], null, rawIsDivisible], // disable IU = true
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });

    const issueTransaction = dsMockUtils.createTxStub('asset', 'issue');

    result = await prepareCreateAsset.call(proc, { ...args, initialSupply });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ], // disable IU = true
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
    });

    let result = await prepareCreateAsset.call(proc, {
      ...args,
      reservationRequired: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
        },
      ],
      fee: undefined,
      resolver: expect.objectContaining({ ticker }),
    });

    proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Free,
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
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should waive protocol fees if the token was created in Ethereum', async () => {
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockClassicTickerRegistration({
          ethOwner: 'someAddress',
          isCreated: true,
        })
      ),
    });
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
      status: TickerReservationStatus.Reserved,
    });

    const result = await prepareCreateAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTransaction,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
          fee: new BigNumber(0),
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
    });
    const createAssetTx = dsMockUtils.createTxStub('asset', 'createAsset');
    const addDocumentsTx = dsMockUtils.createTxStub('asset', 'addDocuments');

    internalAssetTypeToAssetTypeStub.withArgs({ Custom: rawTypeId }, mockContext).returns(rawType);
    const result = await prepareCreateAsset.call(proc, {
      ...args,
      documents,
      reservationRequired: false,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetTx,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
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
    });
    const createAssetTx = dsMockUtils.createTxStub('asset', 'createAsset');
    const addStatsTx = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');
    const issuer = entityMockUtils.getIdentityInstance();
    statisticStatTypesToBtreeStatTypeStub.returns(mockStatsBtree);

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
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawType,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
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
    });
    const createAssetWithCustomTypeTx = dsMockUtils.createTxStub(
      'asset',
      'createAssetWithCustomType'
    );

    const result = await prepareCreateAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: createAssetWithCustomTypeTx,
          args: [
            rawName,
            rawTicker,
            rawIsDivisible,
            rawValue,
            rawIdentifiers,
            rawFundingRound,
            rawDisableIu,
          ],
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
      });

      const rawValue = dsMockUtils.createMockBytes('something');
      stringToBytesStub.withArgs('something', mockContext).returns(rawValue);
      let id = dsMockUtils.createMockU32();

      const customTypesStub = dsMockUtils.createQueryStub('asset', 'customTypesInverse', {
        returnValue: id,
      });

      result = await boundFunc({ assetType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
        status: TickerReservationStatus.Reserved,
      });

      id = dsMockUtils.createMockU32(new BigNumber(10));
      customTypesStub.resolves(id);

      result = await boundFunc({ assetType: 'something' } as Params);

      expect(result).toEqual({
        customTypeData: {
          rawValue,
          id,
        },
        status: TickerReservationStatus.Reserved,
      });
    });
  });
});
