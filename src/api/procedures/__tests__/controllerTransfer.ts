import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareControllerTransfer,
  prepareStorage,
  Storage,
} from '~/api/procedures/controllerTransfer';
import { Context, DefaultPortfolio, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, PortfolioId, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('controllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToPortfolioSpy: jest.SpyInstance<
    DefaultPortfolio | NumberedPortfolio,
    [PortfolioId, Context]
  >;
  let bigNumberToBalanceSpy: jest.SpyInstance<
    Balance,
    [BigNumber, Context, (boolean | undefined)?]
  >;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let did: string;
  let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
  let originPortfolio: DefaultPortfolio;
  let rawAmount: Balance;
  let amount: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToPortfolioSpy = jest.spyOn(utilsConversionModule, 'portfolioIdToPortfolio');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    did = 'fakeDid';
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did,
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });
    amount = new BigNumber(50);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerSpy.mockReturnValue(rawTicker);
    portfolioIdToPortfolioSpy.mockReturnValue(originPortfolio);
    bigNumberToBalanceSpy.mockReturnValue(rawAmount);
    portfolioIdToMeshPortfolioIdSpy.mockReturnValue(rawPortfolioId);
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

  it('should throw an error in case of self Transfer', () => {
    const selfPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: 'someDid',
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
    });

    return expect(
      prepareControllerTransfer.call(proc, {
        ticker,
        originPortfolio: selfPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('Controller transfers to self are not allowed');
  });

  it('should throw an error if the Portfolio does not have enough balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
    });

    return expect(
      prepareControllerTransfer.call(proc, {
        ticker,
        originPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('The origin Portfolio does not have enough free balance for this transfer');
  });

  it('should return a controller transfer transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
    });

    const transaction = dsMockUtils.createTxMock('asset', 'controllerTransfer');

    const result = await prepareControllerTransfer.call(proc, {
      ticker,
      originPortfolio,
      amount,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawAmount, rawPortfolioId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const portfolioId = { did: 'oneDid' };

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        did: 'oneDid',
      });
      const boundFunc = getAuthorization.bind(proc);

      const roles = [
        {
          type: RoleType.PortfolioCustodian,
          portfolioId,
        },
      ];

      expect(await boundFunc({ ticker, originPortfolio, amount })).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.asset.ControllerTransfer],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: portfolioId.did }) }),
          ],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the DID of signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const result = await boundFunc();

      expect(result).toEqual({
        did: 'someDid',
      });
    });
  });
});
