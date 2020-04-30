import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { prepareTransferPolyX, TransferPolyXParams } from '~/api/procedures/transferPolyX';
import { Context } from '~/context';
import { polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsModule from '~/utils';

describe('transferPolyX procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    sinon.stub(utilsModule, 'stringToAccountKey').returns(polkadotMockUtils.createMockAccountKey());
  });

  beforeEach(() => {
    mockContext = polkadotMockUtils.getContextInstance();
  });

  afterEach(() => {
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the user has insufficient balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, {
        to: 'someAccount',
        amount: new BigNumber(101),
      })
    ).rejects.toThrow('Insufficient balance to perform this action');
  });

  test('should throw an error if destination account has not an associated identity', () => {
    polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The destination account has not an associated identity');
  });

  test('should add a balance transfer transaction to the queue', async () => {
    const to = 'someAccount';
    const amount = new BigNumber(99);
    const rawBalance = polkadotMockUtils.createMockBalance(amount.toNumber());

    polkadotMockUtils.createQueryStub(
      'identity',
      'keyToIdentityIds',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
    );

    sinon.stub(utilsModule, 'numberToBalance').returns(rawBalance);

    const tx = polkadotMockUtils.createTxStub('balances', 'transfer');
    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    await prepareTransferPolyX.call(proc, {
      to,
      amount,
    });

    sinon.assert.calledWith(procedureMockUtils.getAddTransactionStub(), tx, {}, to, rawBalance);
  });
});
