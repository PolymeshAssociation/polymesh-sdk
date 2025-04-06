import { PalletCorporateActionsBallotBallotVote } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  CorporateBallotDetails,
  CorporateBallotStatus,
} from '~/api/entities/CorporateBallot/types';
import { CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { BallotMotion, BallotVote, CastBallotVoteParams, ErrorCode, TxTags } from '~/types';
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
      vote => BigNumber.isBigNumber(vote.fallback) && vote.fallback.gte(motion.choices.length)
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
    const motionVotes = votes[motionIndex];

    assertMotionVotes(motionVotes, motion);

    motionVotes.forEach(vote => {
      const { fallback, power } = vote;

      rawVotes.push(
        ballotVoteToMeshBallotVote(
          power,
          BigNumber.isBigNumber(fallback) ? fallback.plus(motionIndex) : undefined,
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
  return {
    permissions: {
      transactions: [TxTags.corporateBallot.Vote],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const castBallotVote = (): Procedure<Params, void> =>
  new Procedure(prepareCastBallotVote, getAuthorization);
