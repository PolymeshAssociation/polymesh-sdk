import { PalletCorporateActionsBallotBallotVote } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  BallotMotion,
  BallotVote,
  CorporateBallotDetails,
  CorporateBallotStatus,
} from '~/api/entities/CorporateBallot/types';
import { CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { CastBallotVoteParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  ballotDetailsToBallotStatus,
  ballotVoteToMeshBallotVote,
  corporateActionIdentifierToCaId,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = CastBallotVoteParams & {
  asset: FungibleAsset;
  ballot: CorporateBallot;
};

/**
 * @hidden
 */
export interface Storage {
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export function assertBallotIsActive(ballotDetails: CorporateBallotDetails): void {
  const status = ballotDetailsToBallotStatus(ballotDetails);

  if (status !== CorporateBallotStatus.Active) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Ballot is not active',
      data: {
        status,
        startDate: ballotDetails.startDate,
        endDate: ballotDetails.endDate,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertRcvVoting(
  ballotDetails: CorporateBallotDetails,
  votes: CastBallotVoteParams['votes']
): void {
  if (ballotDetails.rcv) {
    return;
  }

  if (votes.flat().some(vote => vote.fallback !== undefined)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Fallback votes are not allowed for this ballot',
    });
  }
}

/**
 * @hidden
 */
export function assertVoteCount(
  ballotDetails: CorporateBallotDetails,
  votes: CastBallotVoteParams['votes']
): void {
  if (
    votes.flat().length !==
    ballotDetails.meta.motions.reduce((acc, motion) => acc + motion.choices.length, 0)
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Number of votes must match total number choices in all motions',
    });
  }
}

/**
 * @hidden
 */
export function assertMotionVotes(motionVotes: BallotVote[], motion: BallotMotion): void {
  if (motionVotes.length !== motion.choices.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Number of votes must match number of choices in motion',
      data: {
        motion: motion.title,
        expected: motion.choices.length,
        actual: motionVotes.length,
      },
    });
  }

  if (
    motionVotes.some(
      vote =>
        BigNumber.isBigNumber(vote.fallback) &&
        (vote.fallback.lt(new BigNumber(0)) || vote.fallback.gte(motion.choices.length))
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Fallback vote must point to a choice in the motion',
      data: {
        motion: motion.title,
      },
    });
  }

  if (
    motionVotes.some(
      (vote, index) => BigNumber.isBigNumber(vote.fallback) && vote.fallback.eq(index)
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Fallback vote cannot point to the same choice as the vote',
      data: {
        motion: motion.title,
      },
    });
  }
}

/**
 * @hidden
 */
export async function prepareCastBallotVote(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateBallot', 'vote'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { corporateBallot },
      },
    },
    context,
  } = this;
  const { ballot, votes, asset } = args;

  const ballotDetails = await ballot.details();
  const {
    meta: { motions },
  } = ballotDetails;

  assertBallotIsActive(ballotDetails);
  assertRcvVoting(ballotDetails, votes);
  assertVoteCount(ballotDetails, votes);

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId: ballot.id }, context);
  const rawVotes: PalletCorporateActionsBallotBallotVote[] = [];

  motions.forEach((motion, motionIndex) => {
    const motionVotes = votes[motionIndex]!;

    assertMotionVotes(motionVotes, motion);

    motionVotes.forEach(vote => {
      const { fallback, power } = vote;

      rawVotes.push(
        ballotVoteToMeshBallotVote(
          power,
          BigNumber.isBigNumber(fallback) ? fallback : undefined,
          context
        )
      );
    });
  });

  return {
    transaction: corporateBallot.vote,
    args: [rawCaId, rawVotes],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  /*
   * Voting is a holder action, so no External Agent permissions are required.
   *
   * `permissions` applies to both secondary Accounts and External Agent
   * Identities, so naming the Asset there in order to scope the transaction
   * permission also asserts that the signer is an Agent of that Asset — see
   * `Procedure.checkRolesAndAgentPermissions`, which runs the Agent check
   * whenever both `assets` and `transactions` are non-empty. A holder is not an
   * Agent of the Asset they hold, so that made this Procedure unreachable for
   * its intended callers, failing with "The Identity is not an Agent for the
   * Asset".
   *
   * These are declared separately rather than by emptying `assets` (as
   * `claimDividends` does) so that the Asset scoping of a secondary Account's
   * permissions is preserved: a secondary key permissioned for one Asset should
   * not be able to vote on another.
   */
  return {
    signerPermissions: {
      transactions: [TxTags.corporateBallot.Vote],
      assets: [asset],
      portfolios: [],
    },
    agentPermissions: true,
  };
}

/**
 * @hidden
 */
export const castBallotVote = (): Procedure<Params, void> =>
  new Procedure(prepareCastBallotVote, getAuthorization);
