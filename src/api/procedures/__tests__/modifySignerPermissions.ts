import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareModifySignerPermissions,
  prepareStorage,
  Storage,
} from '~/api/procedures/modifySignerPermissions';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ModifySignerPermissionsParams,
  PermissionedAccount,
  PermissionType,
  Signer,
  SignerType,
  SignerValue,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifySignerPermissions procedure', () => {
  let mockContext: Mocked<Context>;
  let addBatchTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;
  let permissionsToMeshPermissionsStub: sinon.SinonStub;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;
  let identity: Identity;
  let account: Account;

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
    account = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    identity = entityMockUtils.getIdentityInstance({
      getSecondaryAccounts: [
        {
          account,
          permissions: {
            assets: {
              type: PermissionType.Include,
              values: [],
            },
            portfolios: {
              type: PermissionType.Include,
              values: [],
            },
            transactions: {
              type: PermissionType.Include,
              values: [],
            },
            transactionGroups: [],
          },
        },
      ],
    });
    mockContext = dsMockUtils.getContextInstance({
      getIdentity: identity,
    });
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

  it('should add a batch of Set Permission To Signer transactions to the queue', async () => {
    let secondaryAccounts: PermissionedAccount[] = [
      {
        account,
        permissions: {
          assets: null,
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
      value: secondaryAccounts[0].account.address,
    };
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryAccounts,
      },
    });

    signerToSignerValueStub.returns(signerValue);

    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
      mockContext,
      {
        identity,
      }
    );

    const transaction = dsMockUtils.createTxStub('identity', 'setPermissionToSigner');

    permissionsToMeshPermissionsStub.returns(fakeMeshPermissions);

    let signersList = [[rawSignatory, fakeMeshPermissions]];

    await prepareModifySignerPermissions.call(proc, { secondaryAccounts });

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: signersList.map(signers => ({ transaction, args: signers })),
    });

    secondaryAccounts = [
      {
        account,
        permissions: {
          assets: null,
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

    permissionsLikeToPermissionsStub.resolves(secondaryAccounts[0].permissions);

    await prepareModifySignerPermissions.call(proc, { secondaryAccounts, identity });

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: signersList.map(signers => ({ transaction, args: signers })),
    });
  });

  it('should throw an error if at least one of the Accounts for which to modify permissions is not a secondary Account for the Identity', () => {
    const mockAccount = entityMockUtils.getAccountInstance({ address: 'mockAccount' });
    const secondaryAccounts = [
      {
        account: mockAccount,
        permissions: {
          assets: null,
          transactions: null,
          portfolios: null,
        },
      },
    ];

    mockAccount.isEqual.withArgs(account).returns(false);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
      mockContext,
      { identity }
    );

    return expect(
      prepareModifySignerPermissions.call(proc, {
        secondaryAccounts,
      })
    ).rejects.toThrow('One of the Accounts is not a secondary Account for the Identity');
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
        mockContext,
        { identity }
      );
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc();
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.identity.SetPermissionToSigner],
          assets: [],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
        dsMockUtils.getContextInstance({
          signingAccountIsEqual: false,
        }),
        { identity }
      );

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc();
      expect(result).toEqual({
        signerPermissions:
          "Secondary Account permissions can only be modified by the Identity's primary Account",
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc();

      expect(result).toEqual({
        identity: expect.objectContaining({
          did: 'someDid',
        }),
      });
    });
  });
});
