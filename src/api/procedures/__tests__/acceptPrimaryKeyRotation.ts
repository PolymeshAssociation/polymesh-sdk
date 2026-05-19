import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareAcceptPrimaryKeyRotation,
  prepareStorage,
  Storage,
} from '~/api/procedures/acceptPrimaryKeyRotation';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { AuthorizationRequest, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AcceptPrimaryKeyRotationParams, Account, AuthorizationType, ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('acceptPrimaryKeyRotation procedure', () => {
  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let ownerAuthId: BigNumber;
  let rawOwnerAuthId: u64;
  let cddAuthId: BigNumber;
  let rawCddAuthId: u64;
  let ownerAuthRequest: AuthorizationRequest;
  let cddAuthRequest: AuthorizationRequest;
  let targetAddress: string;
  let targetAccount: Account;
  let getOneMock: jest.Mock;

  beforeAll(() => {
    targetAddress = 'someAddress';
    dsMockUtils.initMocks({
      contextOptions: {
        signingAddress: targetAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    jest.spyOn(procedureUtilsModule, 'assertAuthorizationRequestValid').mockImplementation();

    ownerAuthId = new BigNumber(1);
    rawOwnerAuthId = dsMockUtils.createMockU64(ownerAuthId);

    cddAuthId = new BigNumber(2);
    rawCddAuthId = dsMockUtils.createMockU64(cddAuthId);

    getOneMock = jest.fn();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({ isV7: true });
    when(bigNumberToU64Spy).calledWith(ownerAuthId, mockContext).mockReturnValue(rawOwnerAuthId);
    when(bigNumberToU64Spy).calledWith(cddAuthId, mockContext).mockReturnValue(rawCddAuthId);
    mockContext.getSigningAccount().authorizations.getOne = getOneMock;
    targetAccount = entityMockUtils.getAccountInstance({
      address: targetAddress,
      authorizationsGetOne: getOneMock,
    });

    ownerAuthRequest = entityMockUtils.getAuthorizationRequestInstance({
      authId: ownerAuthId,
      target: targetAccount,
    });
    cddAuthRequest = entityMockUtils.getAuthorizationRequestInstance({
      authId: cddAuthId,
      issuer: entityMockUtils.getIdentityInstance(),
      target: targetAccount,
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

  it('should return an acceptPrimaryKey transaction spec for v7 chain', async () => {
    const transaction = dsMockUtils.createTxMock('identity', 'acceptPrimaryKey');

    let proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
      mockContext,
      {
        calledByTarget: true,
        ownerAuthRequest,
        cddAuthRequest: undefined,
      }
    );

    let result = await prepareAcceptPrimaryKeyRotation.call(proc);

    expect(result).toEqual({
      transaction,
      paidForBy: ownerAuthRequest.issuer,
      args: [rawOwnerAuthId, null],
      resolver: undefined,
    });

    proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
      mockContext,
      {
        calledByTarget: true,
        ownerAuthRequest,
        cddAuthRequest,
      }
    );

    result = await prepareAcceptPrimaryKeyRotation.call(proc);

    expect(result).toEqual({
      transaction,
      paidForBy: ownerAuthRequest.issuer,
      args: [rawOwnerAuthId, rawCddAuthId],
      resolver: undefined,
    });
  });

  it('should return an acceptPrimaryKey transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('identity', 'acceptPrimaryKey');
    const v8MockContext = dsMockUtils.getContextInstance({ isV7: false });
    when(bigNumberToU64Spy).calledWith(ownerAuthId, v8MockContext).mockReturnValue(rawOwnerAuthId);

    const proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
      v8MockContext,
      {
        calledByTarget: true,
        ownerAuthRequest,
        cddAuthRequest: undefined,
      }
    );

    const result = await prepareAcceptPrimaryKeyRotation.call(proc);

    expect(result).toEqual({
      transaction,
      paidForBy: ownerAuthRequest.issuer,
      args: [rawOwnerAuthId],
      resolver: undefined,
    });
  });

  describe('prepareStorage', () => {
    it('should return whether the target is the caller, owner AuthorizationRequest and the CDD AuthorizationRequest (if any)', async () => {
      dsMockUtils.getContextInstance({
        signingAddress: targetAddress,
        signingAccountIsEqual: true,
        isV7: true,
      });

      mockContext.getSigningAccount().authorizations.getOne = getOneMock;

      when(getOneMock).calledWith({ id: ownerAuthId }).mockResolvedValue(ownerAuthRequest);

      when(getOneMock).calledWith({ id: cddAuthId }).mockResolvedValue(cddAuthRequest);

      let proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext
      );
      let boundFunc = prepareStorage.bind(proc);

      let result = await boundFunc({
        ownerAuth: ownerAuthId,
        cddAuth: cddAuthId,
      });

      expect(result).toEqual({
        calledByTarget: true,
        ownerAuthRequest,
        cddAuthRequest,
      });

      proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext
      );

      boundFunc = prepareStorage.bind(proc);

      dsMockUtils.getContextInstance({
        signingAddress: 'someOtherAddress',
        signingAccountIsEqual: false,
      });

      result = await boundFunc({
        ownerAuth: ownerAuthRequest,
      });

      expect(result).toEqual({
        calledByTarget: false,
        ownerAuthRequest,
        cddAuthRequest: undefined,
      });
    });

    it('should throw an error if cddAuth is provided on v8 chain', async () => {
      const v8MockContext = dsMockUtils.getContextInstance({
        signingAddress: targetAddress,
        signingAccountIsEqual: true,
        isV7: false,
      });

      const proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        v8MockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'CDD is discontinued since v8',
      });

      await expect(
        boundFunc({
          ownerAuth: ownerAuthId,
          cddAuth: cddAuthId,
        })
      ).rejects.toThrow(expectedError);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext,
        {
          calledByTarget: false,
          ownerAuthRequest: entityMockUtils.getAuthorizationRequestInstance(),
          cddAuthRequest: undefined,
        }
      );

      let boundFunc = getAuthorization.bind(proc);
      let result = boundFunc();
      expect(result).toEqual({
        roles: `"${AuthorizationType.RotatePrimaryKey}" Authorization Requests must be accepted by the target Account`,
      });

      proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext,
        {
          calledByTarget: true,
          ownerAuthRequest: entityMockUtils.getAuthorizationRequestInstance(),
          cddAuthRequest: undefined,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      result = boundFunc();
      expect(result).toEqual({
        roles: true,
      });
    });
  });
});
