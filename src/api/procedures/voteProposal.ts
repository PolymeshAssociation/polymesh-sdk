import BigNumber from 'bignumber.js';

import { Proposal } from '~/api/entities';
import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { booleanToBool, numberToBalance } from '~/utils';

export type VoteProposalParams = {
  vote: boolean;
  deposit: BigNumber;
};

export type Params = { pipId: number } & VoteProposalParams;

/**
 * @hidden
 */
export async function prepareVoteProposal(
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
      message: 'The identity has already voted this proposal',
    });
  }

  if (deposit.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The identity has not enough balance',
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

export const voteProposal = new Procedure(prepareVoteProposal);
