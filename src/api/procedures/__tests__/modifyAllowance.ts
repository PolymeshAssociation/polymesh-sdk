import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { getAuthorization, prepareModifyAllowance } from '~/api/procedures/modifyAllowance';
import { Context, ModifyAllowanceParams, Subsidy } from '~/internal';
import { TxTags } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AllowanceOperation } from '~/types';
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
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let bigNumberToBalanceStub: sinon.SinonStub<
    [BigNumber, Context, (boolean | undefined)?],
    Balance
  >;
  let args: ModifyAllowanceParams;
  let allowance: BigNumber;
  let rawBeneficiaryAccountId: AccountId;
  let rawAllowance: Balance;

  let increasePolyxLimitTransaction: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    subsidy = entityMockUtils.getSubsidyInstance();
    allowance = new BigNumber(50);
    args = { subsidy, operation: AllowanceOperation.Set, allowance };

    rawBeneficiaryAccountId = dsMockUtils.createMockAccountId('beneficiary');
    stringToAccountIdStub.withArgs('beneficiary', mockContext).returns(rawBeneficiaryAccountId);

    rawAllowance = dsMockUtils.createMockBalance(allowance);
    bigNumberToBalanceStub.withArgs(allowance, mockContext).returns(rawAllowance);

    increasePolyxLimitTransaction = dsMockUtils.createTxStub('relayer', 'increasePolyxLimit');
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

  test('should throw an error if the Subsidy does not exist', async () => {
    const proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);

    let error;

    try {
      await prepareModifyAllowance.call(proc, {
        ...args,
        subsidy: entityMockUtils.getSubsidyInstance({ exists: false }),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Subsidy no longer exists');
  });

  test('should throw an error if the allowance to be set is same as the current allowance', async () => {
    const proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);

    let error;

    try {
      await prepareModifyAllowance.call(proc, {
        ...args,
        allowance: new BigNumber(100),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Amount of allowance to set is equal to the current allowance');
  });

  test('should throw an error if the amount of allowance to decrease is more than the current allowance', async () => {
    const proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);

    let error;

    try {
      await prepareModifyAllowance.call(proc, {
        ...args,
        operation: AllowanceOperation.Decrease,
        allowance: new BigNumber(1000),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'Amount of allowance to decrease cannot be more than the current allowance'
    );
  });

  test('should add a transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);

    const addTransactionStub = procedureMockUtils.getAddTransactionStub();

    const updatePolyxLimitTransaction = dsMockUtils.createTxStub('relayer', 'updatePolyxLimit');

    await prepareModifyAllowance.call(proc, args);
    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: updatePolyxLimitTransaction,
        args: [rawBeneficiaryAccountId, rawAllowance],
      })
    );

    await prepareModifyAllowance.call(proc, { ...args, operation: AllowanceOperation.Increase });
    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: increasePolyxLimitTransaction,
        args: [rawBeneficiaryAccountId, rawAllowance],
      })
    );

    const decreasePolyxLimitTransaction = dsMockUtils.createTxStub('relayer', 'decreasePolyxLimit');

    await prepareModifyAllowance.call(proc, { ...args, operation: AllowanceOperation.Decrease });
    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: decreasePolyxLimitTransaction,
        args: [rawBeneficiaryAccountId, rawAllowance],
      })
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ModifyAllowanceParams, void>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      let result = boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.UpdatePolyxLimit],
        },
      });

      result = boundFunc({ ...args, operation: AllowanceOperation.Increase });
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.IncreasePolyxLimit],
        },
      });

      result = boundFunc({ ...args, operation: AllowanceOperation.Decrease });
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.DecreasePolyxLimit],
        },
      });

      subsidy.subsidizer.isEqual = sinon.stub().returns(false);

      result = boundFunc(args);
      expect(result).toEqual({
        roles: 'Only the subsidizer is allowed to modify the allowance of a Subsidy',
        permissions: {
          transactions: [TxTags.relayer.UpdatePolyxLimit],
        },
      });
    });
  });
});
