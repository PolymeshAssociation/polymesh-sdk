import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  ConfigureDividendDistributionParams,
  DividendDistribution,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { CorporateActionKind, TargetTreatment } from '~/types';
import { tuple } from '~/types/utils';
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
      const token = entityMockUtils.getSecurityTokenInstance();
      const distributions = new Distributions(token, context);

      const args = ({ foo: 'bar' } as unknown) as ConfigureDividendDistributionParams;

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<DividendDistribution>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: token.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await distributions.configureDividendDistribution(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all distributions associated to the token', async () => {
      const ticker = 'SOME_TICKER';
      const rawTicker = dsMockUtils.createMockTicker(ticker);

      const context = dsMockUtils.getContextInstance();

      /* eslint-disable @typescript-eslint/camelcase */
      const corporateActions = [
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.UnpredictableBenefit,
            decl_date: new Date('10/14/1987').getTime(),
            record_date: dsMockUtils.createMockRecordDate({
              date: new Date('10/14/2019').getTime(),
              checkpoint: { Existing: dsMockUtils.createMockU64(2) },
            }),
            details: 'someDescription',
            targets: {
              identities: ['someDid'],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 100000,
            withholding_tax: [tuple('someDid', 300000)],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.Reorganization,
            decl_date: new Date('10/14/1987').getTime(),
            record_date: null,
            details: 'dummy',
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 0,
            withholding_tax: [],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.UnpredictableBenefit,
            decl_date: new Date('11/26/1989').getTime(),
            record_date: dsMockUtils.createMockRecordDate({
              date: new Date('11/26/2019').getTime(),
              checkpoint: { Existing: dsMockUtils.createMockU64(5) },
            }),
            details: 'otherDescription',
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 150000,
            withholding_tax: [tuple('someDid', 200000)],
          })
        ),
      ];

      const distributions = [
        dsMockUtils.createMockDistribution({
          from: { kind: 'Default', did: 'someDid' },
          currency: 'USD',
          per_share: 10000000,
          amount: 500000000000,
          remaining: 400000000000,
          reclaimed: false,
          payment_at: new Date('10/14/1987').getTime(),
          expires_at: null,
        }),
        dsMockUtils.createMockDistribution({
          from: { kind: { User: dsMockUtils.createMockU64(2) }, did: 'someDid' },
          currency: 'CAD',
          per_share: 20000000,
          amount: 300000000000,
          remaining: 200000000000,
          reclaimed: false,
          payment_at: new Date('11/26/1989').getTime(),
          expires_at: null,
        }),
      ];

      /* eslint-enable @typescript-eslint/camelcase */
      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        entries: [
          [[rawTicker, dsMockUtils.createMockU32(1)], corporateActions[0]],
          [[rawTicker, dsMockUtils.createMockU32(2)], corporateActions[1]],
          [[rawTicker, dsMockUtils.createMockU32(3)], corporateActions[2]],
        ],
      });

      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        multi: distributions,
      });

      sinon
        .stub(utilsConversionModule, 'stringToTicker')
        .withArgs(ticker, context)
        .returns(rawTicker);

      const target = new Distributions(
        entityMockUtils.getSecurityTokenInstance({ ticker }),
        context
      );

      const result = await target.get();

      expect(result.length).toBe(2);
      expect(result[0].details.fundsReclaimed).toBe(false);
      expect(result[0].details.remainingFunds).toEqual(new BigNumber(400000));
      expect(result[0].distribution.origin).toEqual(
        entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })
      );
      expect(result[0].distribution.currency).toBe('USD');
      expect(result[0].distribution.perShare).toEqual(new BigNumber(10));
      expect(result[0].distribution.maxAmount).toEqual(new BigNumber(500000));
      expect(result[0].distribution.expiryDate).toBe(null);
      expect(result[0].distribution.paymentDate).toEqual(new Date('10/14/1987'));

      expect(result[1].details.fundsReclaimed).toBe(false);
      expect(result[1].details.remainingFunds).toEqual(new BigNumber(200000));
      expect(result[1].distribution.origin).toEqual(
        entityMockUtils.getNumberedPortfolioInstance({ did: 'someDid', id: new BigNumber(2) })
      );
      expect(result[1].distribution.currency).toBe('CAD');
      expect(result[1].distribution.perShare).toEqual(new BigNumber(20));
      expect(result[1].distribution.maxAmount).toEqual(new BigNumber(300000));
      expect(result[1].distribution.expiryDate).toBe(null);
      expect(result[1].distribution.paymentDate).toEqual(new Date('11/26/1989'));
    });
  });
});
