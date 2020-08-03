import { Proposal } from '~/api/entities';
import { ProposalStage } from '~/api/entities/Proposal/types';
import { PolymeshError } from '~/base';
import { Context } from '~/context';
import { ErrorCode } from '~/types';

/**
 * @hidden
 */
export async function assertProposalUnlocked(pipId: number, context: Context): Promise<void> {
  const proposal = new Proposal({ pipId }, context);

  const [details, stage] = await Promise.all([proposal.getDetails(), proposal.getStage()]);

  const { state } = details;

  if (!state.isPending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in pending state',
    });
  }

  if (stage !== ProposalStage.CoolOff) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal can be canceled only during its cool off period',
    });
  }
}
