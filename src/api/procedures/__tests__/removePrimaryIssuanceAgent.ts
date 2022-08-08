import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemovePrimaryIssuanceAgent,
} from '~/api/procedures/removePrimaryIssuanceAgent';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('removePrimaryIssuanceAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;
  let ticker: string;
  let did: string;
  let rawTicker: Ticker;
  let rawIdentityId: IdentityId;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    did = 'someDid';
    rawIdentityId = dsMockUtils.createMockIdentityId(did);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
    stringToIdentityIdStub.returns(rawIdentityId);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  it('should add a remove primary issuance agent transaction to the queue', async () => {
    const args = {
      ticker,
    };

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          primaryIssuanceAgents: [entityMockUtils.getIdentityInstance({ did })],
        },
      },
    });

    const transaction = dsMockUtils.createTxStub('externalAgents', 'removeAgent');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareRemovePrimaryIssuanceAgent.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawIdentityId] });
  });

  it('should throw an error if primary issuance agent list has more than one Identity', () => {
    const args = {
      ticker,
    };

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          primaryIssuanceAgents: [
            entityMockUtils.getIdentityInstance({ did: 'did' }),
            entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
          ],
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemovePrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'There must be one (and only one) Primary Issuance Agent assigned to this Asset'
    );
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.RemoveAgent],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
