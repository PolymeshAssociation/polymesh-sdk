import { print } from 'graphql';

import { investmentsQuery } from '~/middleware/queries/stos';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('investmentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: '0x12341234123412341234123412341234/1',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    const result = investmentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
    expect(print(result.query)).toContain('$stoId: String!');
  });
});
