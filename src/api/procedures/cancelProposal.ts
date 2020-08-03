import { Proposal } from '~/api/entities';
import { ProposalStage } from '~/api/entities/Proposal/types';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { accountKeyToString } from '~/utils';

export type Params = { pipId: number };

/**
 * @hidden
 */
export async function prepareCancelProposal(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { pipId } = args;

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

  this.addTransaction(tx.pips.cancelProposal, {}, pipId);
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<Params>, { pipId }: Params): Promise<boolean> {
  const {
    context: {
      polymeshApi: {
        query: { pips },
      },
    },
  } = this;

  const metadata = await pips.proposalMetadata(pipId);
  const { proposer } = metadata.unwrap();

  return accountKeyToString(proposer) === this.context.getCurrentPair().address;
}

export const cancelProposal = new Procedure(prepareCancelProposal, isAuthorized);
