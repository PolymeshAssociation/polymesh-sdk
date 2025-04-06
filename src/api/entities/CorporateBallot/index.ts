import BigNumber from 'bignumber.js';

import {
  CorporateBallotDetails,
  CorporateBallotMetaWithResults,
  CorporateBallotMotionWithParticipation,
  CorporateBallotMotionWithResults,
  CorporateBallotStatus,
  CorporateBallotWithParticipation,
} from '~/api/entities/CorporateBallot/types';
import { castBallotVote } from '~/api/procedures/castBallotVote';
import { removeBallot } from '~/api/procedures/removeBallot';
import { Context, Entity, FungibleAsset } from '~/internal';
import { CastBallotVoteParams, Identity, NoArgsProcedureMethod, ProcedureMethod } from '~/types';
import {
  ballotDetailsToBallotStatus,
  corporateActionIdentifierToCaId,
  stringToIdentityId,
  u16ToBigNumber,
  u128ToBigNumber,
} from '~/utils/conversion';
import {
  asIdentity,
  createProcedureMethod,
  getCorporateBallotDetailsOrNull,
  getCorporateBallotDetailsOrThrow,
  toHumanReadable,
} from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  assetId: string;
}

/**
 * Represents a Ballot
 */
export class CorporateBallot extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * internal Corporate Action ID to which this Ballot is attached
   */
  public id: BigNumber;

  /**
   * Asset affected by this Ballot
   */
  private readonly asset: FungibleAsset;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers, context: Context) {
    super(args, context);

    const { id, assetId } = args;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);

    this.remove = createProcedureMethod(
      {
        getProcedureAndArgs: () => [removeBallot, { ballot: this, asset: this.asset }],
        voidArgs: true,
      },
      context
    );

    this.vote = createProcedureMethod(
      {
        getProcedureAndArgs: params => [
          castBallotVote,
          { asset: this.asset, ballot: this, ...params },
        ],
      },
      context
    );
  }

  /**
   * Determine whether this Ballot exists on chain
   *
   */
  public async exists(): Promise<boolean> {
    const { id, asset, context } = this;

    const details = await getCorporateBallotDetailsOrNull(asset, id, context);

    return !!details;
  }

  /**
   * Retrieve details associated with this Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async details(): Promise<CorporateBallotDetails> {
    const { id, asset, context } = this;

    const details = await getCorporateBallotDetailsOrThrow(asset, id, context);

    return details;
  }

  /**
   * Return the Corporate Ballot's static data
   */
  public override toHuman(): HumanReadable {
    const { id, asset } = this;

    return toHumanReadable({
      id,
      assetId: asset.id,
    });
  }

  /**
   * Return the status of the Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async status(): Promise<CorporateBallotStatus> {
    const details = await this.details();

    return ballotDetailsToBallotStatus(details);
  }

  /**
   * Retrieve the results of the Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async results(): Promise<CorporateBallotMetaWithResults> {
    const {
      id,
      asset,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const {
      meta: { title: ballotTitle, motions },
    } = await this.details();

    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);

    const rawResults = await query.corporateBallot.results(caId);
    const results = rawResults.map(result => u128ToBigNumber(result));

    const metaWithResults: CorporateBallotMetaWithResults = {
      title: ballotTitle,
      motions: [],
    };

    let resultIndex = 0;

    motions.forEach(({ title, infoLink, choices }) => {
      const motionWithResults: CorporateBallotMotionWithResults = {
        title,
        infoLink,
        choices: [],
        total: new BigNumber(0),
      };

      choices.forEach(choice => {
        motionWithResults.choices.push({
          choice,
          votes: results[resultIndex],
        });
        motionWithResults.total = motionWithResults.total.plus(results[resultIndex]);
        resultIndex += 1;
      });

      metaWithResults.motions.push(motionWithResults);
    });

    return metaWithResults;
  }

  /**
   * Retrieve the participation of the Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async votesByIdentity(did: Identity | string): Promise<CorporateBallotWithParticipation> {
    const {
      id,
      asset,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const {
      meta: { title: ballotTitle, motions },
    } = await this.details();

    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);
    const identityId = stringToIdentityId(asIdentity(did, context).did, context);

    const rawDidVotes = await query.corporateBallot.votes(caId, identityId);

    const voteMap = new Map<number, BigNumber>();
    const fallbackMap = new Map<number, string | undefined>();
    const choicesMap = new Map<number, string>();

    let choiceIndex = 0;

    motions.forEach(({ choices }) => {
      choices.forEach(choice => {
        choicesMap.set(choiceIndex, choice);
        choiceIndex += 1;
      });
    });

    rawDidVotes.forEach(({ power, fallback }, index) => {
      voteMap.set(index, u128ToBigNumber(power));

      fallbackMap.set(
        index,
        fallback.isSome ? choicesMap.get(u16ToBigNumber(fallback.unwrap()).toNumber()) : undefined
      );
    });

    const metaWithParticipation: CorporateBallotWithParticipation = {
      title: ballotTitle,
      motions: [],
    };

    let motionIndex = 0;

    motions.forEach(({ title, infoLink, choices }) => {
      const motionWithParticipation: CorporateBallotMotionWithParticipation = {
        title,
        infoLink,
        choices: [],
      };

      choices.forEach(choice => {
        motionWithParticipation.choices.push({
          choice,
          power: voteMap.get(motionIndex) as BigNumber,
          fallback: fallbackMap.get(motionIndex),
        });
        motionIndex += 1;
      });

      metaWithParticipation.motions.push(motionWithParticipation);
    });

    return metaWithParticipation;
  }

  /**
   * Remove the Ballot
   *
   * @note deletes the corporate action with the associated ballot if ballot has not started
   * @throws if ballot has already started
   * @throws if ballot is not found
   */
  public remove: NoArgsProcedureMethod<void>;

  /**
   * Cast a vote on the Ballot
   *
   * @throws if the Ballot does not exist
   * @throws if the Ballot voting is not active
   * @throws if the number of votes does not match the sum of all choices of all motions
   * @throws if fallback votes are provided for a non-RCV Ballot
   * @throws if vote does not point to the correct choice in motion
   * @throws if the fallback vote is the same as the choice
   * @throws if the fallback vote is not pointing to a choice in the motion
   */
  public vote: ProcedureMethod<CastBallotVoteParams, void>;
}
