import { u128 } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import {
  ChoiceWithParticipation,
  CorporateBallotDetails,
  CorporateBallotMetaWithResults,
  CorporateBallotMotionWithParticipation,
  CorporateBallotMotionWithResults,
  CorporateBallotStatus,
  CorporateBallotWithParticipation,
} from '~/api/entities/CorporateBallot/types';
import { castBallotVote } from '~/api/procedures/castBallotVote';
import { modifyBallot } from '~/api/procedures/modifyBallot';
import { removeBallot } from '~/api/procedures/removeBallot';
import {
  Context,
  CorporateActionBase,
  FungibleAsset,
  modifyCaCheckpoint,
  PolymeshError,
} from '~/internal';
import {
  CastBallotVoteParams,
  CorporateActionKind,
  CorporateActionTargets,
  CorporateBallotWithDetails,
  ErrorCode,
  Identity,
  InputCaCheckpoint,
  ModifyCorporateBallotParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  TaxWithholding,
} from '~/types';
import {
  ballotDetailsToBallotStatus,
  corporateActionIdentifierToCaId,
  meshCorporateBallotMetaToCorporateBallotMeta,
  momentToDate,
  stringToIdentityId,
  u16ToBigNumber,
  u128ToBigNumber,
} from '~/utils/conversion';
import {
  asIdentity,
  createProcedureMethod,
  getCorporateBallotDetailsOrThrow,
} from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  assetId: string;
}
export interface Params {
  kind: CorporateActionKind;
  declarationDate: Date;
  description: string;
  targets: CorporateActionTargets;
  defaultTaxWithholding: BigNumber;
  taxWithholdings: TaxWithholding[];
}

/**
 * Represents a Ballot
 */
export class CorporateBallot extends CorporateActionBase {
  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Omit<Params, 'kind'>, context: Context) {
    const argsWithDefaultParams: UniqueIdentifiers & Params = {
      ...args,
      kind: CorporateActionKind.IssuerNotice,
    };

    super(argsWithDefaultParams, context);

    const { id, assetId } = args;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);

    this.remove = createProcedureMethod(
      {
        getProcedureAndArgs: () => [removeBallot, { id: this.id, asset: this.asset }],
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

    this.modify = createProcedureMethod(
      {
        getProcedureAndArgs: params => [
          modifyBallot,
          { asset: this.asset, ballot: this, ...params },
        ],
      },
      context
    );

    this.modifyCheckpoint = createProcedureMethod(
      {
        getProcedureAndArgs: params => [modifyCaCheckpoint, { corporateAction: this, ...params }],
      },
      context
    );
  }

  /**
   * Determine whether this Ballot exists on chain
   */
  public override async exists(): Promise<boolean> {
    const {
      id,
      asset,
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);
    const meta = await query.corporateBallot.metas(caId);

    return meta.isSome;
  }

  /**
   * Retrieve details associated with this Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async details(): Promise<CorporateBallotDetails> {
    const { id, asset, context } = this;

    return await getCorporateBallotDetailsOrThrow(asset, id, context);
  }

  /**
   * Return the status of the Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async status(): Promise<CorporateBallotStatus> {
    const {
      id,
      asset,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;
    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);

    const rawTimeRanges = await query.corporateBallot.timeRanges(caId);

    const timeRange = rawTimeRanges.unwrap();

    const startDate = momentToDate(timeRange.start);
    const endDate = momentToDate(timeRange.end);

    return ballotDetailsToBallotStatus({ startDate, endDate });
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
    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);
    const [rawMetas, rawResults] = await Promise.all([
      query.corporateBallot.metas(caId),
      query.corporateBallot.results(caId),
    ]);

    if (rawMetas.isNone) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The CorporateBallot does not exist',
      });
    }

    const { motions, title: ballotTitle } = meshCorporateBallotMetaToCorporateBallotMeta(
      rawMetas.unwrap()
    );

    let resultIndex = 0;

    const motionsWithResults = motions.map(({ title, infoLink, choices }) => {
      const motionWithResults: CorporateBallotMotionWithResults = {
        title,
        infoLink,
        choices: [],
        total: new BigNumber(0),
      };
      choices.forEach(choice => {
        // when no votes have been cast the rawResults[resultIndex] is undefined
        const choiceVoteTally =
          rawResults[resultIndex] !== undefined
            ? u128ToBigNumber(rawResults[resultIndex] as u128)
            : new BigNumber(0);
        motionWithResults.choices.push({
          choice,
          votes: choiceVoteTally,
        });
        motionWithResults.total = motionWithResults.total.plus(choiceVoteTally);
        resultIndex += 1;
      });
      return motionWithResults;
    });
    return {
      title: ballotTitle,
      motions: motionsWithResults,
    };
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
    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);
    const identityId = stringToIdentityId(asIdentity(did, context).did, context);
    const [rawMetas, rawDidVotes] = await Promise.all([
      query.corporateBallot.metas(caId),
      query.corporateBallot.votes(caId, identityId),
    ]);

    if (rawMetas.isNone) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The CorporateBallot does not exist',
      });
    }

    const { motions, title: ballotTitle } = meshCorporateBallotMetaToCorporateBallotMeta(
      rawMetas.unwrap()
    );

    let index = 0;

    const motionsWithParticipation: CorporateBallotMotionWithParticipation[] = motions.map(
      ({ title, infoLink, choices }) => {
        return {
          title,
          infoLink,
          choices: choices.map(choice => {
            const { power: rawPower, fallback: rawFallback } = rawDidVotes[index] ?? {
              power: new BigNumber(0),
              fallback: undefined,
            };

            let fallback: BigNumber | undefined;

            if (rawFallback?.isSome) {
              fallback = u16ToBigNumber(rawFallback.unwrap());
            }

            const power = BigNumber.isBigNumber(rawPower) ? rawPower : u128ToBigNumber(rawPower);

            const choiceWithParticipation: ChoiceWithParticipation = {
              choice,
              power,
              fallback,
            };

            index++;

            return choiceWithParticipation;
          }),
        };
      }
    );
    return {
      title: ballotTitle,
      motions: motionsWithParticipation,
    };
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

  /**
   * Change the Ballot's metadata (title and motions), its end date, or whether it uses Ranked
   *   Choice Voting (RCV). Pass any of them; each one given is changed in the same batch
   *
   * @note the Ballot can only be modified before its voting period starts
   * @throws if none of `meta`, `endDate` or `rcv` is given
   * @throws if a given value is the same as the current one
   * @throws if the new end date is before the start date
   */
  public modify: ProcedureMethod<
    Omit<ModifyCorporateBallotParams, 'ballot'>,
    CorporateBallotWithDetails
  >;

  /**
   * Modify the Corporate Ballot's Record Date
   */
  public modifyCheckpoint: ProcedureMethod<{ checkpoint: InputCaCheckpoint }, void>;
}
