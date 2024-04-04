import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesSecondaryKeySignatory,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareSetCustodian } from '~/api/procedures/setCustodian';
import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Authorization,
  AuthorizationType,
  PortfolioId,
  RoleType,
  SignerType,
  SignerValue,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
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
  '~/api/entities/AuthorizationRequest',
  require('~/testUtils/mocks/entities').mockAuthorizationRequestModule(
    '~/api/entities/AuthorizationRequest'
  )
);

describe('setCustodian procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
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

  it('should throw an error if the passed Account has a pending authorization to accept', () => {
    const did = 'someDid';
    const args = { targetIdentity: 'targetIdentity', did };

    const target = entityMockUtils.getIdentityInstance({ did: args.targetIdentity });
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const fakePortfolio = entityMockUtils.getDefaultPortfolioInstance({ did });
    const receivedAuthorizations: AuthorizationRequest[] = [
      entityMockUtils.getAuthorizationRequestInstance({
        target,
        issuer: entityMockUtils.getIdentityInstance({ did }),
        authId: new BigNumber(1),
        expiry: null,
        data: { type: AuthorizationType.PortfolioCustody, value: fakePortfolio },
      }),
    ];

    entityMockUtils.configureMocks({
      identityOptions: {
        authorizationsGetReceived: receivedAuthorizations,
      },
    });

    when(signerToStringSpy).calledWith(signer).mockReturnValue(signer.address);
    when(signerToStringSpy).calledWith(args.targetIdentity).mockReturnValue(args.targetIdentity);
    when(signerToStringSpy).calledWith(target).mockReturnValue(args.targetIdentity);

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    return expect(prepareSetCustodian.call(proc, args)).rejects.toThrow(
      "The target Identity already has a pending invitation to be the Portfolio's custodian"
    );
  });

  it('should return an add authorization transaction spec', async () => {
    const did = 'someDid';
    const id = new BigNumber(1);
    const expiry = new Date('1/1/2040');
    const args = { targetIdentity: 'targetIdentity', did };
    const target = entityMockUtils.getIdentityInstance({ did: args.targetIdentity });
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });
    const rawDid = dsMockUtils.createMockIdentityId(did);
    const rawPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(id),
    });
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      PortfolioCustody: dsMockUtils.createMockPortfolioId({ did: rawDid, kind: rawPortfolioKind }),
    });
    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
    const fakePortfolio = entityMockUtils.getNumberedPortfolioInstance({ isEqual: false });
    const receivedAuthorizations: AuthorizationRequest[] = [
      entityMockUtils.getAuthorizationRequestInstance({
        target,
        issuer: entityMockUtils.getIdentityInstance(),
        authId: new BigNumber(1),
        expiry: null,
        data: { type: AuthorizationType.PortfolioCustody, value: fakePortfolio },
      }),
    ];

    entityMockUtils.configureMocks({
      identityOptions: {
        authorizationsGetReceived: receivedAuthorizations,
      },
      defaultPortfolioOptions: {
        isEqual: false,
      },
      numberedPortfolioOptions: {
        isEqual: false,
      },
    });

    when(signerToStringSpy).calledWith(signer).mockReturnValue(signer.address);
    when(signerToStringSpy).calledWith(args.targetIdentity).mockReturnValue(args.targetIdentity);
    when(signerToStringSpy).calledWith(target).mockReturnValue('someValue');
    when(signerValueToSignatorySpy)
      .calledWith({ type: SignerType.Identity, value: args.targetIdentity }, mockContext)
      .mockReturnValue(rawSignatory);
    authorizationToAuthorizationDataSpy.mockReturnValue(rawAuthorizationData);
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');

    let result = await prepareSetCustodian.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    result = await prepareSetCustodian.call(proc, { ...args, id, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawExpiry],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const id = new BigNumber(1);
      const did = 'someDid';
      let args = {
        id,
        did,
      } as Params;

      let portfolioId: PortfolioId = { did: args.did, number: args.id };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }), id })],
          assets: [],
        },
      });

      args = {
        did,
      } as Params;

      portfolioId = { did: args.did };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }) })],
          assets: [],
        },
      });
    });
  });
});
