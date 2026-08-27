import BigNumber from 'bignumber.js';

import {
  createArgsAndFilters,
  getSizeAndOffset,
  heartbeatQuery,
  latestBlockQuery,
  latestSqVersionQuery,
  metadataQuery,
  orderByClause,
  removeUndefinedValues,
  toOrderByList,
} from '~/middleware/queries/common';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('latestBlockQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = latestBlockQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('heartbeat', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = heartbeatQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('metadataQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = metadataQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('latestSqVersionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = latestSqVersionQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('getSizeAndOffset', () => {
  it('should return default values when no parameters are provided', () => {
    const result = getSizeAndOffset();
    expect(result).toEqual({
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });
  });

  it('should return provided values when parameters are passed', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(5);
    const result = getSizeAndOffset(size, start);
    expect(result).toEqual({
      size: 10,
      start: 5,
    });
  });

  it('should handle when only size is provided', () => {
    const size = new BigNumber(15);
    const result = getSizeAndOffset(size);
    expect(result).toEqual({
      size: 15,
      start: 0,
    });
  });

  it('should handle when only start is provided', () => {
    const start = new BigNumber(20);
    const result = getSizeAndOffset(undefined, start);
    expect(result).toEqual({
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 20,
    });
  });
});

describe('removeUndefinedValues', () => {
  it('should remove undefined values from object', () => {
    const input = {
      a: 1,
      b: undefined,
      c: 'test',
      d: undefined,
      e: null,
      f: 0,
      g: '',
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual({
      a: 1,
      c: 'test',
      e: null,
      f: 0,
      g: '',
    });
  });

  it('should return empty object when all values are undefined', () => {
    const input = {
      a: undefined,
      b: undefined,
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual({});
  });

  it('should return same object when no undefined values exist', () => {
    const input = {
      a: 1,
      b: 'test',
      c: null,
      d: false,
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual(input);
  });
});

describe('createArgsAndFilters', () => {
  it('should only emit the attributes actually supplied', () => {
    const { args, filter } = createArgsAndFilters({ assetId: 'someAsset', ticker: undefined }, {});

    expect(args).toBe('($start: Int,$size: Int,$assetId: String!)');
    expect(filter).toBe('filter: { assetId: { equalTo: $assetId } }');
  });

  it('should default to a String variable compared with equalTo', () => {
    const { args, filter } = createArgsAndFilters({ stoId: 1 }, { stoId: 'Int' });

    expect(args).toContain('$stoId: Int!');
    expect(filter).toBe('filter: { stoId: { equalTo: $stoId } }');
  });

  it('should accept a comparison other than equalTo', () => {
    const { args, filter } = createArgsAndFilters(
      { amount: '0' },
      { amount: { type: 'BigFloat', operator: 'greaterThan' } }
    );

    expect(args).toContain('$amount: BigFloat!');
    expect(filter).toBe('filter: { amount: { greaterThan: $amount } }');
  });

  it('should filter on a falsy value that was supplied', () => {
    // `success: 0` means "only the failed ones"; dropping it returned everything
    const { filter } = createArgsAndFilters({ success: 0 }, { success: 'Int' });

    expect(filter).toBe('filter: { success: { equalTo: $success } }');
  });

  it('should skip an attribute that was not supplied', () => {
    expect(createArgsAndFilters({ address: undefined, moduleId: null }, {}).filter).toBe('');
  });

  it('should emit no filter block when nothing is supplied', () => {
    expect(createArgsAndFilters({}, {}).filter).toBe('');
  });
});

describe('orderByClause', () => {
  const ID_ASC = 'ID_ASC';
  const ID_DESC = 'ID_DESC';
  const DATETIME_DESC = 'DATETIME_DESC';
  const AMOUNT_ASC = 'AMOUNT_ASC';

  it('should order by the unique key alone when nothing is supplied', () => {
    expect(orderByClause(undefined, [ID_ASC])).toBe(ID_ASC);
    expect(orderByClause([], [ID_ASC])).toBe(ID_ASC);
  });

  it('should keep the unique key behind what a caller asks for, so paging stays stable', () => {
    // `AMOUNT_ASC` decides no row on its own: paging over it can repeat and skip rows
    expect(orderByClause(AMOUNT_ASC, [ID_ASC])).toBe(`${AMOUNT_ASC}, ${ID_ASC}`);
  });

  it('should keep several supplied keys in the order they were given', () => {
    expect(orderByClause([AMOUNT_ASC, DATETIME_DESC], [ID_ASC])).toBe(
      `${AMOUNT_ASC}, ${DATETIME_DESC}, ${ID_ASC}`
    );
  });

  it('should not append a key whose column the caller already ordered by', () => {
    // appending `ID_ASC` behind their `ID_DESC` says nothing, and ahead of it would ignore them
    expect(orderByClause(ID_DESC, [ID_ASC])).toBe(ID_DESC);
    expect(orderByClause([AMOUNT_ASC, ID_DESC], [ID_ASC])).toBe(`${AMOUNT_ASC}, ${ID_DESC}`);
  });

  it('should append every key a query needs to decide a row', () => {
    expect(orderByClause(AMOUNT_ASC, ['CREATED_BLOCK_ID_DESC', ID_DESC])).toBe(
      `${AMOUNT_ASC}, CREATED_BLOCK_ID_DESC, ${ID_DESC}`
    );
  });
});

describe('toOrderByList', () => {
  it('should read one key, several, or none', () => {
    expect(toOrderByList('ID_ASC')).toEqual(['ID_ASC']);
    expect(toOrderByList(['ID_ASC', 'ID_DESC'])).toEqual(['ID_ASC', 'ID_DESC']);
    expect(toOrderByList(undefined)).toEqual([]);
  });
});
