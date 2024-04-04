import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesSecondaryKeySignatory,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareTransferTickerOwnership,
} from '~/api/procedures/transferTickerOwnership';
import { AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Account,
  Authorization,
  AuthorizationType,
  Identity,
  RoleType,
  SignerType,
  SignerValue,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('transferTickerOwnership procedure', () => {
  let mockContext: Mocked<Context>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let ticker: string;
  let did: string;
  let expiry: Date;
  let rawSignatory: PolymeshPrimitivesSecondaryKeySignatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;
  let rawMoment: Moment;
  let args: Params;
  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let target: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    ticker = 'SOME_TICKER';
    did = 'someDid';
    expiry = new Date('10/14/3040');
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(did),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      TransferTicker: dsMockUtils.createMockTicker(ticker),
    });
    rawMoment = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
    args = {
      ticker,
      target: did,
    };
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
  });

  let transaction: PolymeshTx<
    [
      PolymeshPrimitivesSecondaryKeySignatory,
      PolymeshPrimitivesAuthorizationAuthorizationData,
      Option<Moment>
    ]
  >;

  beforeEach(() => {
    transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
    mockContext = dsMockUtils.getContextInstance();
    target = entityMockUtils.getIdentityInstance({ did: args.target as string });

    entityMockUtils.configureMocks({
      identityOptions: {
        authorizationsGetReceived: [],
      },
    });

    when(signerValueToSignatorySpy)
      .calledWith({ type: SignerType.Identity, value: did }, mockContext)
      .mockReturnValue(rawSignatory);

    when(authorizationToAuthorizationDataSpy)
      .calledWith({ type: AuthorizationType.TransferTicker, value: ticker }, mockContext)
      .mockReturnValue(rawAuthorizationData);
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawMoment);
    when(signerToStringSpy)
      .calledWith(args.target)
      .mockReturnValue(args.target as string);
    when(signerToStringSpy)
      .calledWith(target)
      .mockReturnValue(args.target as string);
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

  it('should throw an error if there is a Pending Authorization', () => {
    entityMockUtils.configureMocks({
      identityOptions: {
        authorizationsGetReceived: [
          entityMockUtils.getAuthorizationRequestInstance({
            target,
            issuer: entityMockUtils.getIdentityInstance({ did }),
            authId: new BigNumber(1),
            expiry: null,
            data: { type: AuthorizationType.TransferTicker, value: ticker },
          }),
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    return expect(prepareTransferTickerOwnership.call(proc, args)).rejects.toThrow(
      'The target Identity already has a pending Ticker Ownership transfer request'
    );
  });

  it('should throw an error if an Asset with that ticker has already been launched', () => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance(),
          expiryDate: null,
          status: TickerReservationStatus.AssetCreated,
        },
      },
      identityOptions: {
        authorizationsGetReceived: [],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    return expect(prepareTransferTickerOwnership.call(proc, args)).rejects.toThrow(
      'An Asset with this ticker has already been created'
    );
  });

  it('should return an add authorization transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareTransferTickerOwnership.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });
  });

  it('should return an add authorization transaction with expiry spec if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareTransferTickerOwnership.call(proc, { ...args, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawMoment],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          assets: [],
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [],
        },
      });
    });
  });
});
