import BigNumber from 'bignumber.js';

import {
  multiSigProposalQuery,
  multiSigProposalsQuery,
  multiSigProposalVotesQuery,
} from '~/middleware/queries/multisigs';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('multiSigProposalQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      multisigId: 'multiSigAddress',
      proposalId: 1,
    };

    const result = multiSigProposalQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('multiSigProposalVotesQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      proposalId: 'multiSigAddress/1',
    };

    const result = multiSigProposalVotesQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('multiSigProposalsQuery', () => {
  const multisigId = 'someId';

  it('should return correct query and variables when size, start are not provided', () => {
    const result = multiSigProposalsQuery(multisigId);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: DEFAULT_GQL_PAGE_SIZE, start: 0, multisigId });
  });

  it('should return correct query and variables when size, start are provided', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(0);
    const result = multiSigProposalsQuery(multisigId, size, start);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: size.toNumber(),
      start: start.toNumber(),
      multisigId,
    });
  });
});
