import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities/SecurityToken';
import {
  getAuthorization,
  Params,
  prepareRemovePrimaryIssuanceAgent,
} from '~/api/procedures/removePrimaryIssuanceAgent';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('removePrimaryIssuanceAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let ticker: string;
  let rawTicker: Ticker;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
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

  test('should add a remove primary issuance agent transaction to the queue', async () => {
    const args = {
      ticker,
    };

    const transaction = dsMockUtils.createTxStub('asset', 'removePrimaryIssuanceAgent');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareRemovePrimaryIssuanceAgent.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
          transactions: [TxTags.asset.RemovePrimaryIssuanceAgent],
          tokens: [new SecurityToken({ ticker }, mockContext)],
          portfolios: [],
        },
      });
    });
  });
});
