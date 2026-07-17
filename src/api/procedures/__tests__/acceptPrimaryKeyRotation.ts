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
import { AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AcceptPrimaryKeyRotationParams, Account, AuthorizationType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('acceptPrimaryKeyRotation procedure', () => {
  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let ownerAuthId: BigNumber;
  let rawOwnerAuthId: u64;
  let ownerAuthRequest: AuthorizationRequest;
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

    getOneMock = jest.fn();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(ownerAuthId, mockContext).mockReturnValue(rawOwnerAuthId);
    mockContext.getSigningAccount().authorizations.getOne = getOneMock;
    targetAccount = entityMockUtils.getAccountInstance({
      address: targetAddress,
      authorizationsGetOne: getOneMock,
    });

    ownerAuthRequest = entityMockUtils.getAuthorizationRequestInstance({
      authId: ownerAuthId,
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

  it('should return an acceptPrimaryKey transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('identity', 'acceptPrimaryKey');

    const proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
      mockContext,
      {
        calledByTarget: true,
        ownerAuthRequest,
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
    it('should return whether the target is the caller and the owner AuthorizationRequest', async () => {
      dsMockUtils.getContextInstance({
        signingAddress: targetAddress,
        signingAccountIsEqual: true,
      });

      mockContext.getSigningAccount().authorizations.getOne = getOneMock;

      when(getOneMock).calledWith({ id: ownerAuthId }).mockResolvedValue(ownerAuthRequest);

      let proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext
      );
      let boundFunc = prepareStorage.bind(proc);

      let result = await boundFunc({
        ownerAuth: ownerAuthId,
      });

      expect(result).toEqual({
        calledByTarget: true,
        ownerAuthRequest,
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
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<AcceptPrimaryKeyRotationParams, void, Storage>(
        mockContext,
        {
          calledByTarget: false,
          ownerAuthRequest: entityMockUtils.getAuthorizationRequestInstance(),
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
