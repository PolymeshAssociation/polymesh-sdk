import { bool, Bytes } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PalletAssetSecurityToken,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Asset, Context, Entity, PolymeshTransaction } from '~/internal';
import { eventByIndexedArgs, tickerExternalAgentHistory } from '~/middleware/queries';
import { assetQuery, tickerExternalAgentHistoryQuery } from '~/middleware/queriesV2';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  EventIdentifier,
  HistoricAgentOperation,
  SecurityIdentifier,
  SecurityIdentifierType,
} from '~/types';
import { tuple } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Asset class', () => {
  let bytesToStringSpy: jest.SpyInstance;
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(Asset.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      expect(asset.ticker).toBe(ticker);
      expect(asset.did).toBe(utilsConversionModule.tickerToDid(ticker));
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Asset.isUniqueIdentifiers({ ticker: 'SOME_TICKER' })).toBe(true);
      expect(Asset.isUniqueIdentifiers({})).toBe(false);
      expect(Asset.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    let ticker: string;
    let name: string;
    let totalSupply: BigNumber;
    let isDivisible: boolean;
    let owner: string;
    let assetType: 'EquityCommon';
    let iuDisabled: boolean;
    let did: string;

    let rawToken: PalletAssetSecurityToken;
    let rawName: Bytes;
    let rawIuDisabled: bool;

    let context: Context;
    let asset: Asset;

    beforeAll(() => {
      ticker = 'FAKE_TICKER';
      name = 'tokenName';
      totalSupply = new BigNumber(1000);
      isDivisible = true;
      owner = '0x0wn3r';
      assetType = 'EquityCommon';
      iuDisabled = false;
      did = 'someDid';
      bytesToStringSpy = jest.spyOn(utilsConversionModule, 'bytesToString');
    });

    beforeEach(() => {
      rawToken = dsMockUtils.createMockSecurityToken({
        ownerDid: dsMockUtils.createMockIdentityId(owner),
        assetType: dsMockUtils.createMockAssetType(assetType),
        divisible: dsMockUtils.createMockBool(isDivisible),
        totalSupply: dsMockUtils.createMockBalance(totalSupply),
      });
      rawIuDisabled = dsMockUtils.createMockBool(iuDisabled);
      rawName = dsMockUtils.createMockBytes(name);
      context = dsMockUtils.getContextInstance();
      asset = new Asset({ ticker }, context);

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1PIA'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(owner)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('ExceptMeta'))
          ),
        ],
      });
      dsMockUtils.createQueryMock('asset', 'assetNames', {
        returnValue: rawName,
      });
      dsMockUtils.createQueryMock('asset', 'disableInvestorUniqueness', {
        returnValue: rawIuDisabled,
      });
    });

    it('should return details for an Asset', async () => {
      const tokensMock = dsMockUtils.createQueryMock('asset', 'tokens', {
        returnValue: rawToken,
      });

      when(bytesToStringSpy).calledWith(rawName).mockReturnValue(name);
      let details = await asset.details();

      expect(details.name).toBe(name);
      expect(details.totalSupply).toEqual(
        utilsConversionModule.balanceToBigNumber(totalSupply as unknown as Balance)
      );
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
      expect(details.assetType).toBe(assetType);
      expect(details.fullAgents[0].did).toBe(owner);
      expect(details.requiresInvestorUniqueness).toBe(true);

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
        ],
      });

      details = await asset.details();
      expect(details.fullAgents[0].did).toEqual(did);

      tokensMock.mockResolvedValue(
        dsMockUtils.createMockSecurityToken({
          ownerDid: dsMockUtils.createMockIdentityId(owner),
          assetType: dsMockUtils.createMockAssetType({
            Custom: dsMockUtils.createMockU32(new BigNumber(10)),
          }),
          divisible: dsMockUtils.createMockBool(isDivisible),
          totalSupply: dsMockUtils.createMockBalance(totalSupply),
        })
      );

      const customType = 'something';
      const rawCustomType = dsMockUtils.createMockBytes(customType);
      dsMockUtils.createQueryMock('asset', 'customTypes', {
        returnValue: rawCustomType,
      });
      when(bytesToStringSpy).calledWith(rawCustomType).mockReturnValue(customType);

      details = await asset.details();
      expect(details.assetType).toEqual(customType);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawToken as any).primaryIssuanceAgent = dsMockUtils.createMockOption();

      dsMockUtils.createQueryMock('asset', 'tokens').mockImplementation(async (_, cbFunc) => {
        cbFunc(rawToken);

        return unsubCallback;
      });

      when(bytesToStringSpy).calledWith(rawName).mockReturnValue(name);

      const callback = jest.fn();
      const result = await asset.details(callback);
      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(
        expect.objectContaining({
          assetType,
          isDivisible,
          name,
          owner: expect.objectContaining({ did: owner }),
          totalSupply: new BigNumber(totalSupply).div(Math.pow(10, 6)),
          fullAgents: [expect.objectContaining({ did: owner })],
          requiresInvestorUniqueness: true,
        })
      );
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
        expiry,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modify', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);
      const makeDivisible = true as const;

      const args = {
        makeDivisible,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.modify(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: currentFundingRound', () => {
    let ticker: string;
    let fundingRound: string;
    let rawFundingRound: Bytes;

    let context: Context;
    let asset: Asset;

    beforeAll(() => {
      ticker = 'FAKE_TICKER';
      fundingRound = 'Series A';
    });

    beforeEach(() => {
      rawFundingRound = dsMockUtils.createMockBytes(fundingRound);
      context = dsMockUtils.getContextInstance();
      asset = new Asset({ ticker }, context);
    });

    it('should return null if there is no funding round for an Asset', async () => {
      dsMockUtils.createQueryMock('asset', 'fundingRound', {
        returnValue: dsMockUtils.createMockBytes(),
      });

      const result = await asset.currentFundingRound();

      expect(result).toBeNull();
    });

    it('should return the funding round for an Asset', async () => {
      dsMockUtils.createQueryMock('asset', 'fundingRound', {
        returnValue: rawFundingRound,
      });
      when(bytesToStringSpy).calledWith(rawFundingRound).mockReturnValue(fundingRound);
      const result = await asset.currentFundingRound();

      expect(result).toBe(fundingRound);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryMock('asset', 'fundingRound').mockImplementation(async (_, cbFunc) => {
        cbFunc(rawFundingRound);

        return unsubCallback;
      });
      when(bytesToStringSpy).calledWith(rawFundingRound).mockReturnValue(fundingRound);

      const callback = jest.fn();
      const result = await asset.currentFundingRound(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(fundingRound);
    });
  });

  describe('method: getIdentifiers', () => {
    let ticker: string;
    let isinValue: string;
    let cusipValue: string;
    let cinsValue: string;
    let leiValue: string;
    let figiValue: string;
    let isinMock: PolymeshPrimitivesAssetIdentifier;
    let cusipMock: PolymeshPrimitivesAssetIdentifier;
    let cinsMock: PolymeshPrimitivesAssetIdentifier;
    let leiMock: PolymeshPrimitivesAssetIdentifier;
    let figiMock: PolymeshPrimitivesAssetIdentifier;
    let securityIdentifiers: SecurityIdentifier[];

    let context: Context;
    let asset: Asset;

    beforeAll(() => {
      ticker = 'TEST';
      isinValue = 'FAKE ISIN';
      cusipValue = 'FAKE CUSIP';
      cinsValue = 'FAKE CINS';
      leiValue = 'FAKE LEI';
      figiValue = 'FAKE FIGI';
      isinMock = dsMockUtils.createMockAssetIdentifier({
        Isin: dsMockUtils.createMockU8aFixed(isinValue),
      });
      cusipMock = dsMockUtils.createMockAssetIdentifier({
        Cusip: dsMockUtils.createMockU8aFixed(cusipValue),
      });
      cinsMock = dsMockUtils.createMockAssetIdentifier({
        Cins: dsMockUtils.createMockU8aFixed(cinsValue),
      });
      leiMock = dsMockUtils.createMockAssetIdentifier({
        Lei: dsMockUtils.createMockU8aFixed(leiValue),
      });
      figiMock = dsMockUtils.createMockAssetIdentifier({
        Figi: dsMockUtils.createMockU8aFixed(figiValue),
      });
      securityIdentifiers = [
        {
          type: SecurityIdentifierType.Isin,
          value: isinValue,
        },
        {
          type: SecurityIdentifierType.Cusip,
          value: cusipValue,
        },
        {
          type: SecurityIdentifierType.Cins,
          value: cinsValue,
        },
        {
          type: SecurityIdentifierType.Lei,
          value: leiValue,
        },
        {
          type: SecurityIdentifierType.Figi,
          value: figiValue,
        },
      ];
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = new Asset({ ticker }, context);
    });

    it('should return the list of security identifiers for an Asset', async () => {
      dsMockUtils.createQueryMock('asset', 'identifiers', {
        returnValue: [isinMock, cusipMock, cinsMock, leiMock, figiMock],
      });

      const result = await asset.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
      expect(result[1].value).toBe(cusipValue);
      expect(result[2].value).toBe(cinsValue);
      expect(result[3].value).toBe(leiValue);
      expect(result[4].value).toBe(figiValue);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryMock('asset', 'identifiers').mockImplementation(async (_, cbFunc) => {
        cbFunc([isinMock, cusipMock, cinsMock, leiMock, figiMock]);

        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await asset.getIdentifiers(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(securityIdentifiers);
    });
  });

  describe('method: createdAt', () => {
    let context: Context;
    beforeEach(() => {
      context = dsMockUtils.getContextInstance({ middlewareV2Enabled: false });
    });

    it('should return the event identifier object of the Asset creation', async () => {
      const ticker = 'SOME_TICKER';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createApolloQueryMock(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/naming-convention */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx.toNumber(),
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const result = await asset.createdAt();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const ticker = 'SOME_TICKER';
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createApolloQueryMock(eventByIndexedArgs(variables), {});
      const result = await asset.createdAt();
      expect(result).toBeNull();
    });

    it('should call v2 query if middlewareV2 is enabled', async () => {
      dsMockUtils.configureMocks({ contextOptions: { middlewareV2Enabled: true } });
      const asset = new Asset({ ticker: 'SOME_TICKER' }, context);
      const fakeResult = 'fakeResult' as unknown as EventIdentifier;
      jest.spyOn(asset, 'createdAtV2').mockResolvedValue(fakeResult);

      const result = await asset.createdAt();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: createdAtV2', () => {
    it('should return the event identifier object of the Asset creation', async () => {
      const ticker = 'SOME_TICKER';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        ticker,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createApolloV2QueryMock(assetQuery(variables), {
        assets: {
          nodes: [
            {
              createdBlock: {
                blockId: blockNumber.toNumber(),
                datetime: blockDate,
                hash: blockHash,
              },
              eventIdx: eventIdx.toNumber(),
            },
          ],
        },
      });

      const result = await asset.createdAtV2();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const ticker = 'SOME_TICKER';
      const variables = {
        ticker,
      };
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createApolloV2QueryMock(assetQuery(variables), {
        assets: {
          nodes: [],
        },
      });
      const result = await asset.createdAtV2();
      expect(result).toBeNull();
    });
  });

  describe('method: freeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, freeze: true }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.freeze();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: unfreeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, freeze: false }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.unfreeze();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: isFrozen', () => {
    let frozenMock: jest.Mock;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenMock = dsMockUtils.createQueryMock('asset', 'frozen');
    });

    it('should return whether the Asset is frozen or not', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await asset.isFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);
      const unsubCallback = 'unsubCallBack';

      frozenMock.mockImplementation(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await asset.isFrozen(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(boolValue);
    });
  });

  describe('method: redeem', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const ticker = 'TICKER';
      const amount = new BigNumber(100);
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { amount, ticker }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const queue = await asset.redeem({ amount });

      expect(queue).toBe(expectedTransaction);
    });
  });

  describe('method: investorCount', () => {
    let ticker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let stringToTickerSpy: jest.SpyInstance;
    let boolToBooleanSpy: jest.SpyInstance<boolean, [bool]>;

    beforeAll(() => {
      ticker = 'TICKER';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
      boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'boolToBoolean');
    });

    beforeEach(() => {
      when(stringToTickerSpy).calledWith(ticker).mockReturnValue(rawTicker);
    });

    it('should return the amount of unique investors that hold the Asset when PUIS is disabled', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createQueryMock('asset', 'disableInvestorUniqueness', {
        returnValue: dsMockUtils.createMockBool(true),
      });

      boolToBooleanSpy.mockReturnValue(true);

      dsMockUtils.createQueryMock('asset', 'balanceOf', {
        entries: [
          tuple(
            [rawTicker, dsMockUtils.createMockIdentityId('0x600')],
            dsMockUtils.createMockBalance(new BigNumber(100))
          ),
          tuple(
            [rawTicker, dsMockUtils.createMockIdentityId('0x500')],
            dsMockUtils.createMockBalance(new BigNumber(100))
          ),
          tuple(
            [rawTicker, dsMockUtils.createMockIdentityId('0x400')],
            dsMockUtils.createMockBalance(new BigNumber(0))
          ),
        ],
      });

      const result = await asset.investorCount();

      expect(result).toEqual(new BigNumber(2));
    });

    it('should return the amount of unique investors that hold the Asset when PUIS is enabled', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createQueryMock('asset', 'disableInvestorUniqueness', {
        returnValue: dsMockUtils.createMockBool(false),
      });

      boolToBooleanSpy.mockReturnValue(false);

      const identityScopes = [
        {
          scopeId: dsMockUtils.createMockIdentityId('someScopeId'),
          identityId: dsMockUtils.createMockIdentityId('someDid'),
          balance: dsMockUtils.createMockBalance(new BigNumber(100)),
        },
        {
          scopeId: dsMockUtils.createMockIdentityId('someScopeId'),
          identityId: dsMockUtils.createMockIdentityId('someOtherDid'),
          balance: dsMockUtils.createMockBalance(new BigNumber(50)),
        },
        {
          scopeId: dsMockUtils.createMockIdentityId('randomScopeId'),
          identityId: dsMockUtils.createMockIdentityId('randomDid'),
          balance: dsMockUtils.createMockBalance(new BigNumber(10)),
        },
        {
          scopeId: dsMockUtils.createMockIdentityId('excludedScopeId'),
          identityId: dsMockUtils.createMockIdentityId('zeroCountDid'),
          balance: dsMockUtils.createMockBalance(new BigNumber(0)),
        },
      ];

      dsMockUtils.createQueryMock('asset', 'scopeIdOf', {
        entries: identityScopes.map(({ identityId, scopeId }) =>
          tuple([rawTicker, identityId], scopeId)
        ),
      });

      dsMockUtils.createQueryMock('asset', 'balanceOfAtScope', {
        entries: identityScopes.map(({ identityId, scopeId, balance }) =>
          tuple([scopeId, identityId], balance)
        ),
      });

      const result = await asset.investorCount();

      expect(result).toEqual(new BigNumber(2));
    });
  });

  describe('method: controllerTransfer', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const ticker = 'TICKER';
      const originPortfolio = 'portfolio';
      const amount = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ticker, originPortfolio, amount }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const queue = await asset.controllerTransfer({ originPortfolio, amount });

      expect(queue).toBe(expectedTransaction);
    });
  });

  describe('method: getOperationHistory', () => {
    it('should return a list of agent operations', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance({ middlewareV2Enabled: false });
      const asset = new Asset({ ticker }, context);

      const did = 'someDid';
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventIndex = new BigNumber(1);
      const datetime = '2020-10-10';

      dsMockUtils.createQueryMock('system', 'blockHash', {
        multi: [dsMockUtils.createMockHash(blockHash)],
      });
      dsMockUtils.createApolloQueryMock(
        tickerExternalAgentHistory({
          ticker,
        }),
        {
          tickerExternalAgentHistory: [
            /* eslint-disable @typescript-eslint/naming-convention */
            {
              did,
              history: [
                {
                  block_id: blockId.toNumber(),
                  datetime,
                  event_idx: eventIndex.toNumber(),
                },
              ],
            },
            /* eslint-enable @typescript-eslint/naming-convention */
          ],
        }
      );

      let result = await asset.getOperationHistory();

      expect(result.length).toEqual(1);
      expect(result[0].identity.did).toEqual(did);
      expect(result[0].history.length).toEqual(1);
      expect(result[0].history[0]).toEqual({
        blockNumber: blockId,
        blockHash,
        blockDate: new Date(`${datetime}Z`),
        eventIndex,
      });

      dsMockUtils.createApolloQueryMock(
        tickerExternalAgentHistory({
          ticker,
        }),
        {
          tickerExternalAgentHistory: [
            {
              did,
              history: [],
            },
          ],
        }
      );

      result = await asset.getOperationHistory();

      expect(result.length).toEqual(1);
      expect(result[0].identity.did).toEqual(did);
      expect(result[0].history.length).toEqual(0);
    });

    it('should call v2 query if middlewareV2 is enabled', async () => {
      const asset = new Asset({ ticker: 'SOME_TICKER' }, dsMockUtils.getContextInstance());
      const fakeResult = 'fakeResult' as unknown as HistoricAgentOperation[];
      jest.spyOn(asset, 'getOperationHistoryV2').mockResolvedValue(fakeResult);

      const result = await asset.getOperationHistory();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getOperationHistoryV2', () => {
    it('should return a list of agent operations', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const did = 'someDid';
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventIndex = new BigNumber(1);
      const datetime = '2020-10-10';

      dsMockUtils.createApolloV2QueryMock(
        tickerExternalAgentHistoryQuery({
          assetId: ticker,
        }),
        {
          tickerExternalAgentHistories: {
            nodes: [
              {
                identityId: did,
                eventIdx: eventIndex.toNumber(),
                createdBlock: {
                  blockId: blockId.toNumber(),
                  datetime,
                  hash: blockHash,
                },
              },
            ],
          },
        }
      );

      let result = await asset.getOperationHistoryV2();

      expect(result.length).toEqual(1);
      expect(result[0].identity.did).toEqual(did);
      expect(result[0].history.length).toEqual(1);
      expect(result[0].history[0]).toEqual({
        blockNumber: blockId,
        blockHash,
        blockDate: new Date(`${datetime}Z`),
        eventIndex,
      });

      dsMockUtils.createApolloV2QueryMock(
        tickerExternalAgentHistoryQuery({
          assetId: ticker,
        }),
        {
          tickerExternalAgentHistories: {
            nodes: [],
          },
        }
      );

      result = await asset.getOperationHistoryV2();

      expect(result.length).toEqual(0);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Asset exists', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      dsMockUtils.createQueryMock('asset', 'tokens', {
        size: new BigNumber(10),
      });

      let result = await asset.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('asset', 'tokens', {
        size: new BigNumber(0),
      });

      result = await asset.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker: 'SOME_TICKER' }, context);

      expect(asset.toHuman()).toBe('SOME_TICKER');
    });
  });

  describe('method: setVenueFiltering', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);
      const enabled = true;

      const args = {
        enabled,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for allowingVenues', async () => {
      const ticker = 'TICKER';
      const venues = [new BigNumber(1), new BigNumber(2)];

      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const args = {
        allowedVenues: venues,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for disallowingVenues', async () => {
      const ticker = 'TICKER';
      const venues = [new BigNumber(1), new BigNumber(2)];

      const context = dsMockUtils.getContextInstance();
      const asset = new Asset({ ticker }, context);

      const args = {
        disallowedVenues: venues,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
