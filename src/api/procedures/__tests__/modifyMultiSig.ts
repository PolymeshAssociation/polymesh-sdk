import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { ModifyMultiSigParams, prepareModifyMultiSig } from '~/api/procedures/modifyMultiSig';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { getAccountInstance, getIdentityInstance } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/MultiSig',
  require('~/testUtils/mocks/entities').mockMultiSigModule('~/api/entities/MultiSig')
);

describe('modifyMultiSig procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let rawAccountId: AccountId;
  let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
  let signerToSignatoryStub: SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    signerToSignatoryStub = sinon.stub(utilsConversionModule, 'signerToSignatory');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      multiSigOptions: {
        getCreator: getIdentityInstance({ did: 'abc' }),
      },
    });
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawAccountId);
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
          signaturesRequired: new BigNumber(1),
        },
      }),
      signers,
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The given signers are equal to the current signers',
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

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its creator',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the number of signatures required exceeds the number of signers', () => {
    const args = {
      multiSig: entityMockUtils.getMultiSigInstance({
        getCreator: getIdentityInstance(),
        details: {
          signers: [getAccountInstance(), getAccountInstance()],
          signaturesRequired: new BigNumber(2),
        },
      }),
      signers: [getAccountInstance()],
    };

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of signatures required should not exceed the number of signers',
    });

    return expect(prepareModifyMultiSig.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should add update and remove signer transactions to the queue', async () => {
    const oldSigner1 = getAccountInstance({ address: 'abc' });
    const oldSigner2 = getAccountInstance({ address: 'def' });
    const newSigner1 = getAccountInstance({ address: 'xyz' });
    const newSigner2 = getAccountInstance({ address: 'jki' });
    const multiSig = entityMockUtils.getMultiSigInstance({
      address: DUMMY_ACCOUNT_ID,
      getCreator: getIdentityInstance(),
      details: {
        signers: [oldSigner1, oldSigner2],
        signaturesRequired: new BigNumber(2),
      },
    });

    const args = {
      multiSig,
      signers: [newSigner1, newSigner2],
    };

    const addTransaction = dsMockUtils.createTxStub('multiSig', 'addMultisigSignersViaCreator');
    const removeTransaction = dsMockUtils.createTxStub(
      'multiSig',
      'removeMultisigSignersViaCreator'
    );

    signerToSignatoryStub.withArgs(oldSigner1, mockContext).returns('oldOne');
    signerToSignatoryStub.withArgs(oldSigner2, mockContext).returns('oldTwo');
    signerToSignatoryStub.withArgs(newSigner1, mockContext).returns('newOne');
    signerToSignatoryStub.withArgs(newSigner2, mockContext).returns('newTwo');

    const proc = procedureMockUtils.getInstance<ModifyMultiSigParams, void>(mockContext);

    await expect(prepareModifyMultiSig.call(proc, args)).resolves.not.toThrow();

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addTransaction,
      args: [rawAccountId, ['newOne', 'newTwo']],
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: removeTransaction,
      args: [rawAccountId, ['oldOne', 'oldTwo']],
    });
  });
});
