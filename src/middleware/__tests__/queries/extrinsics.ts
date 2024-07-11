import { extrinsicByHash, extrinsicsByArgs } from '~/middleware/queries/extrinsics';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/types';

describe('extrinsicByHash', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      extrinsicHash: 'someHash',
    };

    const result = extrinsicByHash(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('extrinsicsByArgs', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = extrinsicsByArgs({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({});

    const variables = {
      blockId: '123',
      address: 'someAddress',
      moduleId: ModuleIdEnum.Asset,
      callId: CallIdEnum.CreateAsset,
      success: 1,
    };

    result = extrinsicsByArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
