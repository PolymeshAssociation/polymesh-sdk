import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account } from '~/api/entities';
import {
  isAuthorized,
  prepareRemoveSigningKeys,
  RemoveSigningKeysParams,
} from '~/api/procedures/removeSigningKeys';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('removeSigningKeys procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  let args: { signers: Signer[] };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsModule, 'signerValueToSignatory');
    signerToSignerValueStub = sinon.stub(utilsModule, 'signerToSignerValue');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();

    args = {
      signers: [entityMockUtils.getAccountInstance({ address: 'someFakeAccount' })],
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add a remove signing items transaction to the queue', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    mockContext.getSigningKeys.resolves(signers.map(signer => ({ signer, permissions: [] })));

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);
    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSigningKeys');

    await prepareRemoveSigningKeys.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if attempting to remove the master key', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'masterKey' });

    signerToSignerValueStub
      .withArgs(signer)
      .returns({ type: SignerType.Account, value: signer.address });

    await expect(
      prepareRemoveSigningKeys.call(proc, {
        signers: [signer],
      })
    ).rejects.toThrow('You cannot remove the master key');
  });

  test('should throw an error if at least one of the signing key to remove is not present in the signing keys list', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

    await expect(prepareRemoveSigningKeys.call(proc, args)).rejects.toThrow(
      'You cannot remove a signing key that is not present in your signing keys list'
    );
  });

  describe('isAuthorized', () => {
    test('should return whether the current address is the master key', async () => {
      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'masterKey',
        },
      });

      const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc();
      expect(result).toBe(true);

      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'otherAccountId',
        },
      });

      result = await boundFunc();
      expect(result).toBe(false);
    });
  });
});
