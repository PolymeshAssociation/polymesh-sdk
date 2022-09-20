/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */

import { merge } from 'lodash';

import { Context, Procedure } from '~/internal';
import { Mocked } from '~/testUtils/types';

type MockProcedure = Mocked<Procedure>;

const mockInstanceContainer = {
  procedure: {} as MockProcedure,
};

let procedureConstructorStub: jest.Mock;
let prepareStub: jest.Mock;

export const MockProcedureClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return procedureConstructorStub(...args);
  }
};

export const mockProcedureModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Procedure: MockProcedureClass,
});

/**
 * @hidden
 * Initialize the procedure instance
 */
function initProcedure(): void {
  procedureConstructorStub = jest.fn();
  prepareStub = jest.fn();
  const procedure = {
    prepare: prepareStub.mockReturnValue({}),
  } as unknown as MockProcedure;

  Object.assign(mockInstanceContainer.procedure, procedure);
  procedureConstructorStub.mockImplementation(args => {
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
 * Retrieve the stub of the `prepare` method
 */
export function getPrepareStub(): jest.Mock {
  return prepareStub;
}
