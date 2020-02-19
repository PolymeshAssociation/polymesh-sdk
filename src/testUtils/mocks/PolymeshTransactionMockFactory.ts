/* istanbul ignore file */
import sinon, { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';

import * as polymeshTransactionModule from '~/base';
import { TransactionStatus } from '~/types';
import { Mocked } from '~/types/utils';

interface MockTransactionSpec {
  isCritical: boolean;
  autoresolve: TransactionStatus.Failed | TransactionStatus.Succeeded | false;
}

interface TransactionMockData {
  updateStatusStub: MockTransaction['updateStatus'];
  statusChangeListener: (transaction: MockTransaction) => void;
  resolved: boolean;
}

type MockTransaction = Mocked<polymeshTransactionModule.PolymeshTransaction<unknown[]>>;

/**
 * Produces mocks of PolymeshTransaction for testing
 */
export class PolymeshTransactionMockFactory {
  private transactionMockManager = ImportMock.mockClass(
    polymeshTransactionModule,
    'PolymeshTransaction'
  );

  private transactionMocksData = new Map<MockTransaction, TransactionMockData>();

  private transactionConstructorMockManager?: SinonStub;

  /**
   * @hidden
   *
   * Initialize the factory by adding default all-purpose functionality to the mock manager
   */
  public initMocks(): void {
    this.transactionMockManager = ImportMock.mockClass(
      polymeshTransactionModule,
      'PolymeshTransaction'
    );
  }

  /**
   * Reset the factory to the default, empty mocks
   */
  public reset(): void {
    this.cleanup();
    this.initMocks();
  }

  /**
   * Restore imports to their original state. While [[reset]] simply clears all stubs,
   * this method makes it so that next import that targets polkadot will resolve to the real
   * library
   */
  public cleanup(): void {
    this.transactionMockManager.restore();
    // eslint-disable-next-line no-unused-expressions
    this.transactionConstructorMockManager?.restore();
  }

  /**
   * Determine the next set of transactions that will be created when the PolymeshTransaction
   * constructor is used
   *
   * @param specs - transactions that will be constructed
   */
  public setupNextTransactions(specs: MockTransactionSpec[]): MockTransaction[] {
    const receipt = 'someReceipt';
    const error = 'Transaction Error';
    const updateStatusStub = sinon.stub();

    const instances = specs.map(({ isCritical, autoresolve }) => {
      const instance = {} as MockTransaction;
      if (autoresolve === TransactionStatus.Failed) {
        instance.run = (sinon
          .stub()
          .rejects(new Error(error)) as unknown) as MockTransaction['run'];
      } else if (autoresolve === TransactionStatus.Succeeded) {
        instance.run = (sinon.stub().resolves(receipt) as unknown) as MockTransaction['run'];
      } else {
        const runStub = sinon.stub().returns(
          new Promise((resolve, reject) => {
            updateStatusStub.callsFake((newStatus: TransactionStatus) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const { statusChangeListener } = this.transactionMocksData.get(instance)!;

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
        const mockData = this.transactionMocksData.get(instance)!;

        this.transactionMocksData.set(instance, {
          ...mockData,
          statusChangeListener: listener,
        });
      }) as unknown) as MockTransaction['onStatusChange'];

      instance.status = autoresolve || TransactionStatus.Idle;

      this.transactionMocksData.set(instance, {
        updateStatusStub,
        resolved: !!autoresolve,
        statusChangeListener: sinon.stub(),
      });

      return instance;
    }) as MockTransaction[];

    if (this.transactionConstructorMockManager) {
      this.transactionConstructorMockManager.restore();
    }

    const transactionConstructorMockManager = ImportMock.mockFunction(
      polymeshTransactionModule,
      'PolymeshTransaction'
    );

    instances.forEach((instance, index) => {
      transactionConstructorMockManager.onCall(index).returns(instance);
    });

    this.transactionConstructorMockManager = transactionConstructorMockManager;

    return instances;
  }

  /**
   * Update the status of an existing mock transaction. Will throw an exception if the transaction has already been resolved
   *
   * @param transaction - transaction to update
   * @param status - new status
   */
  public updateTransactionStatus(transaction: MockTransaction, status: TransactionStatus): void {
    const transactionMockData = this.transactionMocksData.get(transaction);

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
      this.transactionMocksData.set(transaction, {
        ...transactionMockData,
        resolved: true,
      });
    }

    transaction.status = status;

    transactionMockData.updateStatusStub(status);
  }
}
