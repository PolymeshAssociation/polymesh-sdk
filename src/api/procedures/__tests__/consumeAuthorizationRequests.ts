import { bool, u64 } from '@polkadot/types';
import { PolymeshPrimitivesSecondaryKeySignatory } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  ConsumeAuthorizationRequestsParams,
  getAuthorization,
  prepareConsumeAuthorizationRequests,
} from '~/api/procedures/consumeAuthorizationRequests';
import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, SignerValue, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('consumeAuthorizationRequests procedure', () => {
  let mockContext: Mocked<Context>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let authParams: {
    authId: BigNumber;
    expiry: Date | null;
    issuer: Identity;
    target: Identity | Account;
    data: Authorization;
  }[];
  let auths: AuthorizationRequest[];
  let rawAuthIdentifiers: [PolymeshPrimitivesSecondaryKeySignatory, u64, bool][];
  let rawAuthIds: [u64][];
  let rawFalseBool: bool;

  let acceptAssetOwnershipTransferTransaction: jest.Mock;
  let acceptBecomeAgentTransaction: jest.Mock;
  let acceptPortfolioCustodyTransaction: jest.Mock;
  let acceptTickerTransferTransaction: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
    dsMockUtils.createQueryMock('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          authorizationData: dsMockUtils.createMockAuthorizationData({
            TransferTicker: dsMockUtils.createMockTicker('TICKER'),
          }),
          authId: new BigNumber(1),
          authorizedBy: 'someDid',
          expiry: dsMockUtils.createMockOption(),
        })
      ),
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    rawFalseBool = dsMockUtils.createMockBool(false);
    authParams = [
      {
        authId: new BigNumber(1),
        expiry: new Date('10/14/3040'),
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid1' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'SOME_TICKER1',
        },
      },
      {
        authId: new BigNumber(3),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid4' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid4' }),
        data: {
          type: AuthorizationType.BecomeAgent,
          value: entityMockUtils.getKnownPermissionGroupInstance(),
        },
      },
      {
        authId: new BigNumber(4),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid5' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid5' }),
        data: {
          type: AuthorizationType.PortfolioCustody,
          value: entityMockUtils.getDefaultPortfolioInstance({ did: 'issuerDid5' }),
        },
      },
      {
        authId: new BigNumber(5),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid6' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid6' }),
        data: {
          type: AuthorizationType.TransferTicker,
          value: 'SOME_TICKER6',
        },
      },
      {
        authId: new BigNumber(6),
        expiry: new Date('10/14/1987'), // expired
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid7' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid7' }),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'SOME_TICKER7',
        },
      },
    ];
    auths = [];
    rawAuthIds = [];
    rawAuthIdentifiers = [];
    authParams.forEach(params => {
      const { authId, target } = params;

      const signerValue = utilsConversionModule.signerToSignerValue(target);

      auths.push(new AuthorizationRequest(params, mockContext));

      const rawAuthId = dsMockUtils.createMockU64(authId);
      rawAuthIds.push([rawAuthId]);
      when(bigNumberToU64Spy).calledWith(authId, mockContext).mockReturnValue(rawAuthId);
      const rawSignatory = dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(signerValue.value),
      });

      rawAuthIdentifiers.push([rawSignatory, rawAuthId, rawFalseBool]);
      when(signerValueToSignatorySpy)
        .calledWith(signerValue, mockContext)
        .mockReturnValue(rawSignatory);
    });
    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalseBool);

    acceptAssetOwnershipTransferTransaction = dsMockUtils.createTxMock(
      'asset',
      'acceptAssetOwnershipTransfer'
    );
    acceptBecomeAgentTransaction = dsMockUtils.createTxMock('externalAgents', 'acceptBecomeAgent');
    acceptPortfolioCustodyTransaction = dsMockUtils.createTxMock(
      'portfolio',
      'acceptPortfolioCustody'
    );
    acceptTickerTransferTransaction = dsMockUtils.createTxMock('asset', 'acceptTickerTransfer');
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

  it('should return a batch spec of accept authorization transactions (dependent on the type of auth) and ignore expired requests', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
      mockContext
    );

    const result = await prepareConsumeAuthorizationRequests.call(proc, {
      accept: true,
      authRequests: auths,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: acceptBecomeAgentTransaction,
          args: rawAuthIds[1],
        },
        {
          transaction: acceptPortfolioCustodyTransaction,
          args: rawAuthIds[2],
        },
        {
          transaction: acceptAssetOwnershipTransferTransaction,
          args: rawAuthIds[0],
        },
        {
          transaction: acceptTickerTransferTransaction,
          args: rawAuthIds[3],
        },
      ],
      resolver: undefined,
    });
  });

  it('should return a batch of remove authorization transactions spec and ignore expired requests', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'removeAuthorization');

    const result = await prepareConsumeAuthorizationRequests.call(proc, {
      accept: false,
      authRequests: auths,
    });

    const authIds = rawAuthIdentifiers.slice(0, -1);

    expect(result).toEqual({
      transactions: authIds.map(authId => ({ transaction, args: authId })),
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return whether the signing Identity or Account is the target of all non-expired requests if trying to accept', async () => {
      const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
        mockContext
      );
      const { did } = await mockContext.getSigningIdentity();
      const constructorParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          target: entityMockUtils.getIdentityInstance({ did }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
          data: {
            type: AuthorizationType.BecomeAgent,
          } as Authorization,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/1987'), // expired
          target: entityMockUtils.getIdentityInstance({ did: 'notTheSigningIdentity' }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid2' }),
          data: {
            type: AuthorizationType.PortfolioCustody,
          } as Authorization,
        },
      ];
      const args = {
        accept: true,
        authRequests: constructorParams.map(
          params => new AuthorizationRequest(params, mockContext)
        ),
      } as ConsumeAuthorizationRequestsParams;

      const boundFunc = getAuthorization.bind(proc);
      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [
            TxTags.externalAgents.AcceptBecomeAgent,
            TxTags.portfolio.AcceptPortfolioCustody,
          ],
        },
      });

      args.authRequests[0].target = entityMockUtils.getIdentityInstance({
        isEqual: false,
        did: 'someoneElse',
      });
      args.authRequests[0].issuer = entityMockUtils.getIdentityInstance({
        isEqual: false,
        did: 'someoneElse',
      });
      args.accept = false;

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          'Authorization Requests can only be accepted by the target Account/Identity. They can only be rejected by the target Account/Identity or the issuing Identity',
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      args.authRequests[0].target = entityMockUtils.getAccountInstance({ isEqual: false });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          'Authorization Requests can only be accepted by the target Account/Identity. They can only be rejected by the target Account/Identity or the issuing Identity',
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });
    });
  });
});
