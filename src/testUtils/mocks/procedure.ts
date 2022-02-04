/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */

import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import { Context, Procedure, TransactionQueue } from '~/internal';
import { Mocked } from '~/testUtils/types';

type MockProcedure = Mocked<Procedure>;
type MockTransactionQueue = Mocked<TransactionQueue>;

const mockInstanceContainer = {
  procedure: {} as MockProcedure,
  transactionQueue: {} as MockTransactionQueue,
};

let procedureConstructorStub: SinonStub;
let transactionQueueConstructorStub: SinonStub;

let addTransactionStub: SinonStub;
let addBatchTransactionStub: SinonStub;
let addProcedureStub: SinonStub;
let prepareStub: SinonStub;

export const MockProcedureClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return procedureConstructorStub(...args);
  }
};

export const MockTransactionQueueClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return transactionQueueConstructorStub(...args);
  }
};

export const mockProcedureModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Procedure: MockProcedureClass,
});

export const mockTransactionQueueModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  TransactionQueue: MockTransactionQueueClass,
});

/**
 * @hidden
 * Initialize the transaction queue instance
 */
function initTransactionQueue(): void {
  transactionQueueConstructorStub = sinon.stub();
  const transactionQueue = {} as unknown as MockTransactionQueue;

  Object.assign(mockInstanceContainer.transactionQueue, transactionQueue);
  transactionQueueConstructorStub.callsFake(args => {
    const value = merge({}, transactionQueue, args);
    Object.setPrototypeOf(value, require('~/internal').TransactionQueue.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the procedure instance
 */
function initProcedure(): void {
  procedureConstructorStub = sinon.stub();
  addTransactionStub = sinon.stub();
  addProcedureStub = sinon.stub();
  addBatchTransactionStub = sinon.stub();
  prepareStub = sinon.stub();
  const procedure = {
    addTransaction: addTransactionStub.returns([]),
    addBatchTransaction: addBatchTransactionStub.returns([]),
    addProcedure: addProcedureStub.returns([]),
    prepare: prepareStub.returns({}),
  } as unknown as MockProcedure;

  Object.assign(mockInstanceContainer.procedure, procedure);
  procedureConstructorStub.callsFake(args => {
    const value = merge({}, procedure, args);
    Object.setPrototypeOf(value, require('~/internal').Procedure.prototype);
    return value;
  });
}

/**
 * @hidden
 *
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 */
export function initMocks(): void {
  initProcedure();
  initTransactionQueue();
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.procedure = {} as MockProcedure;
  mockInstanceContainer.transactionQueue = {} as MockTransactionQueue;
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();
  initMocks();
}

/**
 * @hidden
 * Retrieve a Procedure instance
 */
export function getInstance<T, U, S = Record<string, unknown>>(
  context: Context,
  storage?: S
): Procedure<T, U, S> {
  const { procedure } = mockInstanceContainer;
  const value = merge({ context, storage }, procedure);
  Object.setPrototypeOf(value, require('~/internal').Procedure.prototype);

  return value as unknown as Procedure<T, U, S>;
}

/**
 * @hidden
 * Retrieve the stub of the `addTransaction` method
 */
export function getAddTransactionStub(): SinonStub {
  return addTransactionStub;
}

/**
 * @hidden
 * Retrieve the stub of the `addBatchTransaction` method
 */
export function getAddBatchTransactionStub(): SinonStub {
  return addBatchTransactionStub;
}

/**
 * @hidden
 * Retrieve the stub of the `addProcedure` method
 */
export function getAddProcedureStub(): SinonStub {
  return addProcedureStub;
}

/**
 * @hidden
 * Retrieve the stub of the `prepare` method
 */
export function getPrepareStub(): SinonStub {
  return prepareStub;
}

/**
 * @hidden
 * Retrieve the stub of the TransactionQueue constructor
 */
export function getTransactionQueueConstructorStub(): SinonStub {
  return transactionQueueConstructorStub;
}
