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
import { RoleType } from '~/types';
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
    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetAgent: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
        },
      },
    });

    const rawTicker = dsMockUtils.createMockTicker(ticker);

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'resetCaa');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareRemoveCorporateActionsAgent.call(proc, { ticker });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);
  });

  test('should throw an error if attempting to remove the asset owner', async () => {
    const args = {
      id,
      ticker,
    };
    const did = 'someDid';
    const identity = entityMockUtils.getIdentityInstance({ did });

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetAgent: identity,
        details: {
          owner: identity,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await expect(prepareRemoveCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'You cannot remove the corporate actions agent'
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
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
          transactions: [TxTags.corporateAction.ResetCaa],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
