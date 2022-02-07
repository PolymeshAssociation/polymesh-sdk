import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  IssueAssetsParams,
  prepareIssueAssets,
  prepareStorage,
  Storage,
} from '~/api/procedures/issueAssets';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('issueAssets procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let bigNumberToBalance: sinon.SinonStub;
  let ticker: string;
  let asset: Asset;
  let rawTicker: Ticker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToBalance = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    ticker = 'someTicker';
    asset = entityMockUtils.getAssetInstance({ ticker });
    rawTicker = dsMockUtils.createMockTicker(ticker);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  describe('prepareStorage', () => {
    test('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<IssueAssetsParams, Asset, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
        ticker,
        amount: new BigNumber(10),
      });

      expect(result).toEqual({
        asset,
      });
    });
  });

  test('should throw an error if Asset supply is bigger than the limit total supply', async () => {
    const args = {
      amount,
      ticker,
    };

    const limitTotalSupply = new BigNumber(Math.pow(10, 12));

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          totalSupply: limitTotalSupply,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<IssueAssetsParams, Asset, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance(),
    });

    let error;

    try {
      await prepareIssueAssets.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`
    );
    expect(error.data).toMatchObject({
      currentSupply: limitTotalSupply,
      supplyLimit: limitTotalSupply,
    });
  });

  test('should add a issue transaction to the queue', async () => {
    const isDivisible = true;
    const args = {
      amount,
      ticker,
    };

    entityMockUtils.configureMocks({
      assetOptions: {
        ticker,
        details: {
          isDivisible,
          primaryIssuanceAgents: [entityMockUtils.getIdentityInstance()],
        },
      },
    });

    bigNumberToBalance.withArgs(amount, mockContext, isDivisible).returns(rawAmount);

    const transaction = dsMockUtils.createTxStub('asset', 'issue');
    const proc = procedureMockUtils.getInstance<IssueAssetsParams, Asset, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance(),
    });

    const result = await prepareIssueAssets.call(proc, args);
    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawAmount] });
    expect(result.ticker).toBe(ticker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<IssueAssetsParams, Asset, Storage>(mockContext, {
        asset: entityMockUtils.getAssetInstance({ ticker }),
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.asset.Issue],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
