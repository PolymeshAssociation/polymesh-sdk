import { Balance } from '@polkadot/types/interfaces';
import {
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { CAId, Moment, PortfolioNumber, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createDividendDistributionResolver,
  getAuthorization,
  Params,
  prepareConfigureDividendDistribution,
  prepareStorage,
  Storage,
} from '~/api/procedures/configureDividendDistribution';
import { Context, DividendDistribution, NumberedPortfolio, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InputCaCheckpoint, RoleType, TargetTreatment, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
  '~/api/entities/DividendDistribution',
  require('~/testUtils/mocks/entities').mockDividendDistributionModule(
    '~/api/entities/DividendDistribution'
  )
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('configureDividendDistribution procedure', () => {
  let ticker: string;
  let declarationDate: Date;
  let checkpoint: InputCaCheckpoint;
  let description: string;
  let targets: { identities: string[]; treatment: TargetTreatment };
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: { identity: string; percentage: BigNumber }[];
  let originPortfolio: NumberedPortfolio;
  let currency: string;
  let perShare: BigNumber;
  let maxAmount: BigNumber;
  let paymentDate: Date;
  let expiryDate: Date;

  let rawPortfolioNumber: PortfolioNumber;
  let rawCurrency: Ticker;
  let rawPerShare: Balance;
  let rawAmount: Balance;
  let rawPaymentAt: Moment;
  let rawExpiresAt: Moment;

  let rawCaId: PostTransactionValue<CAId>;
  let distribution: PostTransactionValue<DividendDistribution>;

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let distributeTransaction: PolymeshTx<unknown[]>;

  let stringToTickerStub: sinon.SinonStub;
  let bigNumberToU64Stub: sinon.SinonStub;
  let dateToMomentStub: sinon.SinonStub;
  let bigNumberToBalanceStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_TICKER';
    declarationDate = new Date('10/14/1987');
    checkpoint = new Date(new Date().getTime() + 60 * 60 * 1000);
    description = 'someDescription';
    targets = {
      identities: ['someDid'],
      treatment: TargetTreatment.Exclude,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [{ identity: 'someDid', percentage: new BigNumber(30) }];
    originPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      id: new BigNumber(2),
      getAssetBalances: [
        {
          asset: entityMockUtils.getAssetInstance({ ticker: currency }),
          total: new BigNumber(1000001),
          locked: new BigNumber(0),
          free: new BigNumber(1000001),
        },
      ],
    });
    currency = 'USD';
    perShare = new BigNumber(100);
    maxAmount = new BigNumber(1000000);
    paymentDate = new Date(checkpoint.getTime() + 60 * 60 * 1000);
    expiryDate = new Date(paymentDate.getTime() + 60 * 60 * 1000 * 24 * 365);

    rawPortfolioNumber = dsMockUtils.createMockU64(originPortfolio.id);
    rawCurrency = dsMockUtils.createMockTicker(currency);
    rawPerShare = dsMockUtils.createMockBalance(perShare);
    rawAmount = dsMockUtils.createMockBalance(maxAmount);
    rawPaymentAt = dsMockUtils.createMockMoment(new BigNumber(paymentDate.getTime()));
    rawExpiresAt = dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()));

    rawCaId = 'caId' as unknown as PostTransactionValue<CAId>;
    distribution = 'distribution' as unknown as PostTransactionValue<DividendDistribution>;

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    procedureMockUtils.getAddProcedureStub().returns(rawCaId);
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([distribution]);
    distributeTransaction = dsMockUtils.createTxStub('capitalDistribution', 'distribute');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(currency, mockContext).returns(rawCurrency);
    bigNumberToU64Stub.withArgs(originPortfolio.id, mockContext).returns(rawPortfolioNumber);
    dateToMomentStub.withArgs(paymentDate, mockContext).returns(rawPaymentAt);
    dateToMomentStub.withArgs(expiryDate, mockContext).returns(rawExpiresAt);
    bigNumberToBalanceStub.withArgs(perShare, mockContext).returns(rawPerShare);
    bigNumberToBalanceStub.withArgs(maxAmount, mockContext).returns(rawAmount);
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

  it('should throw an error if the Asset is being used as the distribution currency', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency: ticker,
        perShare,
        maxAmount,
        paymentDate,
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot distribute Dividends using the Asset as currency');
  });

  it('should throw an error if the payment date is in the past', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency,
        perShare,
        maxAmount,
        paymentDate: new Date('10/14/1987'),
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Payment date must be in the future');
  });

  it('should throw an error if the payment date is earlier than the Checkpoint date', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency,
        perShare,
        maxAmount,
        paymentDate: new Date(new Date().getTime() + 1000 * 60 * 20),
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Payment date must be after the Checkpoint date');

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint: entityMockUtils.getCheckpointScheduleInstance({
          details: {
            nextCheckpointDate: new Date(new Date(new Date().getTime() + 1000 * 60 * 30)),
          },
        }),
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency,
        perShare,
        maxAmount,
        paymentDate: new Date(new Date().getTime() + 1000 * 60 * 20),
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Payment date must be after the Checkpoint date');
  });

  it('should throw an error if the payment date is after the expiry date', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        currency,
        perShare,
        maxAmount,
        paymentDate,
        expiryDate: new Date(paymentDate.getTime() - 1000),
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Expiry date must be after payment date');
  });

  it('should throw an error if the origin Portfolio does not have enough balance', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      {
        portfolio: entityMockUtils.getNumberedPortfolioInstance({
          getAssetBalances: [
            {
              asset: entityMockUtils.getAssetInstance({ ticker: currency }),
              total: new BigNumber(1),
              locked: new BigNumber(0),
              free: new BigNumber(1),
            },
          ],
        }),
      }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint: entityMockUtils.getCheckpointInstance(),
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency,
        perShare,
        maxAmount,
        paymentDate,
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      "The origin Portfolio's free balance is not enough to cover the Distribution amount"
    );
    expect(err.data).toEqual({
      free: new BigNumber(1),
    });
  });

  it('should throw an error if the origin Portfolio does not exist', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      {
        portfolio: entityMockUtils.getNumberedPortfolioInstance({
          exists: false,
        }),
      }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        ticker,
        declarationDate,
        checkpoint: entityMockUtils.getCheckpointInstance(),
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency,
        perShare,
        maxAmount,
        paymentDate,
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe("The origin Portfolio doesn't exist");
  });

  it('should add a distribute transaction to the queue', async () => {
    let proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(mockContext, {
      portfolio: originPortfolio,
    });

    const result = await prepareConfigureDividendDistribution.call(proc, {
      ticker,
      declarationDate,
      checkpoint,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
      originPortfolio,
      currency,
      perShare,
      maxAmount,
      paymentDate,
      expiryDate,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: distributeTransaction,
        resolvers: sinon.match.array,
        args: [
          rawCaId,
          rawPortfolioNumber,
          rawCurrency,
          rawPerShare,
          rawAmount,
          rawPaymentAt,
          rawExpiresAt,
        ],
      })
    );

    expect(result).toEqual(distribution);

    await prepareConfigureDividendDistribution.call(proc, {
      ticker,
      declarationDate,
      checkpoint,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
      originPortfolio: originPortfolio.id,
      currency,
      perShare,
      maxAmount,
      paymentDate,
      expiryDate,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: distributeTransaction,
        resolvers: sinon.match.array,
        args: [
          rawCaId,
          rawPortfolioNumber,
          rawCurrency,
          rawPerShare,
          rawAmount,
          rawPaymentAt,
          rawExpiresAt,
        ],
      })
    );

    proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(mockContext, {
      portfolio: entityMockUtils.getDefaultPortfolioInstance({
        did: 'someDid',
        getAssetBalances: [
          {
            asset: entityMockUtils.getAssetInstance({ ticker: currency }),
            total: new BigNumber(1000001),
            locked: new BigNumber(0),
            free: new BigNumber(1000001),
          },
        ],
      }),
    });

    await prepareConfigureDividendDistribution.call(proc, {
      ticker,
      declarationDate,
      checkpoint,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
      currency,
      perShare,
      maxAmount,
      paymentDate,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: distributeTransaction,
        resolvers: sinon.match.array,
        args: [rawCaId, null, rawCurrency, rawPerShare, rawAmount, rawPaymentAt, null],
      })
    );
  });

  describe('dividendDistributionResolver', () => {
    const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);
    const portfolioNumber = new BigNumber(3);
    const did = 'someDid';

    let rawCorporateAction: PalletCorporateActionsCorporateAction;
    let rawDistribution: PalletCorporateActionsDistribution;

    beforeAll(() => {
      entityMockUtils.initMocks();

      /* eslint-disable @typescript-eslint/naming-convention */
      rawCorporateAction = dsMockUtils.createMockCorporateAction({
        kind: 'UnpredictableBenefit',
        decl_date: new BigNumber(declarationDate.getTime()),
        record_date: dsMockUtils.createMockRecordDate({
          date: new BigNumber(new Date('10/14/2021').getTime()),
          checkpoint: {
            Scheduled: [
              dsMockUtils.createMockU64(new BigNumber(1)),
              dsMockUtils.createMockU64(new BigNumber(2)),
            ],
          },
        }),
        targets,
        default_withholding_tax: defaultTaxWithholding.shiftedBy(4),
        withholding_tax: taxWithholdings.map(({ identity, percentage }) =>
          tuple(identity, percentage.shiftedBy(4))
        ),
      });
      rawDistribution = dsMockUtils.createMockDistribution({
        from: { did, kind: { User: dsMockUtils.createMockU64(portfolioNumber) } },
        currency,
        per_share: perShare.shiftedBy(6),
        amount: maxAmount.shiftedBy(6),
        remaining: new BigNumber(10000),
        reclaimed: false,
        payment_at: new BigNumber(paymentDate.getTime()),
        expires_at: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(expiryDate?.getTime()))
        ),
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(rawCorporateAction),
      });
      dsMockUtils.createQueryStub('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockText(description),
      });
    });

    beforeEach(() => {
      /* eslint-disable @typescript-eslint/naming-convention */
      filterEventRecordsStub.returns([
        dsMockUtils.createMockIEvent([
          'data',
          dsMockUtils.createMockCAId({
            ticker,
            local_id: id,
          }),
          rawDistribution,
        ]),
      ]);
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
    });

    it('should return the new DividendDistribution', async () => {
      const result = await createDividendDistributionResolver(mockContext)(
        {} as ISubmittableResult
      );

      expect(result.asset.ticker).toBe(ticker);
      expect(result.id).toEqual(id);
      expect(result.declarationDate).toEqual(declarationDate);
      expect(result.description).toEqual(description);
      expect(result.targets).toEqual({
        identities: targets.identities.map(targetDid =>
          expect.objectContaining({ did: targetDid })
        ),

        treatment: targets.treatment,
      });
      expect(result.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(result.taxWithholdings).toEqual([
        {
          identity: expect.objectContaining({ did: taxWithholdings[0].identity }),
          percentage: taxWithholdings[0].percentage,
        },
      ]);
      expect(result.origin).toEqual(
        expect.objectContaining({
          owner: expect.objectContaining({ did }),
          id: new BigNumber(portfolioNumber),
        })
      );
      expect(result.currency).toEqual(currency);
      expect(result.maxAmount).toEqual(maxAmount);
      expect(result.expiryDate).toEqual(expiryDate);
      expect(result.paymentDate).toEqual(paymentDate);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
        mockContext,
        { portfolio: originPortfolio }
      );
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [
          {
            type: RoleType.PortfolioCustodian,
            portfolioId: { did: originPortfolio.owner.did, number: originPortfolio.id },
          },
        ],
        permissions: {
          transactions: [TxTags.capitalDistribution.Distribute],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [originPortfolio],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the origin Portfolio', async () => {
      const did = 'someDid';
      dsMockUtils.configureMocks({
        contextOptions: {
          did,
        },
      });
      const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      let result = await boundFunc({ originPortfolio } as Params);

      expect(result).toEqual({
        portfolio: originPortfolio,
      });

      const portfolioId = new BigNumber(1);
      result = await boundFunc({ originPortfolio: portfolioId } as Params);

      expect(result).toEqual({
        portfolio: expect.objectContaining({
          owner: expect.objectContaining({ did }),
          id: portfolioId,
        }),
      });

      result = await boundFunc({} as Params);

      expect(result).toEqual({
        portfolio: expect.objectContaining({ owner: expect.objectContaining({ did }) }),
      });
    });
  });
});
