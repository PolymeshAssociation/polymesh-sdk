import { investmentsQuery } from '~/middleware/queries/stos';

describe('investmentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: 1,
      offeringToken: 'SOME_TICKER',
    };

    const result = investmentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
