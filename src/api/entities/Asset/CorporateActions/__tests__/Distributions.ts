import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { DividendDistribution, Namespace, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ConfigureDividendDistributionParams } from '~/types';
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
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Distributions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: configureDividendDistribution', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
      sinon.stub(utilsConversionModule, 'bigNumberToU32');
    });
    afterAll(() => {
      sinon.restore();
    });

    it('should return the requested Distribution', async () => {
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
            decl_date: new BigNumber(0),
            record_date: null,
            default_withholding_tax: new BigNumber(3),
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
            perShare: new BigNumber(1000000000),
            amount: new BigNumber(100000000000),
            remaining: new BigNumber(5000000000),
            reclaimed: false,
            paymentAt: new BigNumber(10000000000),
            expiresAt: null,
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

    it('should throw an error if the Distribution does not exist', async () => {
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
            decl_date: new BigNumber(0),
            record_date: null,
            default_withholding_tax: new BigNumber(3),
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
            perShare: new BigNumber(1000),
            amount: new BigNumber(100000),
            remaining: new BigNumber(5000),
            reclaimed: false,
            paymentAt: new BigNumber(100000000),
            expiresAt: null,
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

    it('should return all distributions associated to the Asset', async () => {
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
