import { investmentsQuery } from '~/middleware/queries/stos';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('investmentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: 1,
      offeringToken: 'SOME_TICKER',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    const result = investmentsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
