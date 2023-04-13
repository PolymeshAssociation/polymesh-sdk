import { TypeDef } from '@polkadot/types/types';

import { TransactionArgumentType } from '~/types';

import { processType } from '../utils';

describe('Process Type', () => {
  it('should be a function', () => {
    expect(typeof processType).toBe('function');
  });

  it('should return unknown type if info contains previously unknown type', () => {
    const rawType = { info: 1000 } as unknown as TypeDef;
    const name = 'foo';

    const result = processType(rawType, name);

    expect(result.type).toBe(TransactionArgumentType.Unknown);
  });
});
