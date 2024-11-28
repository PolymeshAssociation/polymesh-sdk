import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PolymeshPrimitivesAssetAssetId,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createDividendDistributionResolver,
  getAuthorization,
  Params,
  prepareConfigureDividendDistribution,
  prepareStorage,
  Storage,
} from '~/api/procedures/configureDividendDistribution';
import { Context, DividendDistribution, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  CorporateActionKind,
  FungibleAsset,
  InputCaCheckpoint,
  RoleType,
  TargetTreatment,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import { hexToUuid } from '~/utils';
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
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('configureDividendDistribution procedure', () => {
  let assetId: string;
  let asset: FungibleAsset;
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

  let rawPortfolioNumber: u64;
  let rawCurrency: PolymeshPrimitivesAssetAssetId;
  let rawPerShare: Balance;
  let rawAmount: Balance;
  let rawPaymentAt: u64;
  let rawExpiresAt: u64;
  let rawCorporateActionArgs: PalletCorporateActionsInitiateCorporateActionArgs;

  let mockContext: Mocked<Context>;
  let initiateCorporateActionAndDistributeTransaction: PolymeshTx<unknown[]>;

  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let dateToMomentSpy: jest.SpyInstance;
  let bigNumberToBalanceSpy: jest.SpyInstance;
  let corporateActionParamsToMeshCorporateActionArgsSpy: jest.SpyInstance;
  let asFungibleAssetSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
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
          asset: entityMockUtils.getFungibleAssetInstance({ assetId: currency }),
          total: new BigNumber(1000001),
          locked: new BigNumber(0),
          free: new BigNumber(1000001),
        },
      ],
    });
    currency = '0x09000000000000000000000000000000';
    perShare = new BigNumber(100);
    maxAmount = new BigNumber(1000000);
    paymentDate = new Date(checkpoint.getTime() + 60 * 60 * 1000);
    expiryDate = new Date(paymentDate.getTime() + 60 * 60 * 1000 * 24 * 365);

    rawPortfolioNumber = dsMockUtils.createMockU64(originPortfolio.id);
    rawCurrency = dsMockUtils.createMockAssetId(currency);
    rawPerShare = dsMockUtils.createMockBalance(perShare);
    rawAmount = dsMockUtils.createMockBalance(maxAmount);
    rawPaymentAt = dsMockUtils.createMockMoment(new BigNumber(paymentDate.getTime()));
    rawExpiresAt = dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()));
    rawCorporateActionArgs = dsMockUtils.createMockInitiateCorporateActionArgs({
      assetId,
      kind: CorporateActionKind.UnpredictableBenefit,
      declDate: dsMockUtils.createMockMoment(new BigNumber(declarationDate.getTime())),
      recordDate: dsMockUtils.createMockOption(
        dsMockUtils.createMockRecordDateSpec({
          Scheduled: dsMockUtils.createMockMoment(new BigNumber(checkpoint.getTime())),
        })
      ),
      details: description,
      targets: dsMockUtils.createMockOption(dsMockUtils.createMockTargetIdentities(targets)),
      defaultWithholdingTax: dsMockUtils.createMockOption(
        dsMockUtils.createMockPermill(defaultTaxWithholding)
      ),
      withholdingTax: [[taxWithholdings[0].identity, taxWithholdings[0].percentage]],
    });

    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    corporateActionParamsToMeshCorporateActionArgsSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionParamsToMeshCorporateActionArgs'
    );
    asFungibleAssetSpy = jest.spyOn(utilsInternalModule, 'asFungibleAsset');
  });

  beforeEach(() => {
    initiateCorporateActionAndDistributeTransaction = dsMockUtils.createTxMock(
      'corporateAction',
      'initiateCorporateActionAndDistribute'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(asFungibleAssetSpy)
      .calledWith(currency, mockContext)
      .mockResolvedValue(entityMockUtils.getFungibleAssetInstance({ assetId: currency }));
    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: currency }), mockContext)
      .mockReturnValue(rawCurrency);
    when(bigNumberToU64Spy)
      .calledWith(originPortfolio.id, mockContext)
      .mockReturnValue(rawPortfolioNumber);
    when(dateToMomentSpy).calledWith(paymentDate, mockContext).mockReturnValue(rawPaymentAt);
    when(dateToMomentSpy).calledWith(expiryDate, mockContext).mockReturnValue(rawExpiresAt);
    when(bigNumberToBalanceSpy).calledWith(perShare, mockContext).mockReturnValue(rawPerShare);
    when(bigNumberToBalanceSpy).calledWith(maxAmount, mockContext).mockReturnValue(rawAmount);
    when(corporateActionParamsToMeshCorporateActionArgsSpy)
      .calledWith(
        {
          asset,
          kind: CorporateActionKind.UnpredictableBenefit,
          declarationDate,
          checkpoint,
          description,
          targets,
          defaultTaxWithholding,
          taxWithholdings,
        },
        mockContext
      )
      .mockReturnValue(rawCorporateActionArgs);
    when(corporateActionParamsToMeshCorporateActionArgsSpy)
      .calledWith(
        {
          asset,
          kind: CorporateActionKind.UnpredictableBenefit,
          declarationDate: expect.any(Date),
          checkpoint,
          description,
          targets: null,
          defaultTaxWithholding: null,
          taxWithholdings: null,
        },
        mockContext
      )
      .mockReturnValue(rawCorporateActionArgs);

    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(100)),
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

  it('should throw an error if the Asset is being used as the distribution currency', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        asset,
        declarationDate,
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
        originPortfolio,
        currency: assetId,
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
        asset,
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

  it('should throw an error if the declaration date is in the future', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        asset,
        declarationDate: new Date(new Date().getTime() + 500000),
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
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Declaration date must be in the past');
  });

  it('should throw an error if the payment date is earlier than the Checkpoint date', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        asset,
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
        asset,
        declarationDate,
        checkpoint: entityMockUtils.getCheckpointScheduleInstance(),
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

  it('should throw an error if the description length is greater than the allowed maximum', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        asset,
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
        expiryDate,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Description too long');
  });

  it('should throw an error if the payment date is after the expiry date', async () => {
    const proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(
      mockContext,
      { portfolio: originPortfolio }
    );

    let err;

    try {
      await prepareConfigureDividendDistribution.call(proc, {
        asset,
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
              asset: entityMockUtils.getFungibleAssetInstance({ assetId: currency }),
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
        asset,
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
        asset,
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

  it('should return an initiate corporate action and distribute transaction spec', async () => {
    let proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(mockContext, {
      portfolio: originPortfolio,
    });

    let result = await prepareConfigureDividendDistribution.call(proc, {
      asset,
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

    expect(result).toEqual({
      transaction: initiateCorporateActionAndDistributeTransaction,
      resolver: expect.any(Function),
      args: [
        rawCorporateActionArgs,
        rawPortfolioNumber,
        rawCurrency,
        rawPerShare,
        rawAmount,
        rawPaymentAt,
        rawExpiresAt,
      ],
    });

    result = await prepareConfigureDividendDistribution.call(proc, {
      asset,
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

    expect(result).toEqual({
      transaction: initiateCorporateActionAndDistributeTransaction,
      resolver: expect.any(Function),
      args: [
        rawCorporateActionArgs,
        rawPortfolioNumber,
        rawCurrency,
        rawPerShare,
        rawAmount,
        rawPaymentAt,
        rawExpiresAt,
      ],
    });

    proc = procedureMockUtils.getInstance<Params, DividendDistribution, Storage>(mockContext, {
      portfolio: entityMockUtils.getDefaultPortfolioInstance({
        did: 'someDid',
        getAssetBalances: [
          {
            asset: entityMockUtils.getFungibleAssetInstance({ assetId: currency }),
            total: new BigNumber(1000001),
            locked: new BigNumber(0),
            free: new BigNumber(1000001),
          },
        ],
      }),
    });

    result = await prepareConfigureDividendDistribution.call(proc, {
      asset,
      checkpoint,
      description,
      currency,
      perShare,
      maxAmount,
      paymentDate,
    });

    expect(result).toEqual({
      transaction: initiateCorporateActionAndDistributeTransaction,
      resolver: expect.any(Function),
      args: [rawCorporateActionArgs, null, rawCurrency, rawPerShare, rawAmount, rawPaymentAt, null],
    });
  });

  describe('dividendDistributionResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
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
        perShare: perShare.shiftedBy(6),
        amount: maxAmount.shiftedBy(6),
        remaining: new BigNumber(10000),
        reclaimed: false,
        paymentAt: new BigNumber(paymentDate.getTime()),
        expiresAt: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(expiryDate?.getTime()))
        ),
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(rawCorporateAction),
      });
      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockBytes(description),
      });
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([
          'data',
          dsMockUtils.createMockCAId({
            assetId,
            localId: id,
          }),
          rawDistribution,
        ]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new DividendDistribution', async () => {
      const result = await createDividendDistributionResolver(mockContext)(
        {} as ISubmittableResult
      );

      expect(result.asset.id).toBe(hexToUuid(assetId));
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
      expect(result.currency).toEqual(hexToUuid(currency));
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
        asset,
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
          assets: [asset],
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
