import BigNumber from 'bignumber.js';

import {
  instructionsByDidQuery,
  instructionsQuery,
  settlementsForAllPortfoliosQuery,
  settlementsQuery,
} from '~/middleware/queries/settlementsOld';
import { InstructionStatusEnum } from '~/middleware/types';

describe('instructionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      status: InstructionStatusEnum.Executed,
      id: '1',
    };

    let result = instructionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionsQuery(
      {
        venueId: '2',
      },
      new BigNumber(10),
      new BigNumber(2)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      venueId: '2',
      size: 10,
      start: 2,
    });
  });
});

describe('instructionsByDidQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = instructionsByDidQuery('someDid');
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ fromId: 'someDid/', toId: 'someDid/' });
  });
});

describe('settlementsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      portfolioId: new BigNumber(1),
      assetId: '0x1234',
      address: 'someAddress',
    };

    const result = settlementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x1234',
      fromId: 'someDid/1',
      toId: 'someDid/1',
    });
  });
});

describe('settlementsForAllPortfoliosQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      assetId: '0x1234',
      address: 'someAddress',
    };

    const result = settlementsForAllPortfoliosQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x1234',
      fromId: 'someDid',
      toId: 'someDid',
    });
  });
});
