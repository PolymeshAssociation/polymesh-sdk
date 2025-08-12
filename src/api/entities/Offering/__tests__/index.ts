import {
  PalletStoFundraiser,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { Bytes, Option, U64, U128 } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, Offering, PolymeshTransaction } from '~/internal';
import { investmentsQuery } from '~/middleware/queries/stos';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  OfferingBalanceStatus,
  OfferingSaleStatus,
  OfferingTimingStatus,
  SignerKeyRingType,
} from '~/types';
import { uuidToHex } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
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
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Offering class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(Offering.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign assetId and id to instance', () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);

      expect(offering.asset.id).toBe(assetId);
      expect(offering.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Offering.isUniqueIdentifiers({ id: new BigNumber(1), assetId: 'symbol' })).toBe(true);
      expect(Offering.isUniqueIdentifiers({})).toBe(false);
      expect(Offering.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(Offering.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: details', () => {
    const assetId = '12341234-1234-1234-1234-123412341234';
    const id = new BigNumber(1);
    const someDid = 'someDid';
    const name = 'someSto';
    const otherDid = 'otherDid';
    const raisingCurrency = '88888888-1234-1234-1234-123412341234';
    const amount = new BigNumber(1000);
    const price = new BigNumber(100);
    const remaining = new BigNumber(700);
    const date = new Date();
    const minInvestmentValue = new BigNumber(1);

    const rawFundraiser = dsMockUtils.createMockOption(
      dsMockUtils.createMockFundraiser({
        creator: dsMockUtils.createMockIdentityId(someDid),
        offeringPortfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(someDid),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
        offeringAsset: dsMockUtils.createMockAssetId(uuidToHex(assetId)),
        raisingPortfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(otherDid),
          kind: dsMockUtils.createMockPortfolioKind({
            User: dsMockUtils.createMockU64(new BigNumber(1)),
          }),
        }),
        raisingAsset: dsMockUtils.createMockAssetId(uuidToHex(raisingCurrency)),
        tiers: [
          dsMockUtils.createMockFundraiserTier({
            total: dsMockUtils.createMockBalance(amount),
            price: dsMockUtils.createMockBalance(price),
            remaining: dsMockUtils.createMockBalance(remaining),
          }),
        ],
        venueId: dsMockUtils.createMockU64(new BigNumber(1)),
        start: dsMockUtils.createMockMoment(new BigNumber(date.getTime())),
        end: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(date.getTime()))
        ),
        status: dsMockUtils.createMockFundraiserStatus('Live'),
        minimumInvestment: dsMockUtils.createMockBalance(minInvestmentValue),
      })
    );

    const rawName = dsMockUtils.createMockOption(dsMockUtils.createMockBytes(name));

    let offering: Offering;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      offering = new Offering({ assetId, id }, context);
    });

    it('should return details for an Asset offering', async () => {
      const fakeResult = {
        creator: expect.objectContaining({ did: someDid }),
        name,
        offeringPortfolio: expect.objectContaining({
          owner: expect.objectContaining({ did: someDid }),
        }),
        raisingPortfolio: expect.objectContaining({
          owner: expect.objectContaining({ did: otherDid }),
          id: new BigNumber(1),
        }),
        raisingCurrency,
        tiers: [
          {
            amount: amount.shiftedBy(-6),
            price: price.shiftedBy(-6),
            remaining: remaining.shiftedBy(-6),
          },
        ],
        venue: expect.objectContaining({ id: new BigNumber(1) }),
        start: date,
        end: date,
        status: {
          sale: OfferingSaleStatus.Live,
          timing: OfferingTimingStatus.Expired,
          balance: OfferingBalanceStatus.Residual,
        },
        minInvestment: minInvestmentValue.shiftedBy(-6),
        totalAmount: amount.shiftedBy(-6),
        totalRemaining: remaining.shiftedBy(-6),
      };

      dsMockUtils.createQueryMock('sto', 'fundraisers', {
        returnValue: rawFundraiser,
      });

      dsMockUtils.createQueryMock('sto', 'fundraiserNames', {
        returnValue: rawName,
      });

      const details = await offering.details();
      expect(details).toEqual(fakeResult);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryMock('sto', 'fundraiserNames', {
        returnValue: rawName,
      });

      dsMockUtils
        .createQueryMock('sto', 'fundraisers')
        .mockImplementation(async (_a, _b, cbFunc) => {
          cbFunc(rawFundraiser, rawName);
          return unsubCallback;
        });

      const callback = jest.fn();
      const result = await offering.details(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(expect.objectContaining({}));
    });
  });

  describe('method: close', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);

      const args = {
        asset: offering.asset,
        id,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.close();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modifyTimes', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);

      const now = new Date();
      const start = new Date(now.getTime() + 100000);
      const end = new Date(start.getTime() + 100000);

      const args = {
        asset: offering.asset,
        id,
        start,
        end,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.modifyTimes({
        start,
        end,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getInvestments', () => {
    it('should return a list of investors', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);
      const did = 'someDid';
      const offeringAssetId = '0x11111111111181111111111111111111';
      const raiseToken = 'USD';
      const offeringTokenAmount = new BigNumber(10000);
      const raiseTokenAmount = new BigNumber(1000);

      when(jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware'))
        .calledWith(assetId, context)
        .mockResolvedValue(assetId);

      const nodes = [
        {
          investorId: did,
          offeringAssetId,
          raiseToken,
          offeringTokenAmount: offeringTokenAmount.toNumber(),
          raiseTokenAmount: raiseTokenAmount.toNumber(),
        },
      ];

      const investmentQueryResponse = {
        totalCount: 1,
        nodes,
      };

      dsMockUtils.createApolloQueryMock(
        investmentsQuery(
          false,
          {
            stoId: id.toNumber(),
            offeringAssetId: assetId,
          },
          new BigNumber(5),
          new BigNumber(0)
        ),
        {
          investments: investmentQueryResponse,
        }
      );

      let result = await offering.getInvestments({
        size: new BigNumber(5),
        start: new BigNumber(0),
      });

      const { data } = result;

      expect(data[0].investor.did).toBe(did);
      expect(data[0].soldAmount).toEqual(offeringTokenAmount.div(Math.pow(10, 6)));
      expect(data[0].investedAmount).toEqual(raiseTokenAmount.div(Math.pow(10, 6)));

      dsMockUtils.createApolloQueryMock(
        investmentsQuery(false, {
          stoId: id.toNumber(),
          offeringAssetId: assetId,
        }),
        {
          investments: {
            totalCount: 0,
            nodes: [],
          },
        }
      );

      result = await offering.getInvestments();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });

  describe('method: freeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Offering>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { asset: offering.asset, id, freeze: true }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.freeze();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: unfreeze', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Offering>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { asset: offering.asset, id, freeze: false }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.unfreeze();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: enableOffChainFunding', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);
      const offChainTicker = 'OFFCHAIN';

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { asset: offering.asset, id, offChainTicker }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.enableOffChainFunding({ offChainTicker });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: invest', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const id = new BigNumber(1);
      const offering = new Offering({ id, assetId }, context);
      const did = 'someDid';

      const purchasePortfolio = entityMockUtils.getDefaultPortfolioInstance({ did });
      const fundingPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did });
      const purchaseAmount = new BigNumber(10);

      const args = {
        asset: offering.asset,
        id,
        purchasePortfolio,
        fundingPortfolio,
        purchaseAmount,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await offering.invest({
        purchasePortfolio,
        fundingPortfolio,
        purchaseAmount,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Offering exists', async () => {
      const offering = new Offering(
        { assetId: '12341234-1234-1234-1234-123412341234', id: new BigNumber(1) },
        context
      );

      dsMockUtils.createQueryMock('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockFundraiser()),
      });

      let result = await offering.exists();
      expect(result).toBe(true);

      dsMockUtils.createQueryMock('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await offering.exists();
      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const offering = new Offering(
        { assetId: '12341234-1234-1234-1234-123412341234', id: new BigNumber(1) },
        context
      );

      expect(offering.toHuman()).toEqual({
        id: '1',
        assetId: '12341234-1234-1234-1234-123412341234',
      });
    });
  });

  describe('method: offChainFundingDetails', () => {
    it('should return the offchain funding details', async () => {
      const offering = new Offering(
        { assetId: '12341234-1234-1234-1234-123412341234', id: new BigNumber(1) },
        context
      );

      dsMockUtils.createQueryMock('sto', 'fundraiserOffchainAsset', {
        returnValue: dsMockUtils.createMockOption(),
      });

      let result = await offering.offChainFundingDetails();
      expect(result).toEqual({ enabled: false });

      dsMockUtils.createQueryMock('sto', 'fundraiserOffchainAsset', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockTicker('OFFCHAIN')),
      });

      result = await offering.offChainFundingDetails();
      expect(result).toEqual({ enabled: true, offChainTicker: 'OFFCHAIN' });
    });
  });

  describe('method: generateOffChainAffirmationReceipt', () => {
    let uid: BigNumber;
    let id: BigNumber;
    let rawId: U64;
    let rawUid: U64;
    let bigNumberToU64Spy: jest.SpyInstance;
    let bigNumberToU128Spy: jest.SpyInstance;
    let stringToIdentityIdSpy: jest.SpyInstance;
    let stringToTickerSpy: jest.SpyInstance;
    let rawAmount: U128;
    let amount: BigNumber;
    let senderIdentity: string;
    let rawSenderIdentity: PolymeshPrimitivesIdentityId;
    let receiverIdentity: string;
    let rawReceiverIdentity: PolymeshPrimitivesIdentityId;
    let offChainTicker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let offering: Offering;
    let rawFundraiser: Option<PalletStoFundraiser>;
    let rawFundraiserName: Option<Bytes>;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
      bigNumberToU128Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU128');
      stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
      stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
      id = new BigNumber(1);
      uid = new BigNumber(1);
      amount = new BigNumber(100);
      senderIdentity = '0x12'.padStart(66, '1');
      receiverIdentity = '0x01'.padStart(66, '0');
      offChainTicker = 'OFFCHAIN';
    });

    beforeEach(() => {
      rawId = dsMockUtils.createMockU64(id);
      rawUid = dsMockUtils.createMockU64(uid);
      rawAmount = dsMockUtils.createMockU128(amount.shiftedBy(6));
      rawSenderIdentity = dsMockUtils.createMockIdentityId(senderIdentity);
      rawReceiverIdentity = dsMockUtils.createMockIdentityId(receiverIdentity);

      rawTicker = dsMockUtils.createMockTicker(offChainTicker);
      rawTicker.toHex = jest.fn().mockReturnValue('0x4f4646434841494e00000000');

      when(stringToTickerSpy).calledWith(offChainTicker, context).mockReturnValue(rawTicker);
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
      when(bigNumberToU64Spy).calledWith(uid, context).mockReturnValue(rawUid);
      when(bigNumberToU128Spy).calledWith(amount.shiftedBy(6), context).mockReturnValue(rawAmount);

      rawFundraiser = dsMockUtils.createMockOption(
        dsMockUtils.createMockFundraiser({
          ...dsMockUtils.createMockFundraiser(),
          raisingAsset: dsMockUtils.createMockAssetId('0x12341234123412341234123412341234'),
          offeringPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(senderIdentity),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          raisingPortfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(receiverIdentity),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
        })
      );

      rawFundraiserName = dsMockUtils.createMockOption(dsMockUtils.createMockFundraiserName());

      when(stringToIdentityIdSpy)
        .calledWith(senderIdentity, context)
        .mockReturnValue(rawSenderIdentity);
      when(stringToIdentityIdSpy)
        .calledWith(receiverIdentity, context)
        .mockReturnValue(rawReceiverIdentity);

      dsMockUtils.createQueryMock('sto', 'fundraisers', {
        returnValue: rawFundraiser,
      });

      dsMockUtils.createQueryMock('sto', 'fundraiserNames', {
        returnValue: rawFundraiserName,
      });
      offering = new Offering({ assetId: '12341234-1234-1234-1234-123412341234', id }, context);
    });

    it('should return the funding receipt for offchain ticker', async () => {
      const result = await offering.generateOffChainFundingReceipt({
        uid,
        offChainTicker,
        amount,
        sender: senderIdentity,
      });

      expect(result).toEqual({
        uid,
        signer: expect.objectContaining({
          address: '0xdummy',
        }),
        signature: {
          type: SignerKeyRingType.Sr25519,
          value: '0xsignature',
        },
        metadata: undefined,
      });
    });

    it('should return the funding receipt for offchain ticker with signer', async () => {
      const signer = 'someSigner';
      const metadata = 'some metadata';

      const result = await offering.generateOffChainFundingReceipt({
        uid,
        offChainTicker,
        amount,
        sender: senderIdentity,
        signerKeyRingType: SignerKeyRingType.Ed25519,
        signer,
        metadata,
      });

      expect(result).toEqual({
        uid,
        signer,
        signature: {
          type: SignerKeyRingType.Ed25519,
          value: '0xsignature',
        },
        metadata,
      });

      expect(context.getSignature).toHaveBeenCalledWith({
        rawPayload: expect.stringMatching(/0x3c42797465733e(.*)3c2f42797465733e/),
        signer,
      });
    });
  });
});
