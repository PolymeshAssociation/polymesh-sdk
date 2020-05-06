import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { prepareTransferPolyX, TransferPolyXParams } from '~/api/procedures/transferPolyX';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    sinon.stub(utilsModule, 'stringToAccountKey').returns(polkadotMockUtils.createMockAccountKey());
  });

  beforeEach(() => {
    mockContext = polkadotMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the user has insufficient balance to transfer', () => {
    polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, {
        to: 'someAccount',
        amount: new BigNumber(101),
      })
    ).rejects.toThrow('Insufficient balance');
  });

  test("should throw an error if destination account doesn't have an associated identity", () => {
    polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow("The destination account doesn't have an asssociated identity");
  });

  test("should throw an error if sender account doesn't have a valid cdd", () => {
    polkadotMockUtils.createQueryStub(
      'identity',
      'keyToIdentityIds',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
    );

    polkadotMockUtils.configureMocks({
      contextOptions: {
        validCdd: false,
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The sender Identity has an invalid CDD claim');
  });

  test("should throw an error if destination account doesn't have a valid cdd", () => {
    polkadotMockUtils.createQueryStub(
      'identity',
      'keyToIdentityIds',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
    );

    entityMockUtils.configureMocks({
      identityOptions: {
        hasValidCdd: false,
      },
    });

    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    return expect(
      prepareTransferPolyX.call(proc, { to: 'someAccount', amount: new BigNumber(99) })
    ).rejects.toThrow('The receiver Identity has an invalid CDD claim');
  });

  test('should add a balance transfer transaction to the queue', async () => {
    const to = 'someAccount';
    const amount = new BigNumber(99);
    const rawAmount = polkadotMockUtils.createMockBalance(amount.toNumber());

    polkadotMockUtils.createQueryStub(
      'identity',
      'keyToIdentityIds',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
    );

    sinon.stub(utilsModule, 'numberToBalance').returns(rawAmount);

    const tx = polkadotMockUtils.createTxStub('balances', 'transfer');
    const proc = procedureMockUtils.getInstance<TransferPolyXParams, void>();
    proc.context = mockContext;

    await prepareTransferPolyX.call(proc, {
      to,
      amount,
    });

    sinon.assert.calledWith(procedureMockUtils.getAddTransactionStub(), tx, {}, to, rawAmount);
  });
});
