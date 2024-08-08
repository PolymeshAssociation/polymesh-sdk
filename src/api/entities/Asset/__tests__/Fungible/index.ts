import { bool, Bytes, Option } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PalletAssetSecurityToken,
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesAssetIdentifier,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Context,
  DefaultPortfolio,
  Entity,
  FungibleAsset,
  NumberedPortfolio,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import { assetQuery, assetTransactionQuery } from '~/middleware/queries/assets';
import { tickerExternalAgentHistoryQuery } from '~/middleware/queries/externalAgents';
import { EventIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode, SecurityIdentifier, SecurityIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Fungible class', () => {
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
    expect(FungibleAsset.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign assetId to instance', () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      expect(asset.id).toBe(assetId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(FungibleAsset.isUniqueIdentifiers({ assetId: '0x1234' })).toBe(true);
      expect(FungibleAsset.isUniqueIdentifiers({})).toBe(false);
      expect(FungibleAsset.isUniqueIdentifiers({ assetId: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    let assetId: string;
    let name: string;
    let totalSupply: BigNumber;
    let isDivisible: boolean;
    let owner: string;
    let assetType: 'EquityCommon';
    let did: string;

    let rawToken: Option<PalletAssetSecurityToken>;
    let rawName: Option<Bytes>;

    let context: Context;
    let asset: FungibleAsset;

    beforeAll(() => {
      assetId = '0x1234';
      name = 'tokenName';
      totalSupply = new BigNumber(1000);
      isDivisible = true;
      owner = '0x0wn3r';
      assetType = 'EquityCommon';
      did = 'someDid';
      bytesToStringSpy = jest.spyOn(utilsConversionModule, 'bytesToString');
    });

    beforeEach(() => {
      rawToken = dsMockUtils.createMockOption(
        dsMockUtils.createMockSecurityToken({
          ownerDid: dsMockUtils.createMockIdentityId(owner),
          assetType: dsMockUtils.createMockAssetType(assetType),
          divisible: dsMockUtils.createMockBool(isDivisible),
          totalSupply: dsMockUtils.createMockBalance(totalSupply),
        })
      );
      rawName = dsMockUtils.createMockOption(dsMockUtils.createMockBytes(name));
      context = dsMockUtils.getContextInstance();
      asset = new FungibleAsset({ assetId }, context);

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1PIA'))
          ),
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId(owner)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('ExceptMeta'))
          ),
        ],
      });
      dsMockUtils.createQueryMock('asset', 'assetNames', {
        returnValue: rawName,
      });
    });

    it('should return details for an Asset', async () => {
      const tokensMock = dsMockUtils.createQueryMock('asset', 'securityTokens', {
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

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
        ],
      });

      details = await asset.details();
      expect(details.fullAgents[0].did).toEqual(did);

      tokensMock.mockResolvedValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockSecurityToken({
            ownerDid: dsMockUtils.createMockIdentityId(owner),
            assetType: dsMockUtils.createMockAssetType({
              Custom: dsMockUtils.createMockU32(new BigNumber(10)),
            }),
            divisible: dsMockUtils.createMockBool(isDivisible),
            totalSupply: dsMockUtils.createMockBalance(totalSupply),
          })
        )
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

    it('should throw if asset was not found', () => {
      const tokensMock = dsMockUtils.createQueryMock('asset', 'securityTokens', {
        returnValue: dsMockUtils.createMockOption(),
      });
      tokensMock.mockResolvedValue(dsMockUtils.createMockOption());

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Asset detail information not found',
      });

      return expect(asset.details()).rejects.toThrow(expectedError);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawToken as any).primaryIssuanceAgent = dsMockUtils.createMockOption();

      dsMockUtils
        .createQueryMock('asset', 'securityTokens')
        .mockImplementation(async (_, cbFunc) => {
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
        })
      );
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
        expiry,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: addRequiredMediators', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
      const args = {
        asset,
        mediators: ['newDid'],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.addRequiredMediators(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: removeRequiredMediators', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
      const args = {
        asset,
        mediators: ['currentDid'],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.removeRequiredMediators(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modify', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
      const makeDivisible = true as const;

      const args = {
        makeDivisible,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.modify(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: currentFundingRound', () => {
    let assetId: string;
    let fundingRound: string;
    let rawFundingRound: Bytes;

    let context: Context;
    let asset: FungibleAsset;

    beforeAll(() => {
      assetId = '0x1234';
      fundingRound = 'Series A';
    });

    beforeEach(() => {
      rawFundingRound = dsMockUtils.createMockBytes(fundingRound);
      context = dsMockUtils.getContextInstance();
      asset = new FungibleAsset({ assetId }, context);
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
    let assetId: string;
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
    let asset: FungibleAsset;

    beforeAll(() => {
      assetId = 'TEST';
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
      asset = new FungibleAsset({ assetId }, context);
    });

    it('should return the list of security identifiers for an Asset', async () => {
      dsMockUtils.createQueryMock('asset', 'assetIdentifiers', {
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

      dsMockUtils
        .createQueryMock('asset', 'assetIdentifiers')
        .mockImplementation(async (_, cbFunc) => {
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
    it('should return the event identifier object of the Asset creation', async () => {
      const assetId = '0x1234';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        id: assetId,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
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

      const result = await asset.createdAt();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const assetId = '0x1234';
      const variables = {
        id: assetId,
      };
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
        assets: {
          nodes: [],
        },
      });
      const result = await asset.createdAt();
      expect(result).toBeNull();
    });
  });

  describe('method: freeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, freeze: true }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.freeze();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: unfreeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, freeze: false }, transformer: undefined }, context, {})
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
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await asset.isFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
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
      const assetId = '0x1234';
      const amount = new BigNumber(100);
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { amount, asset }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const queue = await asset.redeem({ amount });

      expect(queue).toBe(expectedTransaction);
    });
  });

  describe('method: investorCount', () => {
    let assetId: string;
    let rawAssetId: PolymeshPrimitivesAssetAssetID;
    let stringToAssetIdSpy: jest.SpyInstance;
    let boolToBooleanSpy: jest.SpyInstance<boolean, [bool]>;

    beforeAll(() => {
      assetId = '0x1234';
      rawAssetId = dsMockUtils.createMockAssetId(assetId);
      stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
      boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'boolToBoolean');
    });

    beforeEach(() => {
      when(stringToAssetIdSpy).calledWith(assetId).mockReturnValue(rawAssetId);
    });

    it('should return the amount of unique investors that hold the Asset when PUIS is disabled', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      boolToBooleanSpy.mockReturnValue(true);

      dsMockUtils.createQueryMock('asset', 'balanceOf', {
        entries: [
          tuple(
            [rawAssetId, dsMockUtils.createMockIdentityId('0x600')],
            dsMockUtils.createMockBalance(new BigNumber(100))
          ),
          tuple(
            [rawAssetId, dsMockUtils.createMockIdentityId('0x500')],
            dsMockUtils.createMockBalance(new BigNumber(100))
          ),
          tuple(
            [rawAssetId, dsMockUtils.createMockIdentityId('0x400')],
            dsMockUtils.createMockBalance(new BigNumber(0))
          ),
        ],
      });

      const result = await asset.investorCount();

      expect(result).toEqual(new BigNumber(2));
    });
  });

  describe('method: controllerTransfer', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x1234';
      const originPortfolio = 'portfolio';
      const amount = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { asset, originPortfolio, amount }, transformer: undefined },
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
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const did = 'someDid';
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventIndex = new BigNumber(1);
      const datetime = '2020-10-10';

      dsMockUtils.createApolloQueryMock(
        tickerExternalAgentHistoryQuery({
          assetId,
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
        tickerExternalAgentHistoryQuery({
          assetId,
        }),
        {
          tickerExternalAgentHistories: {
            nodes: [],
          },
        }
      );

      result = await asset.getOperationHistory();

      expect(result.length).toEqual(0);
    });
  });

  describe('method: getTransactionHistory', () => {
    it('should return the list of asset transactions', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);
      const transactionResponse = {
        totalCount: new BigNumber(5),
        nodes: [
          {
            assetId,
            amount: new BigNumber(100).shiftedBy(6),
            eventId: EventIdEnum.Issued,
            toPortfolioId: 'SOME_DID/0',
            fromPortfolioId: null,
            eventIdx: 1,
            extrinsicIdx: 1,
            createdBlock: {
              blockId: new BigNumber(123),
              hash: 'SOME_HASH',
              datetime: new Date('2022/12/31'),
            },
          },
          {
            assetId,
            amount: new BigNumber(1).shiftedBy(6),
            eventId: EventIdEnum.Redeemed,
            fromPortfolioId: 'SOME_DID/0',
            toPortfolioId: null,
            eventIdx: 1,
            extrinsicIdx: 1,
            createdBlock: {
              blockId: new BigNumber(123),
              hash: 'SOME_HASH',
              datetime: new Date('2022/12/31'),
            },
          },
          {
            assetId,
            amount: new BigNumber(10).shiftedBy(6),
            eventId: EventIdEnum.Transfer,
            fromPortfolioId: 'SOME_DID/0',
            toPortfolioId: 'SOME_OTHER_DID/1',
            instructionId: '2',
            instructionMemo: 'Some memo',
            eventIdx: 1,
            extrinsicIdx: 1,
            createdBlock: {
              blockId: new BigNumber(123),
              hash: 'SOME_HASH',
              datetime: new Date('2022/12/31'),
            },
          },
        ],
      };

      dsMockUtils.createApolloQueryMock(
        assetTransactionQuery({ assetId }, new BigNumber(3), new BigNumber(0)),
        {
          assetTransactions: transactionResponse,
        }
      );

      const result = await asset.getTransactionHistory({
        size: new BigNumber(3),
        start: new BigNumber(0),
      });

      expect(result.data[0].asset.id).toEqual(assetId);
      expect(result.data[0].amount).toEqual(new BigNumber(100));
      expect(result.data[0].event).toEqual(transactionResponse.nodes[0].eventId);
      expect(result.data[0].from).toBeNull();
      expect(result.data[0].to instanceof DefaultPortfolio).toBe(true);

      expect(result.data[1].asset.id).toEqual(assetId);
      expect(result.data[1].amount).toEqual(new BigNumber(1));
      expect(result.data[1].event).toEqual(transactionResponse.nodes[1].eventId);
      expect(result.data[1].to).toBeNull();
      expect(result.data[1].from).toBeInstanceOf(DefaultPortfolio);

      expect(result.data[2].asset.id).toEqual(assetId);
      expect(result.data[2].amount).toEqual(new BigNumber(10));
      expect(result.data[2].event).toEqual(transactionResponse.nodes[2].eventId);
      expect(result.data[2].from).toBeInstanceOf(DefaultPortfolio);
      expect(result.data[2].to).toBeInstanceOf(NumberedPortfolio);
      expect(result.data[2].instructionId).toEqual(new BigNumber(2));
      expect(result.data[2].instructionMemo).toEqual('Some memo');

      expect(result.count).toEqual(transactionResponse.totalCount);
      expect(result.next).toEqual(new BigNumber(3));
    });
  });

  describe('method: exists', () => {
    it('should return whether the Asset exists', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      dsMockUtils.createQueryMock('asset', 'securityTokens', {
        size: new BigNumber(10),
      });

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      let result = await asset.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(2)),
      });

      result = await asset.exists();

      expect(result).toBe(false);

      dsMockUtils.createQueryMock('asset', 'securityTokens', {
        size: new BigNumber(0),
      });

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      result = await asset.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId: '0x1234' }, context);

      expect(asset.toHuman()).toBe('0x1234');
    });
  });

  describe('method: getRequiredMediators', () => {
    it('should return the required mediators', async () => {
      dsMockUtils.createQueryMock('asset', 'mandatoryMediators', {
        returnValue: [dsMockUtils.createMockIdentityId('someDid')],
      });

      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new FungibleAsset({ assetId }, context);

      const result = await asset.getRequiredMediators();

      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ did: 'someDid' })]));
    });
  });
});
