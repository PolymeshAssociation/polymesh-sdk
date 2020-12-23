/* istanbul ignore file */

import sinon, { SinonStub } from 'sinon';

import { Context, Procedure } from '~/internal';
import { Mocked } from '~/testUtils/types';

const mockInstanceContainer = {
  procedure: {} as MockProcedure,
};

type MockProcedure = Mocked<Procedure>;

let procedureConstructorStub: SinonStub;
let addTransactionStub: SinonStub;
let addBatchTransactionStub: SinonStub;

export const MockProcedureClass = class {
  /**
   * @hidden
   */
  constructor() {
    return procedureConstructorStub();
  }
};

export const mockProcedureModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  PolymeshTransaction: MockProcedureClass,
});

/**
 * @hidden
 * Initialize the procedure instance
 */
function initProcedure(): void {
  procedureConstructorStub = sinon.stub();
  addTransactionStub = sinon.stub();
  addBatchTransactionStub = sinon.stub();
  const procedure = ({
    addTransaction: addTransactionStub.returns([]),
    addBatchTransaction: addBatchTransactionStub.returns([]),
  } as unknown) as MockProcedure;

  mockInstanceContainer.procedure = procedure;
  procedureConstructorStub.returns(procedure);
}

/**
 * @hidden
 *
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 */
export function initMocks(): void {
  initProcedure();
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.procedure = {} as MockProcedure;
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
export function getInstance<T, U, S = {}>(context: Context, storage?: S): Procedure<T, U, S> {
  const { procedure } = mockInstanceContainer;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (procedure as any).context = context;
  (procedure as any).storage = storage;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (procedure as unknown) as Procedure<T, U, S>;
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
