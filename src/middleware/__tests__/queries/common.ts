import BigNumber from 'bignumber.js';

import {
  getSizeAndOffset,
  heartbeatQuery,
  latestBlockQuery,
  latestSqVersionQuery,
  metadataQuery,
  removeUndefinedValues,
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
