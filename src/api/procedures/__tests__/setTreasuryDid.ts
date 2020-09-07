import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { getRequiredRoles, Params, prepareSetTreasuryDid } from '~/api/procedures/setTreasuryDid';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';

describe('setTreasuryDid procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let ticker: string;
  let rawTicker: Ticker;
  let did: string;
  let rawTreasuryDid: IdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    ticker = 'tickerFrozen';
    did = 'someDid';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawTreasuryDid = dsMockUtils.createMockIdentityId(did);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToIdentityIdStub.withArgs(did, mockContext).returns(rawTreasuryDid);
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

  test('should add a set treasury did transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'setTreasuryDid');

    await prepareSetTreasuryDid.call(proc, {
      ticker,
      target: did,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawTreasuryDid);

    await prepareSetTreasuryDid.call(proc, {
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, null);
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
