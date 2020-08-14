import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  isAuthorized,
  prepareRemoveSigningKeys,
  RemoveSigningKeysParams,
} from '~/api/procedures/removeSigningKeys';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer, SignerType } from '~/types';
import * as utilsModule from '~/utils';

describe('removeSigningKeys procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerToSignatoryStub: sinon.SinonStub<[Signer, Context], Signatory>;

  const args = {
    signers: [
      {
        type: SignerType.Account,
        value: 'someFakeAccount',
      },
    ],
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerToSignatoryStub = sinon.stub(utilsModule, 'signerToSignatory');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
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

    const rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(signers[0].value),
    });

    mockContext.getSigningKeys.resolves(signers);

    signerToSignatoryStub.returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSigningKeys');

    await prepareRemoveSigningKeys.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if the current account is not the master key', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

    await expect(
      prepareRemoveSigningKeys.call(proc, {
        signers: [
          {
            type: SignerType.Account,
            value: 'someAccount',
          },
        ],
      })
    ).rejects.toThrow('You cannot remove the master key');
  });

  test('should throw an error if at least one of the signing key to remove is not present in the signing keys list', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSigningKeysParams, void>(mockContext);

    await expect(prepareRemoveSigningKeys.call(proc, args)).rejects.toThrow(
      'You cannot remove a signing key that is not present in your signing keys list'
    );
  });

  describe('isAuthorized', () => {
    test('should return whether the current address is the master key', async () => {
      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'someAccountId',
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
