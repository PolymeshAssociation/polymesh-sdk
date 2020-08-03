import { Proposal } from '~/api/entities';
import { ProposalStage } from '~/api/entities/Proposal/types';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { accountKeyToString, stringToText } from '~/utils';

export type EditProposalParams =
  | {
      description?: string;
      discussionUrl: string;
    }
  | {
      description: string;
      discussionUrl?: string;
    };

export type Params = { pipId: number } & EditProposalParams;

/**
 * @hidden
 */
export async function prepareEditProposal(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { pipId, description, discussionUrl } = args;

  if (description === undefined && discussionUrl === undefined) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

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
      message: 'The proposal is mutable only during its cool off period',
    });
  }

  this.addTransaction(
    tx.pips.amendProposal,
    {},
    pipId,
    discussionUrl ? stringToText(discussionUrl, context) : null,
    description ? stringToText(description, context) : null
  );
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

export const editProposal = new Procedure(prepareEditProposal, isAuthorized);
