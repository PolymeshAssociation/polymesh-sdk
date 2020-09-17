import BigNumber from 'bignumber.js';

import { Proposal } from '~/api/entities';
import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { Context, PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

/**
 * @hidden
 */
export async function assertProposalUnlocked(pipId: BigNumber, context: Context): Promise<void> {
  const proposal = new Proposal({ pipId }, context);

  const [details, stage] = await Promise.all([proposal.getDetails(), proposal.getStage()]);

  const { lastState } = details;

  if (lastState !== ProposalState.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in pending state',
    });
  }

  if (stage !== ProposalStage.CoolOff) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in its cool-off period',
    });
  }
}
