import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Context,
  Namespace,
  removeCorporateActionsAgent,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

import { CorporateActions } from '../';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('CorporateActions class', () => {
  let context: Context;
  let ticker: string;
  let rawTicker: Ticker;
  let token: SecurityToken;
  let corporateActions: CorporateActions;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'TESTTOKEN';

    sinon
      .stub(utilsConversionModule, 'stringToTicker')
      .withArgs(ticker, context)
      .returns(rawTicker);
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();

    context = dsMockUtils.getContextInstance();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    token = entityMockUtils.getSecurityTokenInstance();
    corporateActions = new CorporateActions(token, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(CorporateActions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: removeAgent', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeCorporateActionsAgent, 'prepare')
        .withArgs({ ticker: 'SOME_TICKER' }, context)
        .resolves(expectedQueue);

      const queue = await corporateActions.removeAgent();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getAgent', () => {
    test("should retrieve the Security Token's Corporate Actions agent", async () => {
      const did = 'someDid';
      const identityId = dsMockUtils.createMockIdentityId(did);
      const identity = entityMockUtils.getIdentityInstance({ did });

      dsMockUtils.createQueryStub('corporateAction', 'agent', {
        returnValue: dsMockUtils.createMockOption(identityId),
      });

      let result = await corporateActions.getAgent();

      expect(result).toEqual(identity);

      dsMockUtils.createQueryStub('corporateAction', 'agent', {
        returnValue: dsMockUtils.createMockOption(),
      });

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          details: {
            owner: identity,
          },
        },
      });

      result = await corporateActions.getAgent();

      expect(result).toEqual(identity);
    });
  });
});
