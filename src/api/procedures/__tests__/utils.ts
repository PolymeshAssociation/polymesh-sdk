import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

import { assertProposalUnlocked } from '../utils';

jest.mock(
  '~/api/entities/Proposal',
  require('~/testUtils/mocks/entities').mockProposalModule('~/api/entities/Proposal')
);

describe('assertProposalUnlocked', () => {
  const pipId = 10;
  const mockAddress = 'someAddress';

  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        currentPairAddress: mockAddress,
      },
    });
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the proposal is not in pending state', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Killed,
          module: 'someModule',
          method: 'someMethod',
        },
      },
    });

    let error;
    try {
      await assertProposalUnlocked(pipId, mockContext);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must be in pending state');
  });

  test('should throw an error if the proposal is not in the cool off period', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
        getStage: ProposalStage.Open,
      },
    });

    let error;
    try {
      await assertProposalUnlocked(pipId, mockContext);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must be in its cool-off period');
  });

  test('should not throw an error if the proposal is unlocked', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
        getStage: ProposalStage.CoolOff,
      },
    });

    const result = await assertProposalUnlocked(pipId, mockContext);

    expect(result).toBeUndefined();
  });
});
