import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareModifyMultiSig,
  prepareStorage,
} from '~/api/procedures/modifyMultiSig';
import { Context, ModifyMultiSigStorage, MultiSig, PolymeshError } from '~/internal';
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

  let rawOldSigner1: AccountId;
  let rawOldSigner2: AccountId;
  let rawNewSigner1: AccountId;
  let rawNewSigner2: AccountId;

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
    rawOldSigner1 = dsMockUtils.createMockAccountId(oldSigner1.address);
    rawOldSigner2 = dsMockUtils.createMockAccountId(oldSigner2.address);
    rawNewSigner1 = dsMockUtils.createMockAccountId(newSigner1.address);
    rawNewSigner2 = dsMockUtils.createMockAccountId(newSigner1.address);

    mockContext = dsMockUtils.getContextInstance();
    when(stringToAccountIdSpy)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);

    when(signerToSignatorySpy).calledWith(oldSigner1, mockContext).mockReturnValue('oldOne');
    when(signerToSignatorySpy).calledWith(oldSigner2, mockContext).mockReturnValue('oldTwo');
    when(signerToSignatorySpy).calledWith(newSigner1, mockContext).mockReturnValue('newOne');
    when(signerToSignatorySpy).calledWith(newSigner2, mockContext).mockReturnValue('newTwo');

    // for v7 tests
    when(stringToAccountIdSpy)
      .calledWith(oldSigner1.address, mockContext)
      .mockReturnValue(rawOldSigner1);
    when(stringToAccountIdSpy)
      .calledWith(oldSigner2.address, mockContext)
      .mockReturnValue(rawOldSigner2);
    when(stringToAccountIdSpy)
      .calledWith(newSigner1.address, mockContext)
      .mockReturnValue(rawNewSigner1);
    when(stringToAccountIdSpy)
      .calledWith(newSigner2.address, mockContext)
      .mockReturnValue(rawNewSigner2);
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
      }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The given signers are equal to the current signers. At least one signer should be added or removed',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if called by someone who is not the admin', () => {
    const args = {
      multiSig: entityMockUtils.getMultiSigInstance({
        getAdmin: getIdentityInstance({ isEqual: false }),
      }),
      signers: [getAccountInstance()],
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1],
        signersToRemove: [],
        requiredSignatures: new BigNumber(1),
      }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its admin',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the number of signatures required exceeds the number of signers', () => {
    const args = {
      multiSig: entityMockUtils.getMultiSigInstance({
        getCreator: getIdentityInstance(),
      }),
      signers: [newSigner1],
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      { signersToAdd: [newSigner1], signersToRemove: [], requiredSignatures: new BigNumber(3) }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
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

    const addTransaction = dsMockUtils.createTxMock('multiSig', 'addMultisigSignersViaAdmin');
    const removeTransaction = dsMockUtils.createTxMock('multiSig', 'removeMultisigSignersViaAdmin');

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1, newSigner2],
        signersToRemove: [oldSigner1, oldSigner2],
        requiredSignatures: new BigNumber(2),
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addTransaction,
          args: [rawAccountId, [rawNewSigner1, rawNewSigner2]],
        },
        {
          transaction: removeTransaction,
          args: [rawAccountId, [rawOldSigner1, rawOldSigner2]],
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

    const addTransaction = dsMockUtils.createTxMock('multiSig', 'addMultisigSignersViaAdmin');

    when(signerToSignatorySpy).calledWith(newSigner1, mockContext).mockReturnValue('newOne');
    when(signerToSignatorySpy).calledWith(newSigner2, mockContext).mockReturnValue('newTwo');

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [newSigner1, newSigner2],
        signersToRemove: [],
        requiredSignatures: new BigNumber(2),
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addTransaction,
          args: [rawAccountId, [rawNewSigner1, rawNewSigner2]],
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

    const removeTransaction = dsMockUtils.createTxMock('multiSig', 'removeMultisigSignersViaAdmin');

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void, ModifyMultiSigStorage>(
      mockContext,
      {
        signersToAdd: [],
        signersToRemove: [oldSigner2],
        requiredSignatures: new BigNumber(1),
      }
    );

    const result = await prepareModifyMultiSig.call(proc, args);

    expect(result).toEqual({
      resolver: undefined,
      transactions: [{ transaction: removeTransaction, args: [rawAccountId, [rawOldSigner2]] }],
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
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      let result = boundFunc();
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
        }
      );

      boundFunc = getAuthorization.bind(proc);

      result = boundFunc();

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RemoveMultisigSignersViaCreator],
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
      });

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({ signers: [newSigner1, newSigner2], multiSig });
      expect(result).toEqual({
        signersToRemove: [oldSigner1, oldSigner2],
        signersToAdd: [newSigner1, newSigner2],
        requiredSignatures: new BigNumber(3),
      });
    });
  });
});
