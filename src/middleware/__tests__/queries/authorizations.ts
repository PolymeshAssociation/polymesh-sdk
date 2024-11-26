import BigNumber from 'bignumber.js';

import { authorizationsQuery } from '~/middleware/queries/authorizations';
import { AuthorizationStatusEnum, AuthTypeEnum } from '~/middleware/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('authorizationsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = authorizationsQuery(false, {});

    expect(result.query).toBeDefined();

    const variables = {
      fromId: 'someId',
      toId: 'someOtherId',
      toKey: 'someKey',
      type: AuthTypeEnum.RotatePrimaryKey,
      status: AuthorizationStatusEnum.Consumed,
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    result = authorizationsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = authorizationsQuery(false, variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
