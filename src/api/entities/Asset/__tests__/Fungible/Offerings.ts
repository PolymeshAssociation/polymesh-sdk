import { Bytes, Option } from '@polkadot/types';
import { PalletStoFundraiser, PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Offerings } from '~/api/entities/Asset/Fungible/Offerings';
import { Context, FungibleAsset, Namespace, Offering, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  OfferingBalanceStatus,
  OfferingDetails,
  OfferingSaleStatus,
  OfferingTimingStatus,
} from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Offerings class', () => {
  let assetId: string;
  let asset: FungibleAsset;
  let context: Context;

  let offerings: Offerings;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = 'SOME_ASSET';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });

    offerings = new Offerings(asset, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Offerings.prototype instanceof Namespace).toBe(true);
  });

  describe('method: launch', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Offering>;
      const args = {
        offeringPortfolio: 'otherDid',
        raisingCurrency: 'USD',
        raisingPortfolio: 'someDid',
        name: 'someName',
        tiers: [],
        minInvestment: new BigNumber(100),
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await offerings.launch(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getOne', () => {
    it('should return the requested Offering', async () => {
      entityMockUtils.configureMocks({
        offeringOptions: {
          assetId,
        },
      });
      const id = new BigNumber(1);
      const result = await offerings.getOne({ id });

      expect(result.id).toEqual(id);
    });

    it('should throw an error if the Offering does not exist', () => {
      entityMockUtils.configureMocks({
        offeringOptions: {
          exists: false,
        },
      });

      const id = new BigNumber(1);
      return expect(offerings.getOne({ id })).rejects.toThrow('The Offering does not exist');
    });
  });

  describe('method: get', () => {
    let rawAssetId: PolymeshPrimitivesAssetAssetId;
    let rawName: Option<Bytes>;

    let stringToAssetIdSpy: jest.SpyInstance<PolymeshPrimitivesAssetAssetId, [string, Context]>;
    let fundraiserToOfferingDetailsSpy: jest.SpyInstance<
      OfferingDetails,
      [PalletStoFundraiser, Bytes, Context]
    >;

    let details: OfferingDetails[];
    let fundraisers: PalletStoFundraiser[];

    beforeAll(() => {
      rawAssetId = dsMockUtils.createMockAssetId(assetId);
      stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
      fundraiserToOfferingDetailsSpy = jest.spyOn(
        utilsConversionModule,
        'fundraiserToOfferingDetails'
      );

      const creator = entityMockUtils.getIdentityInstance();
      const name = 'someSto';
      rawName = dsMockUtils.createMockOption(dsMockUtils.createMockFundraiserName(name));
      const offeringPortfolio = entityMockUtils.getDefaultPortfolioInstance();
      const raisingPortfolio = entityMockUtils.getDefaultPortfolioInstance();
      const venue = entityMockUtils.getVenueInstance();
      const raisingCurrency = 'USD';
      const now = new Date();
      const start = new Date(now.getTime() + 70000);
      const end = new Date(start.getTime() + 70000);
      const minInvestment = new BigNumber(100);
      const tiers = [
        {
          amount: new BigNumber(1000),
          price: new BigNumber(50),
          remaining: new BigNumber(300),
        },
      ];
      details = [
        {
          creator,
          name,
          offeringPortfolio,
          raisingPortfolio,
          raisingCurrency,
          start,
          end,
          tiers,
          minInvestment,
          venue,
          status: {
            sale: OfferingSaleStatus.Closed,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
          totalAmount: tiers[0].amount,
          totalRemaining: tiers[0].remaining,
        },
        {
          creator,
          name,
          offeringPortfolio,
          raisingPortfolio,
          raisingCurrency,
          start,
          end,
          tiers,
          minInvestment,
          venue,
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
          totalAmount: tiers[0].amount,
          totalRemaining: tiers[0].remaining,
        },
      ];
      fundraisers = [
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          offeringPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(offeringPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          raisingPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(raisingPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          offeringAsset: rawAssetId,
          raisingAsset: dsMockUtils.createMockAssetId(raisingCurrency),
          venueId: dsMockUtils.createMockU64(venue.id),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount),
              price: dsMockUtils.createMockBalance(tiers[0].price),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining),
            }),
          ],
          start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
          end: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(end.getTime()))
          ),
          minimumInvestment: dsMockUtils.createMockBalance(minInvestment),
          status: dsMockUtils.createMockFundraiserStatus('Closed'),
        }),
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          offeringPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(offeringPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          raisingPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(raisingPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          offeringAsset: rawAssetId,
          raisingAsset: dsMockUtils.createMockAssetId(raisingCurrency),
          venueId: dsMockUtils.createMockU64(venue.id),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount),
              price: dsMockUtils.createMockBalance(tiers[0].price),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining),
            }),
          ],
          start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
          end: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(end.getTime()))
          ),
          minimumInvestment: dsMockUtils.createMockBalance(minInvestment),
          status: dsMockUtils.createMockFundraiserStatus('Live'),
        }),
      ];
    });

    beforeEach(() => {
      when(stringToAssetIdSpy).calledWith(assetId, context).mockReturnValue(rawAssetId);
      when(fundraiserToOfferingDetailsSpy)
        .calledWith(fundraisers[0], rawName.unwrap(), context)
        .mockReturnValue(details[0]);
      when(fundraiserToOfferingDetailsSpy)
        .calledWith(fundraisers[1], rawName.unwrap(), context)
        .mockReturnValue(details[1]);

      dsMockUtils.createQueryMock('sto', 'fundraisers', {
        entries: [
          tuple(
            [rawAssetId, dsMockUtils.createMockU64(new BigNumber(1))],
            dsMockUtils.createMockOption(fundraisers[0])
          ),
          tuple(
            [rawAssetId, dsMockUtils.createMockU64(new BigNumber(2))],
            dsMockUtils.createMockOption(fundraisers[1])
          ),
        ],
      });
      dsMockUtils.createQueryMock('sto', 'fundraiserNames', {
        entries: [
          tuple([rawAssetId, dsMockUtils.createMockU64(new BigNumber(1))], rawName),
          tuple([rawAssetId, dsMockUtils.createMockU64(new BigNumber(2))], rawName),
        ],
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all Offerings associated to the Asset', async () => {
      const result = await offerings.get();

      expect(result[0].offering.id).toEqual(new BigNumber(1));
      expect(result[0].details).toEqual(details[0]);
      expect(result[1].offering.id).toEqual(new BigNumber(2));
      expect(result[1].details).toEqual(details[1]);

      expect(result.length).toBe(2);
    });

    it('should return Offerings associated to the Asset filtered by status', async () => {
      const result = await offerings.get({
        status: {
          sale: OfferingSaleStatus.Live,
          timing: OfferingTimingStatus.Started,
          balance: OfferingBalanceStatus.Available,
        },
      });

      expect(result[0].offering.id).toEqual(new BigNumber(2));
      expect(result[0].details).toEqual(details[1]);

      expect(result.length).toBe(1);
    });
  });
});
