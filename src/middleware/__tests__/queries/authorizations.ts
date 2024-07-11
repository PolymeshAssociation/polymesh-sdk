import BigNumber from 'bignumber.js';

import { authorizationsQuery } from '~/middleware/queries/authorizations';
import { AuthorizationStatusEnum, AuthTypeEnum } from '~/middleware/types';

describe('authorizationsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = authorizationsQuery({});

    expect(result.query).toBeDefined();

    const variables = {
      fromId: 'someId',
      toId: 'someOtherId',
      toKey: 'someKey',
      type: AuthTypeEnum.RotatePrimaryKey,
      status: AuthorizationStatusEnum.Consumed,
    };

    result = authorizationsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = authorizationsQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
