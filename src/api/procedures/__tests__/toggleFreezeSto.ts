import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareToggleFreezeSto } from '~/api/procedures/toggleFreezeSto';
import { Context, Sto } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, StoStatus } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);

describe('toggleFreezeSto procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let ticker: string;
  let rawTicker: Ticker;
  let id: BigNumber;
  let rawId: u64;
  let sto: Sto;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    ticker = 'tickerFrozen';
    id = new BigNumber(1);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawId = dsMockUtils.createMockU64(id.toNumber());
    sto = new Sto({ ticker, id }, mockContext);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToU64Stub.withArgs(id, mockContext).returns(rawId);
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

  test('should throw an error if freeze is set to true and the STO is already frozen', () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Frozen,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Sto>(mockContext);

    return expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The STO is already frozen');
  });

  test('should throw an error if freeze is set to false and the STO status is live or close', () => {
    const proc = procedureMockUtils.getInstance<Params, Sto>(mockContext);

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
        },
      },
    });

    expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The STO is already unfrozen');

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Closed,
        },
      },
    });

    expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The STO is already closed');
  });

  test('should add a freeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, Sto>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'freezeFundraiser');

    const result = await prepareToggleFreezeSto.call(proc, {
      ticker,
      id,
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawId);

    expect(sto.ticker).toBe(result.ticker);
  });

  test('should add a unfreeze transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      securityTokenOptions: {
        isFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Sto>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'unfreezeFundraiser');

    const result = await prepareToggleFreezeSto.call(proc, {
      ticker,
      id,
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawId);

    expect(sto.ticker).toBe(result.ticker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Sto>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker });
      const identityRoles = [{ type: RoleType.TokenPia, ticker }];

      expect(boundFunc({ ticker, id, freeze: true })).toEqual({
        identityRoles,
        signerPermissions: {
          transactions: [TxTags.sto.FreezeFundraiser],
          tokens: [token],
          portfolios: [],
        },
      });

      expect(boundFunc({ ticker, id, freeze: false })).toEqual({
        identityRoles,
        signerPermissions: {
          transactions: [TxTags.sto.UnfreezeFundraiser],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
