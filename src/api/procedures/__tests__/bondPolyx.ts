import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareBondPolyx,
  prepareStorage,
  Storage,
} from '~/api/procedures/bondPolyx';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('bondPolyx procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  const amount = new BigNumber(100);
  const payeeBalance = {
    free: new BigNumber(100),
    locked: new BigNumber(0),
    total: new BigNumber(100),
  };

  let mockContext: Mocked<Context>;
  let bondTx: PolymeshTx<[AccountId, Balance, AccountId]>;
  let account: Account;
  let rawAccountId: AccountId;
  let rawAmount: Balance;

  let bigNumberToBalanceSpy: jest.SpyInstance;
  let stringToAccountIdSpy: jest.SpyInstance;

  beforeEach(() => {
    bondTx = dsMockUtils.createTxMock('staking', 'bond');
    mockContext = dsMockUtils.getContextInstance();
    account = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawAccountId = dsMockUtils.createMockAccountId(account.address);
    rawAmount = dsMockUtils.createMockBalance(amount);

    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');

    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);
    when(stringToAccountIdSpy)
      .calledWith(account.address, mockContext)
      .mockReturnValue(rawAccountId);
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

  it('should throw an error if there is insufficient free balance', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      payeeBalance,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Payee account has insufficient POLYX',
    });

    await expect(
      prepareBondPolyx.call(proc, {
        payee: account,
        controller: account,
        amount: new BigNumber(900),
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a bond transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      payeeBalance,
    });

    const args = { payee: account, controller: account, amount };

    const result = await prepareBondPolyx.call(proc, args);

    expect(result).toEqual({
      transaction: bondTx,
      args: [rawAccountId, rawAmount, rawAccountId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        payeeBalance,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.staking.Bond],
          assets: [],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the payee balance', () => {
      account = entityMockUtils.getAccountInstance({ getBalance: { free: new BigNumber(27) } });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc({ amount, payee: account, controller: account })).resolves.toEqual(
        expect.objectContaining({
          payeeBalance: {
            free: new BigNumber(27),
          },
        })
      );
    });
  });
});
