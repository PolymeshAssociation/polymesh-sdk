import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetMultiSigAdmin,
} from '~/api/procedures/setMultiSigAdmin';
import { Context, Identity, MultiSig, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('setMultiSigAdmin procedure', () => {
  const adminDid = 'adminDid';
  const multiSigAddress = 'multiSigAddress';

  let mockContext: Mocked<Context>;
  let multiSig: MultiSig;
  let adminIdentity: Identity;
  let rawAdminDid: PolymeshPrimitivesIdentityId;
  let rawMultiSigAddress: AccountId;
  let stringToAccountIdSpy: jest.SpyInstance;
  let stringToIdentityIdSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  let addAdminTransaction: PolymeshTx<[PolymeshPrimitivesIdentityId]>;
  let removeAdminTransaction: PolymeshTx<[AccountId]>;

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    adminIdentity = entityMockUtils.getIdentityInstance({ did: adminDid });
    rawAdminDid = dsMockUtils.createMockIdentityId(adminDid);
    multiSig = entityMockUtils.getMultiSigInstance({ address: multiSigAddress });
    rawMultiSigAddress = dsMockUtils.createMockAccountId(multiSigAddress);
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');

    when(stringToAccountIdSpy)
      .calledWith(multiSigAddress, mockContext)
      .mockReturnValue(rawMultiSigAddress);
    when(stringToIdentityIdSpy).calledWith(adminDid, mockContext).mockReturnValue(rawAdminDid);

    addAdminTransaction = dsMockUtils.createTxMock('multiSig', 'addAdmin');
    removeAdminTransaction = dsMockUtils.createTxMock('multiSig', 'removeAdminViaAdmin');
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

  it('should throw an error if the supplied identity is already an admin for the MultiSig', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The identity is already the admin of the MultiSig',
    });

    return expect(
      prepareSetMultiSigAdmin.call(proc, { multiSig, admin: adminIdentity })
    ).rejects.toThrow(expectedError);
  });

  it('should return an add admin transaction when given an admin', async () => {
    adminIdentity = entityMockUtils.getIdentityInstance({ did: adminDid, isEqual: false });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signing account is not part of the MultiSig',
    });

    return expect(
      prepareSetMultiSigAdmin.call(proc, {
        multiSig,
        admin: adminIdentity,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return an add admin transaction when given an admin', async () => {
    adminIdentity = entityMockUtils.getIdentityInstance({ did: adminDid, isEqual: false });
    multiSig = entityMockUtils.getMultiSigInstance({
      details: { requiredSignatures: new BigNumber(1), signers: [mockContext.getSigningAccount()] },
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetMultiSigAdmin.call(proc, {
      multiSig,
      admin: adminIdentity,
    });

    expect(result).toEqual({
      transaction: addAdminTransaction,
      args: [rawAdminDid],
      resolver: undefined,
    });
  });

  it('should throw an error if trying to remove an admin from a MultiSig without one', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    multiSig = entityMockUtils.getMultiSigInstance({
      getAdmin: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The multiSig does not have an admin set currently',
      data: { multiSig: multiSig.address },
    });

    return expect(
      prepareSetMultiSigAdmin.call(proc, {
        multiSig,
        admin: null,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if an identity that is not the admin is calling for remove', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    mockContext = dsMockUtils.getContextInstance({
      signingIdentityIsEqual: false,
    });

    multiSig = entityMockUtils.getMultiSigInstance({
      getAdmin: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: "Only the current admin's identity can remove themselves",
    });

    return expect(
      prepareSetMultiSigAdmin.call(proc, {
        multiSig,
        admin: null,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return an remove admin transaction when given null for an admin', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetMultiSigAdmin.call(proc, {
      multiSig,
      admin: null,
    });

    expect(result).toEqual({
      transaction: removeAdminTransaction,
      args: [rawMultiSigAddress],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return AddAdmin transaction when adding an admin', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        admin: adminIdentity,
        multiSig,
      };

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.AddAdmin],
        },
      });
    });

    it('should return RemoveAdminViaAdmin transaction when removing an admin', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        admin: null,
        multiSig,
      };

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RemoveAdminViaAdmin],
        },
      });
    });
  });
});
