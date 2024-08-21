import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Portfolios } from '~/api/entities/Identity/Portfolios';
import {
  Context,
  DefaultPortfolio,
  Identity,
  Namespace,
  NumberedPortfolio,
  PolymeshTransaction,
} from '~/internal';
import { portfoliosMovementsQuery } from '~/middleware/queries/portfolios';
import { settlementsForAllPortfoliosQuery } from '~/middleware/queries/settlements';
import { InstructionStatusEnum, LegTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { FungibleLeg, SettlementDirectionEnum } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Portfolios class', () => {
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const numberedPortfolioId = new BigNumber(1);
  const rawNumberedPortfolioId = dsMockUtils.createMockU64(numberedPortfolioId);
  let mockContext: Mocked<Context>;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let u64ToBigNumberSpy: jest.SpyInstance<BigNumber, [u64]>;
  let portfolios: Portfolios;
  let identity: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    identity = new Identity({ did }, mockContext);
    portfolios = new Portfolios(identity, mockContext);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getPortfolios', () => {
    it('should retrieve all the portfolios for the Identity', async () => {
      dsMockUtils.createQueryMock('portfolio', 'portfolios', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), rawNumberedPortfolioId],
            dsMockUtils.createMockBytes()
          ),
        ],
      });

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);
      u64ToBigNumberSpy.mockReturnValue(numberedPortfolioId);

      const result = await portfolios.getPortfolios();
      expect(result).toHaveLength(2);
      expect(result[0] instanceof DefaultPortfolio).toBe(true);
      expect(result[1] instanceof NumberedPortfolio).toBe(true);
      expect(result[0].owner.did).toEqual(did);
      expect(result[1].id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getCustodiedPortfolios', () => {
    it('should retrieve all the Portfolios custodied by the Identity', async () => {
      dsMockUtils.createQueryMock('portfolio', 'portfoliosInCustody');

      const entries = [
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind('Default'),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind({ User: rawNumberedPortfolioId }),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
      ];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockResolvedValue({ entries, lastKey: null });

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);
      u64ToBigNumberSpy.mockReturnValue(numberedPortfolioId);

      const { data } = await portfolios.getCustodiedPortfolios();
      expect(data).toHaveLength(2);
      expect(data[0] instanceof DefaultPortfolio).toBe(true);
      expect(data[1] instanceof NumberedPortfolio).toBe(true);
      expect(data[0].owner.did).toEqual(did);
      expect((data[1] as NumberedPortfolio).id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getPortfolio', () => {
    it('should return the default portfolio for the signing Identity', async () => {
      const result = await portfolios.getPortfolio();
      expect(result instanceof DefaultPortfolio).toBe(true);
      expect(result.owner.did).toEqual(did);
    });

    it('should return a numbered portfolio', async () => {
      const portfolioId = new BigNumber(1);

      const result = await portfolios.getPortfolio({ portfolioId });

      expect(result instanceof NumberedPortfolio).toBe(true);
      expect(result.id).toEqual(portfolioId);
    });

    it("should throw an error if a numbered portfolio doesn't exist", () => {
      const portfolioId = new BigNumber(1);

      entityMockUtils.configureMocks({
        numberedPortfolioOptions: {
          exists: false,
        },
      });

      return expect(portfolios.getPortfolio({ portfolioId })).rejects.toThrow(
        "The Portfolio doesn't exist"
      );
    });
  });

  describe('method: delete', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolioId = new BigNumber(5);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { id: portfolioId, did }, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      let tx = await portfolios.delete({ portfolio: portfolioId });

      expect(tx).toBe(expectedTransaction);

      tx = await portfolios.delete({
        portfolio: new NumberedPortfolio({ id: portfolioId, did }, mockContext),
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getTransactionHistory', () => {
    const account = 'someAccount';

    const blockNumber1 = new BigNumber(1);
    const blockNumber2 = new BigNumber(2);

    const blockHash1 = 'someHash';
    const blockHash2 = 'otherHash';
    const blockHash3 = 'hash3';

    const assetId1 = '0x1111';
    const ticker1 = 'TICKER_1';
    const assetId2 = '0x2222';
    const ticker2 = 'TICKER_2';

    const amount1 = new BigNumber(1000);
    const amount2 = new BigNumber(2000);

    const portfolioDid1 = 'portfolioDid1';
    const portfolioNumber1 = '0';

    const portfolioDid2 = 'someDid';
    const portfolioNumber2 = '1';

    const portfolioId2 = new BigNumber(portfolioNumber2);

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of transactions', async () => {
      const getAssetIdFromMiddlewareSpy = jest.spyOn(
        utilsInternalModule,
        'getAssetIdFromMiddleware'
      );
      when(getAssetIdFromMiddlewareSpy)
        .calledWith(
          {
            id: assetId1,
            ticker: ticker1,
          },
          mockContext
        )
        .mockReturnValue(assetId1);
      when(getAssetIdFromMiddlewareSpy)
        .calledWith(
          {
            id: assetId2,
            ticker: ticker2,
          },
          mockContext
        )
        .mockReturnValue(assetId2);

      const legs1 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: assetId1,
          ticker: ticker1,
          amount: amount1,
          direction: SettlementDirectionEnum.Incoming,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          from: portfolioDid1,
          fromPortfolio: portfolioNumber1,
          toPortfolio: portfolioNumber2,
          to: did,
        },
      ];
      const legs2 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: assetId2,
          ticker: ticker2,
          amount: amount2,
          direction: SettlementDirectionEnum.Outgoing,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          from: did,
          fromPortfolio: portfolioNumber2,
          toPortfolio: portfolioNumber1,
          to: portfolioDid1,
        },
      ];

      const legs3 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: assetId2,
          ticker: ticker2,
          amount: amount2,
          direction: SettlementDirectionEnum.None,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          from: did,
          fromPortfolio: portfolioNumber2,
          toPortfolio: portfolioNumber1,
          to: did,
        },
      ];

      const legs4 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: assetId2,
          ticker: ticker2,
          amount: amount2,
          direction: SettlementDirectionEnum.None,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          from: did,
          fromPortfolio: portfolioNumber1,
          to: did,
          toPortfolio: portfolioNumber1,
        },
      ];

      const settlementsResponse = {
        nodes: [
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber1.toNumber(),
                hash: blockHash1,
              },
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs1 },
            },
          },
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber2.toNumber(),
                hash: blockHash2,
              },
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs2 },
            },
          },
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber2.toNumber(),
                hash: blockHash3,
              },
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs3 },
            },
          },
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber2.toNumber(),
                hash: blockHash3,
              },
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs4 },
            },
          },
        ],
      };

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: settlementsForAllPortfoliosQuery({
            identityId: did,
            address: account,
            assetId: '0x1234',
          }),
          returnData: {
            legs: settlementsResponse,
          },
        },
        {
          query: portfoliosMovementsQuery({
            identityId: did,
            address: account,
            assetId: '0x1234',
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      const getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
      when(getAssetIdForMiddlewareSpy)
        .calledWith('0x1234', mockContext)
        .mockResolvedValue('0x1234');

      let result = await identity.portfolios.getTransactionHistory({
        account,
        assetId: '0x1234',
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[1].blockNumber).toEqual(blockNumber2);
      expect(result[0].blockHash).toBe(blockHash1);
      expect(result[1].blockHash).toBe(blockHash2);
      expect((result[0].legs[0] as FungibleLeg).asset.id).toBe(assetId1);
      expect((result[1].legs[0] as FungibleLeg).asset.id).toBe(assetId2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect((result[1].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid2);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid2);
      expect((result[1].legs[0].from as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).to.owner.did).toEqual(portfolioDid1);
      expect(result[2].legs[0].direction).toEqual(SettlementDirectionEnum.None);
      expect(result[3].legs[0].direction).toEqual(SettlementDirectionEnum.None);

      jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware').mockResolvedValue(assetId2);

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: settlementsForAllPortfoliosQuery({
            identityId: did,
            address: undefined,
            assetId: '0x1234',
          }),
          returnData: {
            legs: {
              nodes: [],
            },
          },
        },
        {
          query: portfoliosMovementsQuery({
            identityId: did,
            address: undefined,
            assetId: '0x1234',
          }),
          returnData: {
            portfolioMovements: {
              nodes: [
                {
                  createdBlock: {
                    blockId: blockNumber1.toNumber(),
                    hash: 'someHash',
                  },
                  asset: {
                    id: assetId2,
                    ticker: ticker2,
                  },
                  amount: amount2,
                  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                  from: {
                    number: portfolioNumber1,
                    identityId: portfolioDid1,
                  },
                  fromId: `${portfolioDid1}/${portfolioNumber1}`,
                  to: {
                    number: portfolioNumber2,
                    identityId: portfolioDid1,
                  },
                  toId: `${portfolioDid1}/${portfolioNumber2}`,
                },
              ],
            },
          },
        },
      ]);

      when(getAssetIdForMiddlewareSpy)
        .calledWith('SOME_TICKER', mockContext)
        .mockResolvedValue('0x1234');

      result = await identity.portfolios.getTransactionHistory({
        ticker: 'SOME_TICKER',
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[0].blockHash).toBe(blockHash1);
      expect((result[0].legs[0] as FungibleLeg).asset.id).toBe(assetId2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
    });
  });
});
