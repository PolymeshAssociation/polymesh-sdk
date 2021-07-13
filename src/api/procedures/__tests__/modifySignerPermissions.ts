import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  ModifySignerPermissionsParams,
  prepareModifySignerPermissions,
} from '~/api/procedures/modifySignerPermissions';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { SecondaryKey, Signer } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifySignerPermissions procedure', () => {
  let mockContext: Mocked<Context>;
  let addBatchTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;
  let permissionsToMeshPermissionsStub: sinon.SinonStub;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
    permissionsToMeshPermissionsStub = sinon.stub(
      utilsConversionModule,
      'permissionsToMeshPermissions'
    );
    permissionsLikeToPermissionsStub = sinon.stub(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
  });

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
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

  test('should add a batch of Set Permission To Signer transactions to the queue', async () => {
    const account = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    let secondaryKeys: SecondaryKey[] = [
      {
        signer: account,
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    let fakeMeshPermissions = dsMockUtils.createMockPermissions({
      asset: dsMockUtils.createMockAssetPermissions(),
      extrinsic: dsMockUtils.createMockExtrinsicPermissions(),
      portfolio: dsMockUtils.createMockPortfolioPermissions(),
    });

    const signerValue = {
      type: SignerType.Account,
      value: (secondaryKeys[0].signer as Account).address,
    };
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryKeys,
      },
    });

    signerToSignerValueStub.returns(signerValue);

    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'setPermissionToSigner');

    permissionsToMeshPermissionsStub.returns(fakeMeshPermissions);

    let signersList = [[rawSignatory, fakeMeshPermissions]];

    await prepareModifySignerPermissions.call(proc, { secondaryKeys });

    sinon.assert.calledWith(addBatchTransactionStub, transaction, {}, signersList);

    secondaryKeys = [
      {
        signer: account,
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    fakeMeshPermissions = dsMockUtils.createMockPermissions({
      asset: dsMockUtils.createMockAssetPermissions('Whole'),
      extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
      portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
    });

    permissionsToMeshPermissionsStub.returns(fakeMeshPermissions);

    signersList = [[rawSignatory, fakeMeshPermissions]];

    permissionsLikeToPermissionsStub.resolves(secondaryKeys[0].permissions);

    await prepareModifySignerPermissions.call(proc, { secondaryKeys });

    sinon.assert.calledWith(addBatchTransactionStub, transaction, {}, signersList);
  });

  test('should throw an error if at least one of the Signers for which to modify permissions is not a Secondary Key for the Identity', async () => {
    const secondaryKeys = [
      {
        signer: entityMockUtils.getAccountInstance({ address: 'someFakeAccount' }),
        permissions: {
          tokens: null,
          transactions: null,
          portfolios: null,
        },
      },
    ];

    const signerValue = {
      type: SignerType.Account,
      value: (secondaryKeys[0].signer as Account).address,
    };

    signerToSignerValueStub.withArgs(secondaryKeys[0].signer).returns(signerValue);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void>(mockContext);

    await expect(prepareModifySignerPermissions.call(proc, { secondaryKeys })).rejects.toThrow(
      'One of the Signers is not a Secondary Key for the Identity'
    );
  });
});
