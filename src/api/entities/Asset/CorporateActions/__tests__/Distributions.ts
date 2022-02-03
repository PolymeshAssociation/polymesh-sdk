import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  ConfigureDividendDistributionParams,
  DividendDistribution,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

import { Distributions } from '../Distributions';

jest.mock(
  '~/api/entities/DividendDistribution',
  require('~/testUtils/mocks/entities').mockDividendDistributionModule(
    '~/api/entities/DividendDistribution'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Distributions class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Distributions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: configureDividendDistribution', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const distributions = new Distributions(asset, context);

      const args = { foo: 'bar' } as unknown as ConfigureDividendDistributionParams;

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<DividendDistribution>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await distributions.configureDividendDistribution(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getOne', () => {
    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'stringToTicker');
      sinon.stub(utilsConversionModule, 'numberToU32');
    });
    afterAll(() => {
      sinon.restore();
    });

    test('should return the requested Distribution', async () => {
      const ticker = 'SOME_TICKER';
      const id = new BigNumber(1);

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: 'PredictableBenefit',
            targets: {
              identities: ['someDid'],
              treatment: 'Exclude',
            },
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: 0,
            record_date: null,
            default_withholding_tax: 3,
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
      });
      dsMockUtils.createQueryStub('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockText('something'),
      });
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { did: 'someDid', kind: 'Default' },
            currency: 'CLP',
            /* eslint-disable @typescript-eslint/naming-convention */
            per_share: 1000000000,
            amount: 100000000000,
            remaining: 5000000000,
            reclaimed: false,
            payment_at: 10000000000,
            expires_at: null,
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
      });

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance({ ticker });

      const target = new Distributions(asset, context);

      const { distribution, details } = await target.getOne({ id });

      expect(distribution.id).toEqual(id);
      expect(distribution.asset.ticker).toBe(ticker);
      expect(distribution instanceof DividendDistribution).toBe(true);
      expect(details.fundsReclaimed).toBe(false);
      expect(details.remainingFunds).toEqual(new BigNumber(5000));
    });

    test('should throw an error if the Distribution does not exist', async () => {
      const ticker = 'SOME_TICKER';
      const id = new BigNumber(1);

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: 'PredictableBenefit',
            targets: {
              identities: ['someDid'],
              treatment: 'Exclude',
            },
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: 0,
            record_date: null,
            default_withholding_tax: 3,
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
      });
      dsMockUtils.createQueryStub('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockText('something'),
      });
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance({ ticker });

      const target = new Distributions(asset, context);

      await expect(target.getOne({ id })).rejects.toThrow(
        'The Dividend Distribution does not exist'
      );

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(),
      });
      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { did: 'someDid', kind: 'Default' },
            currency: 'CLP',
            /* eslint-disable @typescript-eslint/naming-convention */
            per_share: 1000,
            amount: 100000,
            remaining: 5000,
            reclaimed: false,
            payment_at: 100000000,
            expires_at: null,
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
      });

      return expect(target.getOne({ id })).rejects.toThrow(
        'The Dividend Distribution does not exist'
      );
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all distributions associated to the Asset', async () => {
      const ticker = 'SOME_TICKER';

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance({ ticker });

      context.getDividendDistributionsForAssets
        .withArgs({ assets: [asset] })
        .resolves('distributions');

      const target = new Distributions(asset, context);

      const result = await target.get();

      expect(result).toBe('distributions');
    });
  });
});
