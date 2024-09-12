import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRemoveMultiSigPayer,
  prepareStorage,
  Storage,
} from '~/api/procedures/removeMultiSigPayer';
import { Context, Identity, MultiSig, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('removeMultiSigPayer procedure', () => {
  const payerDid = 'payerDid';
  const signingDid = 'signingDid';
  const multiSigAddress = 'multiSigAddress';

  let mockContext: Mocked<Context>;
  let multiSig: MultiSig;
  let currentPayer: Identity;
  let rawMultiSigAddress: AccountId;
  let stringToAccountIdSpy: jest.SpyInstance;
  let signingIdentity: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  let removePayerTransaction: PolymeshTx<[PolymeshPrimitivesIdentityId]>;
  let removePayerViaPayerTransaction: PolymeshTx<[]>;

  beforeEach(() => {
    signingIdentity = entityMockUtils.getIdentityInstance({ did: signingDid });
    currentPayer = entityMockUtils.getIdentityInstance({ did: payerDid });

    mockContext = dsMockUtils.getContextInstance({ getSigningIdentity: signingIdentity });

    multiSig = entityMockUtils.getMultiSigInstance({
      address: multiSigAddress,
      getPayer: currentPayer,
    });
    rawMultiSigAddress = dsMockUtils.createMockAccountId(multiSigAddress);
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');

    when(stringToAccountIdSpy)
      .calledWith(multiSigAddress, mockContext)
      .mockReturnValue(rawMultiSigAddress);

    removePayerTransaction = dsMockUtils.createTxMock('multiSig', 'removePayer');
    removePayerViaPayerTransaction = dsMockUtils.createTxMock('multiSig', 'removePayerViaPayer');
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

  it('should throw an error if the chain is on v6', () => {
    mockContext.isV6 = true;
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      currentPayer: null,
      isMultiSigSigner: true,
      signingIdentity,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.General,
      message: 'MultiSig payers are not supported on v6 chains',
    });

    return expect(prepareRemoveMultiSigPayer.call(proc, { multiSig })).rejects.toThrow(
      expectedError
    );
  });

  it('should throw an error if there is no payer set for the MultiSig', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      currentPayer: null,
      isMultiSigSigner: true,
      signingIdentity,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The multiSig does not have a payer set',
    });

    return expect(prepareRemoveMultiSigPayer.call(proc, { multiSig })).rejects.toThrow(
      expectedError
    );
  });

  it('should return a remove payer transaction if the signer is a multiSig signer', async () => {
    currentPayer = entityMockUtils.getIdentityInstance({ did: payerDid, isEqual: false });
    multiSig = entityMockUtils.getMultiSigInstance({
      details: { requiredSignatures: new BigNumber(1), signers: [mockContext.getSigningAccount()] },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      isMultiSigSigner: true,
      signingIdentity,
      currentPayer,
    });

    const result = await prepareRemoveMultiSigPayer.call(proc, {
      multiSig,
    });

    expect(result).toEqual({
      transaction: removePayerTransaction,
      args: undefined,
      resolver: undefined,
    });
  });

  it('should return a remove payer via payer transaction if the signer is the payer', async () => {
    currentPayer = entityMockUtils.getIdentityInstance({ did: signingDid, isEqual: true });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      currentPayer,
      signingIdentity,
      isMultiSigSigner: false,
    });

    const result = await prepareRemoveMultiSigPayer.call(proc, {
      multiSig,
    });

    expect(result).toEqual({
      transaction: removePayerViaPayerTransaction,
      args: [rawMultiSigAddress],
      resolver: undefined,
    });
  });

  it('should throw an error if the signer is not the payer nor part of the multiSig', () => {
    currentPayer = entityMockUtils.getIdentityInstance({ isEqual: false });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      currentPayer,
      signingIdentity,
      isMultiSigSigner: false,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: "The signing account is not part of the MultiSig nor the payer's identity",
    });

    return expect(
      prepareRemoveMultiSigPayer.call(proc, {
        multiSig,
      })
    ).rejects.toThrow(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return RemovePayer transaction when removing via signer', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        currentPayer,
        signingIdentity,
        isMultiSigSigner: true,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RemovePayer],
        },
      });
    });

    it('should return RemovePayerViaPayer transaction when removing via payer', () => {
      currentPayer = entityMockUtils.getIdentityInstance({ did: 'someOtherDid', isEqual: false });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        currentPayer,
        signingIdentity,
        isMultiSigSigner: false,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RemovePayerViaPayer],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the storage data', async () => {
      signingIdentity = await mockContext.getSigningIdentity();
      multiSig = entityMockUtils.getMultiSigInstance({
        details: {
          requiredSignatures: new BigNumber(1),
          signers: [entityMockUtils.getAccountInstance({ isEqual: true })],
        },
        getPayer: currentPayer,
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc({ multiSig })).resolves.toEqual({
        currentPayer,
        isMultiSigSigner: true,
        signingIdentity,
      });
    });
  });
});
