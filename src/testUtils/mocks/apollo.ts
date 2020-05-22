import { InMemoryCache } from 'apollo-cache-inmemory';
import { createMockClient, MockApolloClient } from 'mock-apollo-client';

let mockApolloClient: MockApolloClient;

/**
 * Create a mock instance of the Apollo Client lib
 */
export function initMocks(): MockApolloClient {
  mockApolloClient = createMockClient({
    cache: new InMemoryCache(),
  });
  return mockApolloClient;
}

export const mockApolloModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  ApolloClient: class {
    // eslint-disable-next-line require-jsdoc
    public constructor() {
      return initMocks();
    }
  },
});

/**
 * @hidden
 * Retrieve an instance of the mocked Apollo Client
 */
export function getApolloClient(): MockApolloClient {
  return mockApolloClient;
}
