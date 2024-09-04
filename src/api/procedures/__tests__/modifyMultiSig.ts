import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  assertNoDataChange,
  assertRequiredSignersExceedsSigners,
  assertValidRequiredSignatures,
  getAuthorization,
  modifyMultiSig,
  prepareModifyMultiSig,
  prepareStorage,
} from '~/api/procedures/modifyMultiSig';
import { Context, ModifyMultiSigStorage, MultiSig, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { getAccountInstance, getIdentityInstance, MockMultiSig } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, ModifyMultiSigParams, TxTags } from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account/MultiSig',
  require('~/testUtils/mocks/entities').mockMultiSigModule('~/api/entities/Account/MultiSig')
);

describe('modifyMultiSig procedure', () => {
  let mockContext: Mocked<Context>;
  let rawAccountId: AccountId;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let signerToSignatorySpy: jest.SpyInstance;

  const oldSigner1 = getAccountInstance({ address: 'abc' });
  const oldSigner2 = getAccountInstance({ address: 'def' });
  const newSigner1 = getAccountInstance({ address: 'xyz' });
  const newSigner2 = getAccountInstance({ address: 'jki' });

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAccountIdSpy = jest
      .spyOn(utilsConversionModule, 'stringToAccountId')
      .mockImplementation();
    signerToSignatorySpy = jest
      .spyOn(utilsConversionModule, 'signerToSignatory')
      .mockImplementation();
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      multiSigOptions: {
        getCreator: getIdentityInstance({ did: 'abc' }),
      },
    });
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    mockContext = dsMockUtils.getContextInstance();
    when(stringToAccountIdSpy)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);

    when(signerToSignatorySpy).calledWith(oldSigner1, mockContext).mockReturnValue('oldOne');
    when(signerToSignatorySpy).calledWith(oldSigner2, mockContext).mockReturnValue('oldTwo');
    when(signerToSignatorySpy).calledWith(newSigner1, mockContext).mockReturnValue('newOne');
    when(signerToSignatorySpy).calledWith(newSigner2, mockContext).mockReturnValue('newTwo');
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

  it('should throw an error if the supplied type signers are the same as the current ones', () => {
    const signers = [getAccountInstance({ address: 'abc' })];

    const args = {
      multiSig: entityMockUtils.getMultiSigInstance({
        details: {
          signers,
          requiredSignatures: new BigNumber(1),
        },
      }),
      signers,
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [],
        signersToRemove: [],
        requiredSignatures: new BigNumber(2),
        currentSignerCount: 2,
      }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The given signers are equal to the current signers. At least one signer should be added or removed',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if called by someone who is not the creator', () => {
    const args = {
      multiSig: entityMockUtils.getMultiSigInstance({
        getCreator: getIdentityInstance({ isEqual: false }),
      }),
      signers: [getAccountInstance()],
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1],
        signersToRemove: [],
        requiredSignatures: new BigNumber(1),
        currentSignerCount: 2,
      }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its creator',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should add update and remove signer transactions to the queue', async () => {
    const multiSig = entityMockUtils.getMultiSigInstance({
      address: DUMMY_ACCOUNT_ID,
      getCreator: getIdentityInstance(),
    });

    const args = {
      multiSig,
      signers: [newSigner1, newSigner2],
    };

    const addTransaction = dsMockUtils.createTxMock('multiSig', 'addMultisigSignersViaCreator');
    const removeTransaction = dsMockUtils.createTxMock(
      'multiSig',
      'removeMultisigSignersViaCreator'
    );

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1, newSigner2],
        signersToRemove: [oldSigner1, oldSigner2],
        requiredSignatures: new BigNumber(2),
        currentSignerCount: 2,
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addTransaction,
          args: [rawAccountId, ['newOne', 'newTwo']],
        },
        {
          transaction: removeTransaction,
          args: [rawAccountId, ['oldOne', 'oldTwo']],
        },
      ],
    });
  });

  it('should only add an add signers transaction if no signers are to be removed', async () => {
    const multiSig = entityMockUtils.getMultiSigInstance({
      address: DUMMY_ACCOUNT_ID,
      getCreator: getIdentityInstance(),
    });

    const args = {
      multiSig,
      signers: [oldSigner1, oldSigner2, newSigner1, newSigner2],
    };

    const addTransaction = dsMockUtils.createTxMock('multiSig', 'addMultisigSignersViaCreator');

    when(signerToSignatorySpy).calledWith(newSigner1, mockContext).mockReturnValue('newOne');
    when(signerToSignatorySpy).calledWith(newSigner2, mockContext).mockReturnValue('newTwo');

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1, newSigner2],
        signersToRemove: [],
        requiredSignatures: new BigNumber(2),
        currentSignerCount: 2,
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addTransaction,
          args: [rawAccountId, ['newOne', 'newTwo']],
        },
      ],
    });
  });

  it('should add only a remove transaction to the queue if there are no signers to add', async () => {
    const multiSig = entityMockUtils.getMultiSigInstance({
      address: DUMMY_ACCOUNT_ID,
      getCreator: getIdentityInstance(),
    });

    const args = {
      multiSig,
      signers: [oldSigner1],
    };

    const removeTransaction = dsMockUtils.createTxMock(
      'multiSig',
      'removeMultisigSignersViaCreator'
    );

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [],
        signersToRemove: [oldSigner2],
        requiredSignatures: new BigNumber(1),
        currentSignerCount: 2,
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [{ transaction: removeTransaction, args: [rawAccountId, ['oldTwo']] }],
    });
  });

  it('should modify the requiredSignatures', async () => {
    const multiSig = entityMockUtils.getMultiSigInstance({
      address: DUMMY_ACCOUNT_ID,
      getCreator: getIdentityInstance(),
    });
    const bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');

    const newRequiredSignatures = new BigNumber(2);

    const args: ModifyMultiSigParams = {
      multiSig,
      requiredSignatures: newRequiredSignatures,
    };

    const changeSigsRequiredTx = dsMockUtils.createTxMock(
      'multiSig',
      'changeSigsRequiredViaCreator'
    );

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [],
        signersToRemove: [],
        requiredSignatures: new BigNumber(1),
        currentSignerCount: 3,
      }
    );

    const rawSigsRequired = dsMockUtils.createMockU64(new BigNumber(2));
    when(bigNumberToU64Spy)
      .calledWith(newRequiredSignatures, mockContext)
      .mockReturnValue(rawSigsRequired);

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [{ transaction: changeSigsRequiredTx, args: [rawAccountId, rawSigsRequired] }],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
        mockContext,
        {
          signersToAdd: [newSigner1],
          signersToRemove: [],
          requiredSignatures: new BigNumber(1),
          currentSignerCount: 2,
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      let result = boundFunc({});
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.AddMultisigSignersViaCreator],
          assets: undefined,
          portfolios: undefined,
        },
      });

      proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
        mockContext,
        {
          signersToAdd: [],
          signersToRemove: [oldSigner1],
          requiredSignatures: new BigNumber(1),
          currentSignerCount: 2,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      result = boundFunc({});

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RemoveMultisigSignersViaCreator],
          assets: undefined,
          portfolios: undefined,
        },
      });

      proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
        mockContext,
        {
          signersToAdd: [],
          signersToRemove: [],
          requiredSignatures: new BigNumber(1),
          currentSignerCount: 2,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      result = boundFunc({ requiredSignatures: new BigNumber(2) });

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.ChangeSigsRequiredViaCreator],
          assets: undefined,
          portfolios: undefined,
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the relevant data', async () => {
      const multiSig = new MultiSig({ address: 'abc' }, mockContext) as MockMultiSig;
      multiSig.details.mockResolvedValue({
        signers: [oldSigner1, oldSigner2],
        requiredSignatures: new BigNumber(3),
      });

      const proc = procedureMockUtils.getInstance<
        ModifyMultiSigParams,
        void,
        ModifyMultiSigStorage
      >(mockContext, {
        signersToAdd: [],
        signersToRemove: [],
        requiredSignatures: new BigNumber(3),
        currentSignerCount: 2,
      });

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({ signers: [newSigner1, newSigner2], multiSig });
      expect(result).toEqual({
        signersToRemove: [oldSigner1, oldSigner2],
        signersToAdd: [newSigner1, newSigner2],
        requiredSignatures: new BigNumber(3),
        currentSignerCount: 2,
      });
    });

    it('should return empty arrays for signersToAdd and signersToRemove if no signers provided', async () => {
      const multiSig = new MultiSig({ address: 'abc' }, mockContext) as MockMultiSig;
      multiSig.details.mockResolvedValue({
        signers: [oldSigner1, oldSigner2],
        requiredSignatures: new BigNumber(3),
      });

      const proc = procedureMockUtils.getInstance<
        ModifyMultiSigParams,
        void,
        ModifyMultiSigStorage
      >(mockContext, {
        signersToAdd: [],
        signersToRemove: [],
        requiredSignatures: new BigNumber(3),
        currentSignerCount: 2,
      });

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({ signers: undefined, multiSig });
      expect(result).toEqual({
        signersToRemove: [],
        signersToAdd: [],
        requiredSignatures: new BigNumber(3),
        currentSignerCount: 2,
      });
    });
  });

  describe('assertRequiredSignersExceedsSigners', () => {
    it('should throw an error if the number of signatures required to be set exceeds the number of current signers', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The number of required signatures should not exceed the number of signers',
      });

      try {
        assertRequiredSignersExceedsSigners(2, new BigNumber(2), undefined, new BigNumber(4));
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });

    it('should throw an error if the number of signers is less than required signatures', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The number of signers should not be less than the number of required signatures',
      });

      try {
        assertRequiredSignersExceedsSigners(2, new BigNumber(3), [newSigner1, newSigner2]);
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });

    it('should throw an error if the number of signers is less than required signatures to be set', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The number of signers should not be less than the number of required signatures',
      });

      try {
        assertRequiredSignersExceedsSigners(
          2,
          new BigNumber(2),
          [newSigner1, newSigner2],
          new BigNumber(3)
        );
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('assertNoDataChange', () => {
    it('should throw an error if no signers are to be added/removed but were provided', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message:
          'The given signers are equal to the current signers. At least one signer should be added or removed',
      });

      try {
        assertNoDataChange(new BigNumber(2), [], [], [oldSigner1, oldSigner2]);
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
    it('should throw an error if required signatures to be set equals current', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message:
          'The given required signatures are equal to the current required signatures. The number of required signatures should be different',
      });

      try {
        assertNoDataChange(new BigNumber(2), [], [], undefined, new BigNumber(2));
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('assertValidRequiredSignatures', () => {
    it('should throw an error if required signatures to be set is less than 1', () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The number of required signatures should be at least 1',
      });

      try {
        assertValidRequiredSignatures(new BigNumber(0));
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('modifyMultiSig', () => {
    it('should return an instance of Procedure', async () => {
      const result = modifyMultiSig();

      expect(result).toBeInstanceOf(Procedure);
    });
  });
});
