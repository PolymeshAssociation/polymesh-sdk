/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { PolymeshTransaction } from '~/base';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus } from '~/types';

interface MockTransactionSpec {
  isCritical: boolean;
  autoresolve: TransactionStatus.Failed | TransactionStatus.Succeeded | false;
  fees?: {
    protocol: BigNumber;
    gas: BigNumber;
  };
}

interface TransactionMockData {
  updateStatusStub: MockTransaction['updateStatus'];
  statusChangeListener: (transaction: MockTransaction) => void;
  resolved: boolean;
}

type MockTransaction = Mocked<PolymeshTransaction<unknown[]>>;

let polymeshTransactionConstructorStub: SinonStub;

const MockPolymeshTransactionClass = class {
  /**
   * @hidden
   */
  constructor() {
    return polymeshTransactionConstructorStub();
  }
};

export const mockPolymeshTransactionModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  PolymeshTransaction: MockPolymeshTransactionClass,
});

const transactionMocksData = new Map<MockTransaction, TransactionMockData>();

/**
 * @hidden
 *
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 */
export function initMocks(): void {
  transactionMocksData.clear();
  polymeshTransactionConstructorStub = sinon.stub();
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  initMocks();
}

/**
 * @hidden
 * Determine the next set of transactions that will be created when the PolymeshTransaction
 * constructor is used
 *
 * @param specs - transactions that will be constructed
 */
export function setupNextTransactions(specs: MockTransactionSpec[]): MockTransaction[] {
  const receipt = 'someReceipt';
  const error = 'Transaction Error';
  const updateStatusStub = sinon.stub();

  const instances = specs.map(({ isCritical, autoresolve, fees = null }) => {
    const instance = {} as MockTransaction;
    if (autoresolve === TransactionStatus.Failed) {
      instance.run = (sinon.stub().rejects(new Error(error)) as unknown) as MockTransaction['run'];
    } else if (autoresolve === TransactionStatus.Succeeded) {
      instance.run = (sinon.stub().resolves(receipt) as unknown) as MockTransaction['run'];
    } else {
      const runStub = sinon.stub().returns(
        new Promise((resolve, reject) => {
          updateStatusStub.callsFake((newStatus: TransactionStatus) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { statusChangeListener } = transactionMocksData.get(instance)!;

            statusChangeListener(instance);

            if (newStatus === TransactionStatus.Succeeded) {
              resolve(receipt);
            }
            if (
              [
                TransactionStatus.Aborted,
                TransactionStatus.Failed,
                TransactionStatus.Rejected,
              ].includes(newStatus)
            ) {
              reject(new Error(error));
            }
          });
        })
      );
      instance.run = (runStub as unknown) as MockTransaction['run'];
    }

    instance.isCritical = isCritical;
    instance.onStatusChange = (sinon.stub().callsFake(listener => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mockData = transactionMocksData.get(instance)!;

      transactionMocksData.set(instance, {
        ...mockData,
        statusChangeListener: listener,
      });
    }) as unknown) as MockTransaction['onStatusChange'];

    instance.status = autoresolve || TransactionStatus.Idle;
    instance.getFees = sinon.stub().resolves(fees) as MockTransaction['getFees'];

    transactionMocksData.set(instance, {
      updateStatusStub,
      resolved: !!autoresolve,
      statusChangeListener: sinon.stub(),
    });

    return instance;
  });

  polymeshTransactionConstructorStub = sinon.stub();

  instances.forEach((instance, index) => {
    polymeshTransactionConstructorStub.onCall(index).returns(instance);
  });

  return instances;
}

/**
 * @hidden
 * Update the status of an existing mock transaction. Will throw an exception if the transaction has already been resolved
 *
 * @param transaction - transaction to update
 * @param status - new status
 */
export function updateTransactionStatus(
  transaction: MockTransaction,
  status: TransactionStatus
): void {
  const transactionMockData = transactionMocksData.get(transaction);

  if (!transactionMockData) {
    throw new Error('Invalid transaction object');
  }

  if (transactionMockData.resolved) {
    throw new Error('Cannot update status on an already resolved transaction');
  }

  if (status === transaction.status) {
    throw new Error(`Status is already ${status}`);
  }

  if (
    [TransactionStatus.Aborted, TransactionStatus.Failed, TransactionStatus.Succeeded].includes(
      status
    )
  ) {
    transactionMocksData.set(transaction, {
      ...transactionMockData,
      resolved: true,
    });
  }

  transaction.status = status;

  transactionMockData.updateStatusStub(status);
}
