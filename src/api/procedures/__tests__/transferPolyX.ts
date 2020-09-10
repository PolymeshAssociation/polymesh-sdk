import BigNumber from 'bignumber.js';
import { Memo } from 'polymesh-types/polymesh';
import sinon from 'sinon';

import { prepareTransferPolyX, TransferPolyXParams } from '~/api/procedures/transferPolyX';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('transferPolyX procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    sinon.stub(utilsModule, 'stringToAccountId').returns(dsMockUtils.createMockAccountId());
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the user has insufficient balance to transfer', () => {
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>(mockContext);

    return expect(
      prepareTransferPolyX.call(proc, {
        to: 'someAccount',
        amount: new BigNumber(101),
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  test("should throw an error if destination account doesn't have an associated identity", () => {
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>(mockContext);

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow("The destination account doesn't have an asssociated identity");
  });

  test("should throw an error if sender identity doesn't have a valid cdd", () => {
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds').returns(
      dsMockUtils.createMockOption(
        dsMockUtils.createMockLinkedKeyInfo({
          Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
        })
      )
    );

    dsMockUtils.configureMocks({
      contextOptions: {
        validCdd: false,
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>(mockContext);

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The sender Identity has an invalid CDD claim');
  });

  test("should throw an error if destination account doesn't have a valid cdd", () => {
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds').returns(
      dsMockUtils.createMockOption(
        dsMockUtils.createMockLinkedKeyInfo({
          Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
        })
      )
    );

    entityMockUtils.configureMocks({
      identityOptions: {
        hasValidCdd: false,
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>(mockContext);

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The receiver Identity has an invalid CDD claim');
  });

  test('should add a balance transfer transaction to the queue', async () => {
    const to = 'someAccount';
    const amount = new BigNumber(99);
    const memo = 'someMessage';
    const rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    const rawMemo = ('memo' as unknown) as Memo;

    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds').returns(
      dsMockUtils.createMockOption(
        dsMockUtils.createMockLinkedKeyInfo({
          Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
        })
      )
    );

    sinon.stub(utilsModule, 'numberToBalance').returns(rawAmount);
    sinon.stub(utilsModule, 'stringToMemo').returns(rawMemo);

    let tx = dsMockUtils.createTxStub('balances', 'transfer');
    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>(mockContext);

    await prepareTransferPolyX.call(proc, {
      to,
      amount,
    });

    sinon.assert.calledWith(procedureMockUtils.getAddTransactionStub(), tx, {}, to, rawAmount);

    tx = dsMockUtils.createTxStub('balances', 'transferWithMemo');

    await prepareTransferPolyX.call(proc, {
      to,
      amount,
      memo,
    });

    sinon.assert.calledWith(
      procedureMockUtils.getAddTransactionStub(),
      tx,
      {},
      to,
      rawAmount,
      rawMemo
    );
  });
});
