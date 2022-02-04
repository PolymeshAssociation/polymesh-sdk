import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveCorporateAction,
} from '~/api/procedures/removeCorporateAction';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/CorporateAction',
  require('~/testUtils/mocks/entities').mockCorporateActionModule('~/api/entities/CorporateAction')
);

describe('removeCorporateAction procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let corporateActionsQueryStub: sinon.SinonStub;

  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    corporateActionsQueryStub = dsMockUtils.createQueryStub('corporateAction', 'corporateActions');
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

  test("should throw an error if the Corporate Action is a Distribution and it doesn't exist", () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getDividendDistributionInstance(),
        ticker,
      })
    ).rejects.toThrow("The Distribution doesn't exist");
  });

  test("should throw an error if the Corporate Action is not a Distribution and the Corporate Action doesn't exist", () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(),
    });

    corporateActionsQueryStub.returns(dsMockUtils.createMockOption());

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: new BigNumber(1),
        ticker,
      })
    ).rejects.toThrow("The Corporate Action doesn't exist");
  });

  test('should throw an error if the distribution has already started', () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          /* eslint-disable @typescript-eslint/naming-convention */
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          per_share: 20000000,
          amount: 50000000000,
          remaining: 40000000000,
          payment_at: new Date('1/1/2020').getTime(),
          expires_at: null,
          reclaimed: false,
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getDividendDistributionInstance(),
        ticker,
      })
    ).rejects.toThrow('The Distribution has already started');
  });

  test('should throw an error if the corporate action does not exist', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getCorporateActionInstance({
          exists: false,
        }),
        ticker,
      })
    ).rejects.toThrow("The Corporate Action doesn't exist");
  });

  test('should add a remove corporate agent transaction to the queue', async () => {
    const transaction = dsMockUtils.createTxStub('corporateAction', 'removeCa');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareRemoveCorporateAction.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        exists: true,
      }),
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawCaId] });

    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          /* eslint-disable @typescript-eslint/naming-convention */
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          per_share: 20000000,
          amount: 50000000000,
          remaining: 40000000000,
          payment_at: new Date('10/10/2030').getTime(),
          expires_at: null,
          reclaimed: false,
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });

    await prepareRemoveCorporateAction.call(proc, {
      corporateAction: entityMockUtils.getDividendDistributionInstance(),
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawCaId] });

    corporateActionsQueryStub.returns(
      dsMockUtils.createMockOption(dsMockUtils.createMockCorporateAction())
    );

    await prepareRemoveCorporateAction.call(proc, {
      corporateAction: new BigNumber(1),
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawCaId] });
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
          transactions: [TxTags.corporateAction.RemoveCa],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
