import { Vec } from '@polkadot/types/codec';
import { Moment } from '@polkadot/types/interfaces';
import { PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth } from '@polkadot/types/lookup';
import { BigNumber } from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareAddSecondaryKeysWithAuth,
  prepareStorage,
  Storage,
} from '~/api/procedures/addSecondaryAccountsWithAuth';
import { Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Account, AddSecondaryAccountsParams, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('addSecondaryAccounts procedure', () => {
  let mockContext: Mocked<Context>;
  let identity: Identity;
  let actingAccount: Account;
  let params: AddSecondaryAccountsParams;
  let rawAdditionalKeys: Vec<PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth>;
  let rawExpiry: Moment;
  let dateToMomentSpy: jest.SpyInstance;
  let secondaryAccountWithAuthToSecondaryKeyWithAuthSpy: jest.SpyInstance;
  let expiry: Date;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    secondaryAccountWithAuthToSecondaryKeyWithAuthSpy = jest.spyOn(
      utilsConversionModule,
      'secondaryAccountWithAuthToSecondaryKeyWithAuth'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
  });

  beforeEach(() => {
    identity = entityMockUtils.getIdentityInstance();
    actingAccount = entityMockUtils.getAccountInstance();

    mockContext = dsMockUtils.getContextInstance({
      getIdentity: identity,
    });

    expiry = new Date('2050/01/01');

    params = {
      accounts: [
        {
          secondaryAccount: {
            account: entityMockUtils.getAccountInstance({
              address: 'secondaryAccount',
              getIdentity: null,
            }),
            permissions: {
              assets: null,
              portfolios: null,
              transactions: null,
              transactionGroups: [],
            },
          },
          authSignature: '0xSignature',
        },
      ],
      expiresAt: expiry,
    };

    rawAdditionalKeys =
      'someKeys' as unknown as Vec<PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth>;

    when(secondaryAccountWithAuthToSecondaryKeyWithAuthSpy)
      .calledWith(params.accounts, mockContext)
      .mockReturnValue(rawAdditionalKeys);

    rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));

    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the one or more accounts are already linked to an Identity', () => {
    const accounts = [
      {
        secondaryAccount: {
          account: entityMockUtils.getAccountInstance({
            address: 'secondaryAccount',
            getIdentity: entityMockUtils.getIdentityInstance({ did: 'someRandomDid' }),
          }),
          permissions: {
            assets: null,
            portfolios: null,
            transactions: null,
            transactionGroups: [],
          },
        },
        authSignature: '0xSignature',
      },
    ];

    const proc = procedureMockUtils.getInstance<AddSecondaryAccountsParams, Identity, Storage>(
      mockContext,
      {
        identity,
        actingAccount,
      }
    );

    return expect(
      prepareAddSecondaryKeysWithAuth.call(proc, {
        ...params,
        accounts,
      })
    ).rejects.toThrow('One or more accounts are already linked to some Identity');
  });

  it('should add a create addSecondaryKeysWithAuthorization transaction to the queue', async () => {
    const txMock = dsMockUtils.createTxMock('identity', 'addSecondaryKeysWithAuthorization');
    const proc = procedureMockUtils.getInstance<AddSecondaryAccountsParams, Identity, Storage>(
      mockContext,
      {
        identity,
        actingAccount,
      }
    );

    const result = await prepareAddSecondaryKeysWithAuth.call(proc, params);

    expect(result).toEqual({
      transaction: txMock,
      feeMultiplier: new BigNumber(1),
      args: [rawAdditionalKeys, rawExpiry],
      resolver: identity,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<AddSecondaryAccountsParams, Identity, Storage>(
        mockContext,
        {
          identity,
          actingAccount,
        }
      );
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc();
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.identity.AddSecondaryKeysWithAuthorization],
          assets: [],
          portfolios: [],
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (actingAccount.isEqual as any).mockReturnValue(false);

      proc = procedureMockUtils.getInstance<AddSecondaryAccountsParams, Identity, Storage>(
        dsMockUtils.getContextInstance(),
        { identity, actingAccount }
      );

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc();
      expect(result).toEqual({
        signerPermissions: 'Secondary accounts can only be added by primary key of an Identity',
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<AddSecondaryAccountsParams, Identity, Storage>(
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
