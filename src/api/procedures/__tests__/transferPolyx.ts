import BigNumber from 'bignumber.js';
import { Memo } from 'polymesh-types/polymesh';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareTransferPolyx,
  TransferPolyxParams,
} from '~/api/procedures/transferPolyx';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('transferPolyx procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
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

  test('should throw an error if the user has insufficient balance to transfer', () => {
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    return expect(
      prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount: new BigNumber(101),
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  test("should throw an error if destination Account doesn't have an associated Identity", () => {
    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    return expect(
      prepareTransferPolyx.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow("The destination Account doesn't have an asssociated Identity");
  });

  test("should throw an error if sender Identity doesn't have valid CDD", () => {
    dsMockUtils
      .createQueryStub('identity', 'keyToIdentityIds')
      .returns(dsMockUtils.createMockIdentityId('currentIdentityId'));

    mockContext = dsMockUtils.getContextInstance({
      validCdd: false,
    });

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    return expect(
      prepareTransferPolyx.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The sender Identity has an invalid CDD claim');
  });

  test("should throw an error if destination Account doesn't have valid CDD", () => {
    dsMockUtils
      .createQueryStub('identity', 'keyToIdentityIds')
      .returns(dsMockUtils.createMockIdentityId('currentIdentityId'));

    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: entityMockUtils.getIdentityInstance({
          hasValidCdd: false,
        }),
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    return expect(
      prepareTransferPolyx.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The receiver Identity has an invalid CDD claim');
  });

  test('should add a balance transfer transaction to the queue', async () => {
    const to = entityMockUtils.getAccountInstance({ address: 'someAccount' });
    const amount = new BigNumber(99);
    const memo = 'someMessage';
    const rawAccount = dsMockUtils.createMockAccountId(to.address);
    const rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    const rawMemo = 'memo' as unknown as Memo;

    dsMockUtils
      .createQueryStub('identity', 'keyToIdentityIds')
      .returns(dsMockUtils.createMockIdentityId('currentIdentityId'));

    sinon.stub(utilsConversionModule, 'stringToAccountId').returns(rawAccount);
    sinon.stub(utilsConversionModule, 'numberToBalance').returns(rawAmount);
    sinon.stub(utilsConversionModule, 'stringToMemo').returns(rawMemo);

    let tx = dsMockUtils.createTxStub('balances', 'transfer');
    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    await prepareTransferPolyx.call(proc, {
      to,
      amount,
    });

    sinon.assert.calledWith(
      procedureMockUtils.getAddTransactionStub(),
      tx,
      {},
      rawAccount,
      rawAmount
    );

    tx = dsMockUtils.createTxStub('balances', 'transferWithMemo');

    await prepareTransferPolyx.call(proc, {
      to,
      amount,
      memo,
    });

    sinon.assert.calledWith(
      procedureMockUtils.getAddTransactionStub(),
      tx,
      {},
      rawAccount,
      rawAmount,
      rawMemo
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const memo = 'something';
      const args = {
        memo,
      } as TransferPolyxParams;

      expect(getAuthorization(args)).toEqual({
        permissions: {
          transactions: [TxTags.balances.TransferWithMemo],
          tokens: [],
          portfolios: [],
        },
      });

      args.memo = undefined;

      expect(getAuthorization(args)).toEqual({
        permissions: {
          transactions: [TxTags.balances.Transfer],
          tokens: [],
          portfolios: [],
        },
      });
    });
  });
});
