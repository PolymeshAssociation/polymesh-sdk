import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareReclaimDividendDistributionFunds,
} from '~/api/procedures/reclaimDividendDistributionFunds';
import { Context, DividendDistribution } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { DefaultPortfolio, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('reclaimDividendDistributionFunds procedure', () => {
  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);
  const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
  const did = 'someDid';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });

  let origin: DefaultPortfolio;
  let distribution: DividendDistribution;

  let mockContext: Mocked<Context>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    origin = entityMockUtils.getDefaultPortfolioInstance({
      did,
    });
    distribution = entityMockUtils.getDividendDistributionInstance({
      origin,
      ticker,
      id,
      expiryDate,
    });
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

  test('should throw an error if the Distribution is not expired', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareReclaimDividendDistributionFunds.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution must be expired');
    expect(err.data.expiryDate).toEqual(expiryDate);
  });

  test('should throw an error if the Distribution was already reclaimed', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareReclaimDividendDistributionFunds.call(proc, {
        distribution: entityMockUtils.getDividendDistributionInstance({
          origin,
          ticker,
          id,
          expiryDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365),
          details: {
            fundsReclaimed: true,
          },
        }),
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Distribution funds have already been reclaimed');
  });

  test('should add a reclaim transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('capitalDistribution', 'reclaim');

    await prepareReclaimDividendDistributionFunds.call(proc, {
      distribution: entityMockUtils.getDividendDistributionInstance({
        origin,
        ticker,
        id,
      }),
    });

    sinon.assert.calledWith(procedureMockUtils.getAddTransactionStub(), {
      transaction,
      args: [rawCaId],
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      const params = {
        distribution: {
          origin,
          asset: { ticker },
        },
      } as unknown as Params;

      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc(params);

      expect(result).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId: { did } }],
        permissions: {
          transactions: [TxTags.capitalDistribution.Reclaim],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }) })],
        },
      });
    });
  });
});
