import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  prepareRemoveSecondaryKeys,
  RemoveSecondaryKeysParams,
} from '~/api/procedures/removeSecondaryKeys';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('removeSecondaryKeys procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  let args: { signers: Signer[] };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
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

  test('should add a remove secondary items transaction to the queue', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryKeys: signers.map(signer => ({
          signer,
          permissions: { tokens: [], portfolios: [], transactions: [], transactionGroups: [] },
        })),
      },
    });

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);
    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSecondaryKeys');

    await prepareRemoveSecondaryKeys.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if attempting to remove the primary key', async () => {
    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'primaryKey' });

    signerToSignerValueStub
      .withArgs(signer)
      .returns({ type: SignerType.Account, value: signer.address });

    await expect(
      prepareRemoveSecondaryKeys.call(proc, {
        signers: [signer],
      })
    ).rejects.toThrow('You cannot remove the primary key');
  });

  test('should throw an error if at least one of the secondary keys to remove is not present in the secondary keys list', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);

    await expect(prepareRemoveSecondaryKeys.call(proc, args)).rejects.toThrow(
      'One of the Signers is not a Secondary Key for the Identity'
    );
  });
});
