import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareRemoveSecondaryAccounts } from '~/api/procedures/removeSecondaryAccounts';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RemoveSecondaryAccountsParams, Signer, SignerType, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('removeSecondaryAccounts procedure', () => {
  let mockContext: Mocked<Context>;
  let signerToSignerValueSpy: jest.SpyInstance<SignerValue, [Signer]>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let getSecondaryAccountPermissionsSpy: jest.SpyInstance;

  let args: RemoveSecondaryAccountsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerToSignerValueSpy = jest.spyOn(utilsConversionModule, 'signerToSignerValue');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    getSecondaryAccountPermissionsSpy = jest.spyOn(
      utilsInternalModule,
      'getSecondaryAccountPermissions'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    const secondaryAccount = entityMockUtils.getAccountInstance({
      address: '',
    });
    secondaryAccount.isEqual.mockReturnValueOnce(false).mockReturnValue(true);

    const accounts = [secondaryAccount];

    args = {
      accounts,
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should return a remove secondary items transaction spec', async () => {
    const { accounts } = args;

    const rawAccountId = dsMockUtils.createMockAccountId(accounts[0].address);
    getSecondaryAccountPermissionsSpy.mockReturnValue(accounts.map(account => ({ account })));
    when(stringToAccountIdSpy)
      .calledWith(accounts[0].address, mockContext)
      .mockReturnValue(rawAccountId);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('identity', 'removeSecondaryKeys');

    const result = await prepareRemoveSecondaryAccounts.call(proc, args);

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(1),
      args: [[rawAccountId]],
      resolver: undefined,
    });
  });

  it('should throw an error if attempting to remove the primary Account', () => {
    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);
    const account = entityMockUtils.getAccountInstance({ address: 'primaryAccount' });
    when(stringToAccountIdSpy)
      .calledWith('primaryAccount', mockContext)
      .mockReturnValue(dsMockUtils.createMockAccountId('primaryAccount'));
    getSecondaryAccountPermissionsSpy.mockReturnValue([account]);
    mockContext.getSigningIdentity = jest
      .fn()
      .mockReturnValue(entityMockUtils.getIdentityInstance({ getPrimaryAccount: { account } }));

    return expect(
      prepareRemoveSecondaryAccounts.call(proc, {
        ...args,
        accounts: [account],
      })
    ).rejects.toThrow('You cannot remove the primary Account');
  });

  it('should throw an error if at least one of the secondary Accounts to remove is not present in the secondary Accounts list', () => {
    const { accounts } = args;
    const account = entityMockUtils.getAccountInstance({ address: 'primaryAccount' });
    const signerValue = { type: SignerType.Account, value: accounts[0].address };

    when(signerToSignerValueSpy).calledWith(accounts[0]).mockReturnValue(signerValue);
    getSecondaryAccountPermissionsSpy.mockReturnValue([]);
    mockContext.getSigningIdentity = jest
      .fn()
      .mockReturnValue(entityMockUtils.getIdentityInstance({ getPrimaryAccount: { account } }));

    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);
    return expect(
      prepareRemoveSecondaryAccounts.call(proc, {
        ...args,
      })
    ).rejects.toThrow('One of the Accounts is not a secondary Account for the Identity');
  });
});
