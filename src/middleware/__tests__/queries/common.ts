import {
  heartbeatQuery,
  latestBlockQuery,
  latestSqVersionQuery,
  metadataQuery,
} from '~/middleware/queries/common';

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
