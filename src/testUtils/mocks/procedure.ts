/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */

import { merge } from 'lodash';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { Context, Procedure } from '~/internal';
import { Mocked } from '~/testUtils/types';

type MockProcedure = Mocked<Procedure>;

const mockInstanceContainer = {
  procedure: {} as MockProcedure,
};

let procedureConstructorMock: jest.Mock;
let prepareMock: jest.Mock;

export const MockConfidentialProcedureClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return procedureConstructorMock(...args);
  }
};

export const mockConfidentialProcedureModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ConfidentialProcedure: MockConfidentialProcedureClass,
});

/**
 * @hidden
 * Initialize the procedure instance
 */
function initProcedure(): void {
  procedureConstructorMock = jest.fn();
  prepareMock = jest.fn();
  const procedure = {
    prepare: prepareMock.mockReturnValue({}),
  } as unknown as MockProcedure;

  Object.assign(mockInstanceContainer.procedure, procedure);
  procedureConstructorMock.mockImplementation(args => {
    const value = merge({}, procedure, args);
    Object.setPrototypeOf(value, require('~/internal').ConfidentialProcedure.prototype);
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
): ConfidentialProcedure<T, U, S> {
  const { procedure } = mockInstanceContainer;
  const value = merge({ context, storage }, procedure);
  Object.setPrototypeOf(value, require('~/internal').Procedure.prototype);

  return value as unknown as ConfidentialProcedure<T, U, S>;
}

/**
 * @hidden
 * Retrieve the mock of the `prepare` method
 */
export function getPrepareMock(): jest.Mock {
  return prepareMock;
}
