import BigNumber from 'bignumber.js';

import { Proposal } from '~/api/entities';
import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { booleanToBool, numberToBalance } from '~/utils';

export type VoteOnProposalParams = {
  vote: boolean;
  deposit: BigNumber;
};

export type Params = { pipId: number } & VoteOnProposalParams;

/**
 * @hidden
 */
export async function prepareVoteOnProposal(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { pipId, vote, deposit } = args;

  const proposal = new Proposal({ pipId }, context);

  const [details, stage, hasVoted, { free: freeBalance }] = await Promise.all([
    proposal.getDetails(),
    proposal.getStage(),
    proposal.identityHasVoted(),
    context.accountBalance(),
  ]);

  const { state } = details;

  if (state !== ProposalState.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in pending state',
    });
  }

  if (stage === ProposalStage.CoolOff) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must not be in its cool-off period',
    });
  }

  if (hasVoted) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Identity has already voted on this proposal',
    });
  }

  if (deposit.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Identity doesn't have enough balance",
      data: {
        freeBalance,
      },
    });
  }

  this.addTransaction(
    tx.pips.vote,
    {},
    pipId,
    booleanToBool(vote, context),
    numberToBalance(deposit, context)
  );
}

export const voteOnProposal = new Procedure(prepareVoteOnProposal);
