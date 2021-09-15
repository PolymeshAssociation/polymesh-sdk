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
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add a remove corporate agent transaction to the queue', async () => {
    const did = 'someDid';

    entityMockUtils.configureMocks({
      securityTokenOptions: {
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

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawIdentityId);
  });

  test('should throw an error if Corporate Actions Agent list has more than one identity', async () => {
    const args = {
      id,
      ticker,
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetAgents: [
          entityMockUtils.getIdentityInstance({ did: 'did' }),
          entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await expect(prepareRemoveCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'There must be one (and only one) Corporate Actions Agent assigned to this Security Token'
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.RemoveAgent],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
