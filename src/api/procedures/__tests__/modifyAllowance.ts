import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, prepareModifyAllowance } from '~/api/procedures/modifyAllowance';
import { Context, ModifyAllowanceParams, Procedure, Subsidy } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AllowanceOperation, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

jest.mock(
  '~/api/entities/Subsidy',
  require('~/testUtils/mocks/entities').mockSubsidyModule('~/api/entities/Subsidy')
);

describe('modifyAllowance procedure', () => {
  let mockContext: Mocked<Context>;
  let subsidy: Subsidy;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<
    Balance,
    [BigNumber, Context, (boolean | undefined)?]
  >;
  let args: ModifyAllowanceParams;
  let allowance: BigNumber;
  let rawBeneficiaryAccountId: AccountId;
  let rawAllowance: Balance;

  let increasePolyxLimitTransaction: jest.Mock;

  let proc: Procedure<ModifyAllowanceParams, void>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks({
      subsidyOptions: {
        getAllowance: new BigNumber(100),
      },
    });

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    subsidy = entityMockUtils.getSubsidyInstance();
    allowance = new BigNumber(50);
    args = { subsidy, operation: AllowanceOperation.Set, allowance };

    rawBeneficiaryAccountId = dsMockUtils.createMockAccountId('beneficiary');
    when(stringToAccountIdSpy)
      .calledWith('beneficiary', mockContext)
      .mockReturnValue(rawBeneficiaryAccountId);

    rawAllowance = dsMockUtils.createMockBalance(allowance);
    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    increasePolyxLimitTransaction = dsMockUtils.createTxMock('relayer', 'increasePolyxLimit');

    proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);
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

  it('should throw an error if the Subsidy does not exist', () =>
    expect(() =>
      prepareModifyAllowance.call(proc, {
        ...args,
        subsidy: entityMockUtils.getSubsidyInstance({ exists: false }),
      })
    ).rejects.toThrowError('The Subsidy no longer exists'));

  it('should throw an error if the allowance to be set is same as the current allowance', () =>
    expect(
      prepareModifyAllowance.call(proc, {
        ...args,
        allowance: new BigNumber(100),
      })
    ).rejects.toThrowError('Amount of allowance to set is equal to the current allowance'));

  it('should throw an error if the amount of allowance to decrease is more than the current allowance', () =>
    expect(
      prepareModifyAllowance.call(proc, {
        ...args,
        operation: AllowanceOperation.Decrease,
        allowance: new BigNumber(1000),
      })
    ).rejects.toThrowError(
      'Amount of allowance to decrease cannot be more than the current allowance'
    ));

  it('should return a transaction spec', async () => {
    const updatePolyxLimitTransaction = dsMockUtils.createTxMock('relayer', 'updatePolyxLimit');

    let result = await prepareModifyAllowance.call(proc, args);

    expect(result).toEqual({
      transaction: updatePolyxLimitTransaction,
      args: [rawBeneficiaryAccountId, rawAllowance],
      resolver: undefined,
    });

    result = await prepareModifyAllowance.call(proc, {
      ...args,
      operation: AllowanceOperation.Increase,
    });

    expect(result).toEqual({
      transaction: increasePolyxLimitTransaction,
      args: [rawBeneficiaryAccountId, rawAllowance],
      resolver: undefined,
    });

    const decreasePolyxLimitTransaction = dsMockUtils.createTxMock('relayer', 'decreasePolyxLimit');

    result = await prepareModifyAllowance.call(proc, {
      ...args,
      operation: AllowanceOperation.Decrease,
    });

    expect(result).toEqual({
      transaction: decreasePolyxLimitTransaction,
      args: [rawBeneficiaryAccountId, rawAllowance],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.UpdatePolyxLimit],
        },
      });

      result = await boundFunc({ ...args, operation: AllowanceOperation.Increase });
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.IncreasePolyxLimit],
        },
      });

      result = await boundFunc({ ...args, operation: AllowanceOperation.Decrease });
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.DecreasePolyxLimit],
        },
      });

      subsidy.subsidizer.isEqual = jest.fn().mockReturnValue(false);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: 'Only the subsidizer is allowed to modify the allowance of a Subsidy',
        permissions: {
          transactions: [TxTags.relayer.UpdatePolyxLimit],
        },
      });
    });
  });
});
