import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveCorporateActionsAgent,
} from '~/api/procedures/removeCorporateActionsAgent';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('removeCorporateActionsAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let ticker: string;
  let addTransactionStub: sinon.SinonStub;
  let id: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'someTicker';
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
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

  it('should add a remove corporate agent transaction to the queue', async () => {
    const did = 'someDid';

    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [entityMockUtils.getIdentityInstance({ did })],
      },
    });

    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawIdentityId = dsMockUtils.createMockIdentityId(did);

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
    sinon.stub(utilsConversionModule, 'stringToIdentityId').returns(rawIdentityId);

    const transaction = dsMockUtils.createTxStub('externalAgents', 'removeAgent');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareRemoveCorporateActionsAgent.call(proc, { ticker });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawIdentityId] });
  });

  it('should throw an error if Corporate Actions Agent list has more than one Identity', () => {
    const args = {
      id,
      ticker,
    };

    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [
          entityMockUtils.getIdentityInstance({ did: 'did' }),
          entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'There must be one (and only one) Corporate Actions Agent assigned to this Asset'
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
