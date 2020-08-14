import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  isAuthorized,
  prepareRemoveSigningItems,
  RemoveSigningItemsParams,
} from '~/api/procedures/removeSigningItems';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer, SignerType } from '~/types';
import * as utilsModule from '~/utils';

describe('removeSigningItems procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerToSignatoryStub: sinon.SinonStub<[Signer, Context], Signatory>;

  const args = {
    signers: [
      {
        type: SignerType.AccountKey,
        value: 'someFakeAccountKey',
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

    const proc = procedureMockUtils.getInstance<RemoveSigningItemsParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSigningItems');

    await prepareRemoveSigningItems.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if the current account is not the master key', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSigningItemsParams, void>(mockContext);

    await expect(
      prepareRemoveSigningItems.call(proc, {
        signers: [
          {
            type: SignerType.AccountKey,
            value: 'someAccountKey',
          },
        ],
      })
    ).rejects.toThrow('You cannot remove the master key');
  });

  test('should throw an error if at least one of the signing key to remove is not present in the signing keys list', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSigningItemsParams, void>(mockContext);

    await expect(prepareRemoveSigningItems.call(proc, args)).rejects.toThrow(
      'You cannot remove a signing key that is not present in your signing keys list'
    );
  });

  describe('isAuthorized', () => {
    test('should return whether the current address is the master key', async () => {
      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'someAccountKey',
        },
      });

      const proc = procedureMockUtils.getInstance<RemoveSigningItemsParams, void>(mockContext);

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc();
      expect(result).toBe(true);

      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'otherAccountKey',
        },
      });

      result = await boundFunc();
      expect(result).toBe(false);
    });
  });
});
