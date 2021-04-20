import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Namespace, SecurityToken, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TargetTreatment } from '~/types';
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
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
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
    procedureMockUtils.initMocks();

    ticker = 'SOME_TICKER';

    sinon
      .stub(utilsConversionModule, 'stringToTicker')
      .withArgs(ticker, context)
      .returns(rawTicker);
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    token = entityMockUtils.getSecurityTokenInstance();
    corporateActions = new CorporateActions(token, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(CorporateActions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: modifyCorporateActionAgent', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const target = 'someDid';

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, target }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await corporateActions.setAgent({ target });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: removeAgent', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: 'SOME_TICKER' }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await corporateActions.removeAgent();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: remove', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;
      const corporateAction = new BigNumber(100);

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { corporateAction, ticker: 'SOME_TICKER' }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const queue = await corporateActions.remove({ corporateAction });

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

  describe('method: getDefaults', () => {
    test("should retrieve the Security Token's Corporate Actions defaults", async () => {
      const dids = ['someDid', 'otherDid'];
      const targets = {
        identities: [
          entityMockUtils.getIdentityInstance({ did: dids[0] }),
          entityMockUtils.getIdentityInstance({ did: dids[1] }),
        ],
        treatment: TargetTreatment.Include,
      };
      const defaultTaxWithholding = new BigNumber(10);
      const taxWithholdings = [{ identity: targets.identities[0], percentage: new BigNumber(15) }];

      dsMockUtils.createQueryStub('corporateAction', 'defaultTargetIdentities');
      dsMockUtils.createQueryStub('corporateAction', 'defaultWithholdingTax');
      dsMockUtils.createQueryStub('corporateAction', 'didWithholdingTax');

      dsMockUtils.getQueryMultiStub().resolves([
        dsMockUtils.createMockTargetIdentities({
          identities: dids,
          treatment: 'Include',
        }),
        dsMockUtils.createMockPermill(10 * 10000),
        [[dsMockUtils.createMockIdentityId(dids[0]), dsMockUtils.createMockPermill(15 * 10000)]],
      ]);

      const result = await corporateActions.getDefaults();

      expect(result).toEqual({
        targets,
        defaultTaxWithholding,
        taxWithholdings,
      });
    });
  });
});
