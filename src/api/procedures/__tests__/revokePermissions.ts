import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  prepareRevokePermissions,
  RevokePermissionsParams,
} from '~/api/procedures/revokePermissions';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('revokePermissions procedure', () => {
  let mockContext: Mocked<Context>;
  let addBatchTransactionStub: sinon.SinonStub;
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
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
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

  test('should add a batch of revoke permissions transactions to the queue', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    const signersList = [[rawSignatory, { asset: [], extrinsic: [], portfolio: [] }]];

    mockContext.getSecondaryKeys.resolves(signers.map(signer => ({ signer, permissions: [] })));

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);
    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<RevokePermissionsParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'setPermissionToSigner');

    await prepareRevokePermissions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, transaction, {}, signersList);
  });

  test('should throw an error if at least one of the Signers for which to revoke permissions is not a Secondary Key for the Identity', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<RevokePermissionsParams, void>(mockContext);

    await expect(prepareRevokePermissions.call(proc, args)).rejects.toThrow(
      'One of the Signers is not a Secondary Key for the Identity'
    );
  });
});
