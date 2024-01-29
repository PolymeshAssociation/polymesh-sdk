import { BTreeSet, Bytes, Option, u64 } from '@polkadot/types';
import {
  PalletConfidentialAssetAuditorAccount,
  PalletConfidentialAssetConfidentialAccount,
  PalletConfidentialAssetTransactionLeg,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createConfidentialTransactionResolver,
  getAuthorization,
  Params,
  prepareAddTransaction,
} from '~/api/procedures/addConfidentialTransaction';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ConfidentialTransaction,
  ErrorCode,
  RoleType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/confidential/ConfidentialVenue',
  require('~/testUtils/mocks/entities').mockConfidentialVenueModule(
    '~/api/entities/confidential/ConfidentialVenue'
  )
);

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);

jest.mock(
  '~/api/entities/confidential/ConfidentialAccount',
  require('~/testUtils/mocks/entities').mockConfidentialAccountModule(
    '~/api/entities/confidential/ConfidentialAccount'
  )
);

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('addTransaction procedure', () => {
  let mockContext: Mocked<Context>;
  let getCustodianMock: jest.Mock;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  let stringToInstructionMemoSpy: jest.SpyInstance;
  let confidentialLegToMeshLegSpy: jest.SpyInstance;
  let venueId: BigNumber;
  let sender: string;
  let receiver: string;
  let auditor: string;
  let mediator: string;
  let fromDid: string;
  let toDid: string;
  let assetId: string;
  let memo: string;
  let args: Params;

  let rawVenueId: u64;
  let rawAssets: BTreeSet<Bytes>;
  let rawSender: PalletConfidentialAssetConfidentialAccount;
  let rawReceiver: PalletConfidentialAssetConfidentialAccount;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawInstructionMemo: PolymeshPrimitivesMemo;
  let rawAuditors: BTreeSet<PalletConfidentialAssetAuditorAccount>;
  let rawMediators: BTreeSet<PolymeshPrimitivesIdentityId>;
  let rawLeg: PalletConfidentialAssetTransactionLeg;
  let addTransaction: PolymeshTx<
    [
      u64,
      {
        sender: PolymeshPrimitivesIdentityIdPortfolioId;
        receiver: PolymeshPrimitivesIdentityIdPortfolioId;
        assets: unknown;
        auditors: BTreeSet<PalletConfidentialAssetAuditorAccount>;
        mediators: BTreeSet<PolymeshPrimitivesIdentityId>;
      }[],
      PolymeshPrimitivesIdentityIdPortfolioId[],
      Option<PolymeshPrimitivesMemo>
    ]
  >;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(500),
          locked: new BigNumber(0),
          total: new BigNumber(500),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    getCustodianMock = jest.fn();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    stringToInstructionMemoSpy = jest.spyOn(utilsConversionModule, 'stringToMemo');
    confidentialLegToMeshLegSpy = jest.spyOn(utilsConversionModule, 'confidentialLegToMeshLeg');

    venueId = new BigNumber(1);
    sender = 'senderAccount';
    receiver = 'receiverAccount';
    auditor = 'auditorAccount';
    mediator = 'mediatorDid';
    fromDid = 'fromDid';
    toDid = 'toDid';
    assetId = '76702175-d8cb-e3a5-5a19-734433351e25';
    memo = 'SOME_MEMO';
    rawVenueId = dsMockUtils.createMockU64(venueId);
    rawSender = dsMockUtils.createMockConfidentialAccount(sender);
    rawReceiver = dsMockUtils.createMockConfidentialAccount(receiver);
    rawTicker = dsMockUtils.createMockTicker(assetId);
    rawAssets = dsMockUtils.createMockBTreeSet<Bytes>([dsMockUtils.createMockBytes(assetId)]);
    rawInstructionMemo = dsMockUtils.createMockMemo(memo);
    rawAuditors = dsMockUtils.createMockBTreeSet<PalletConfidentialAssetAuditorAccount>([auditor]);
    rawMediators = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>([mediator]);
    rawLeg = dsMockUtils.createMockConfidentialLeg({
      sender: rawSender,
      receiver: rawReceiver,
      assets: rawAssets,
      auditors: rawAuditors,
      mediators: rawMediators,
    });
  });

  beforeEach(() => {
    const tickerReservationDetailsMock = jest.fn();
    tickerReservationDetailsMock.mockResolvedValue({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addTransaction = dsMockUtils.createTxMock('confidentialAsset', 'addTransaction');

    mockContext = dsMockUtils.getContextInstance();

    getCustodianMock.mockReturnValueOnce({ did: fromDid }).mockReturnValue({ did: toDid });
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getCustodian: getCustodianMock,
      },
      tickerReservationOptions: {
        details: tickerReservationDetailsMock,
      },
    });
    when(stringToTickerSpy).calledWith(assetId, mockContext).mockReturnValue(rawTicker);
    when(bigNumberToU64Spy).calledWith(venueId, mockContext).mockReturnValue(rawVenueId);
    when(stringToInstructionMemoSpy)
      .calledWith(memo, mockContext)
      .mockReturnValue(rawInstructionMemo);

    when(confidentialLegToMeshLegSpy.mockReturnValue(rawLeg))
      .calledWith({ sender, receiver, assets: [assetId], rawAuditors, rawMediators }, mockContext)
      .mockReturnValue(rawLeg);

    args = {
      venueId,
      transactions: [
        {
          legs: [
            {
              sender,
              receiver,
              assets: [assetId],
              auditors: [],
              mediators: [],
            },
          ],
        },
      ],
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    jest.resetAllMocks();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the transactions array is empty', () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The transactions array cannot be empty',
    });

    return expect(prepareAddTransaction.call(proc, { venueId, transactions: [] })).rejects.toThrow(
      expectedError
    );
  });

  it('should throw an error if the legs array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      confidentialVenueOptions: { exists: true },
    });

    let error;

    try {
      await prepareAddTransaction.call(proc, { venueId, transactions: [{ legs: [] }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The legs array can't be empty");
    expect(error.code).toBe(ErrorCode.ValidationError);
    expect(error.data.failedTransactionIndexes[0]).toBe(0);
  });

  it('should throw an error if any transaction contains no assets', () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Transaction legs must contain at least one Asset',
    });
    const legs = [
      {
        sender,
        receiver,
        assets: [],
        auditors: [],
        mediators: [],
      },
    ];

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if given a string asset that does not exist', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      confidentialAssetOptions: {
        exists: false,
      },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Asset doesn't exist",
    });
    const legs = Array(2).fill({
      sender,
      receiver,
      assets: [assetId],
      auditors: [auditor],
      mediators: [mediator],
    });

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if an asset is not enabled for the venue', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      confidentialAssetOptions: {
        getVenueFilteringDetails: {
          enabled: true,
          allowedConfidentialVenues: [
            entityMockUtils.getConfidentialVenueInstance({ id: new BigNumber(7) }),
          ],
        },
      },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A confidential asset is not allowed to be exchanged at the corresponding venue',
    });
    const legs = [
      {
        sender,
        receiver,
        assets: [assetId],
        auditors: [auditor],
        mediators: [mediator],
      },
    ];

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if given an Auditor that does not exist', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: true },
      confidentialAccountOptions: {
        exists: false,
      },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Account doesn't exist",
    });
    const legs = Array(2).fill({
      sender,
      receiver,
      assets: [assetId],
      auditors: [auditor],
      mediators: [mediator],
    });

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if given a Mediator that does not exist', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: true },
      identityOptions: {
        exists: false,
      },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Identity does not exist',
    });
    const legs = Array(2).fill({
      sender,
      receiver,
      assets: [assetId],
      auditors: [auditor],
      mediators: [mediator],
    });

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if any transaction contains leg with transferring Assets between the same Confidential Account', () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      confidentialVenueOptions: { exists: true },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Transaction leg cannot transfer Assets between the same account',
      data: { failedTransactionIndexes: 7 },
    });

    const legs = Array(2).fill({
      sender,
      receiver: sender,
      assets: [assetId],
      auditors: [],
      mediators: [],
    });

    return expect(
      prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] })
    ).rejects.toThrow(expectedError);
  });

  it("should throw an error if the Confidential Venue doesn't exist", () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext);

    entityMockUtils.configureMocks({
      confidentialVenueOptions: { exists: false },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Venue doesn't exist",
    });

    return expect(prepareAddTransaction.call(proc, args)).rejects.toThrow(expectedError);
  });

  it('should throw an error if the legs array exceeds limit', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      confidentialVenueOptions: {
        exists: true,
      },
    });

    let error;

    const legs = Array(11).fill({
      sender,
      receiver,
      assets: [entityMockUtils.getConfidentialAssetInstance({ id: assetId })],
    });

    try {
      await prepareAddTransaction.call(proc, { venueId, transactions: [{ legs }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The legs array exceeds the maximum allowed length');
    expect(error.code).toBe(ErrorCode.LimitExceeded);
  });

  it('should return an add and authorize instruction transaction spec', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      confidentialAssetOptions: {
        exists: true,
      },
      confidentialVenueOptions: {
        exists: true,
      },
      confidentialAccountOptions: { exists: true },
    });
    getCustodianMock.mockReturnValue({ did: fromDid });
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext);

    const result = await prepareAddTransaction.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addTransaction,
          args: [rawVenueId, [rawLeg], null],
        },
      ],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction[]>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc({
        venueId,
        transactions: [
          { legs: [{ sender, receiver, assets: [assetId], auditors: [], mediators: [] }] },
        ],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.ConfidentialVenueOwner, venueId }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.confidentialAsset.AddTransaction],
        },
      });
    });
  });

  describe('addTransactionResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(10);
    const rawId = dsMockUtils.createMockConfidentialTransactionId(id);

    beforeAll(() => {
      entityMockUtils.initMocks({
        confidentialTransactionOptions: {
          id,
        },
      });
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent(['someDid', 'someVenueId', rawId]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new Confidential Transaction', () => {
      const fakeContext = {} as Context;

      const result = createConfidentialTransactionResolver(fakeContext)({} as ISubmittableResult);

      expect(result[0].id).toEqual(id);
    });
  });
});
