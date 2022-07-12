import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('controllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToPortfolioStub: sinon.SinonStub<
    [PortfolioId, Context],
    DefaultPortfolio | NumberedPortfolio
  >;
  let bigNumberToBalanceStub: sinon.SinonStub<
    [BigNumber, Context, (boolean | undefined)?],
    Balance
  >;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let did: string;
  let rawPortfolioId: MeshPortfolioId;
  let originPortfolio: DefaultPortfolio;
  let rawAmount: Balance;
  let amount: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToPortfolioStub = sinon.stub(utilsConversionModule, 'portfolioIdToPortfolio');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
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

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
    portfolioIdToPortfolioStub.returns(originPortfolio);
    bigNumberToBalanceStub.returns(rawAmount);
    portfolioIdToMeshPortfolioIdStub.returns(rawPortfolioId);
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

  it('should add a controller transfer transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
    });

    const transaction = dsMockUtils.createTxStub('asset', 'controllerTransfer');

    await prepareControllerTransfer.call(proc, {
      ticker,
      originPortfolio,
      amount,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawTicker, rawAmount, rawPortfolioId],
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
