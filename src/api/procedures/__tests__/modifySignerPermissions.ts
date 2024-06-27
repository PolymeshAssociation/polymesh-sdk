import { when } from 'jest-when';

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
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('modifySignerPermissions procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance;
  let permissionsToMeshPermissionsSpy: jest.SpyInstance;
  let permissionsLikeToPermissionsSpy: jest.SpyInstance;
  let getSecondaryAccountPermissionsSpy: jest.SpyInstance;
  let identity: Identity;
  let account: Account;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    permissionsToMeshPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsToMeshPermissions'
    );
    permissionsLikeToPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
    getSecondaryAccountPermissionsSpy = jest.spyOn(
      utilsInternalModule,
      'getSecondaryAccountPermissions'
    );
  });

  beforeEach(() => {
    account = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    getSecondaryAccountPermissionsSpy.mockReturnValue([
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
    ]);
    identity = entityMockUtils.getIdentityInstance();
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

  it('should return a batch of Set Permission To Signer transactions spec', async () => {
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

    const rawSignatory = dsMockUtils.createMockAccountId(account.address);

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryAccounts: { data: secondaryAccounts, next: null },
      },
    });

    when(stringToAccountIdSpy)
      .calledWith(account.address, mockContext)
      .mockReturnValue(rawSignatory);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
      mockContext,
      {
        identity,
        actingAccount: account,
      }
    );

    const transaction = dsMockUtils.createTxMock('identity', 'setSecondaryKeyPermissions');

    permissionsToMeshPermissionsSpy.mockReturnValue(fakeMeshPermissions);

    let signersList = [[rawSignatory, fakeMeshPermissions]];

    let result = await prepareModifySignerPermissions.call(proc, { secondaryAccounts });

    expect(result).toEqual({
      transactions: signersList.map(signers => ({ transaction, args: signers })),
      resolver: undefined,
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

    permissionsToMeshPermissionsSpy.mockReturnValue(fakeMeshPermissions);

    signersList = [[rawSignatory, fakeMeshPermissions]];

    permissionsLikeToPermissionsSpy.mockResolvedValue(secondaryAccounts[0].permissions);

    result = await prepareModifySignerPermissions.call(proc, { secondaryAccounts, identity });

    expect(result).toEqual({
      transactions: signersList.map(signers => ({ transaction, args: signers })),
      resolver: undefined,
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

    when(mockAccount.isEqual).calledWith(account).mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
      mockContext,
      { identity, actingAccount: account }
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
        { identity, actingAccount: account }
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (account.isEqual as any).mockReturnValue(false);

      proc = procedureMockUtils.getInstance<ModifySignerPermissionsParams, void, Storage>(
        dsMockUtils.getContextInstance(),
        { identity, actingAccount: account }
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
        actingAccount: expect.objectContaining({
          address: '0xdummy',
        }),
      });
    });
  });
});
