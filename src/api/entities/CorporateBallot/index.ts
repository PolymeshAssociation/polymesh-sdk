import BigNumber from 'bignumber.js';

import {
  CorporateBallotDetails,
  CorporateBallotMetaWithResults,
  CorporateBallotMotionWithResults,
  CorporateBallotStatus,
} from '~/api/entities/CorporateBallot/types';
import { removeBallot } from '~/api/procedures/removeBallot';
import { Context, Entity, FungibleAsset } from '~/internal';
import { NoArgsProcedureMethod } from '~/types';
import { corporateActionIdentifierToCaId, u128ToBigNumber } from '~/utils/conversion';
import {
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

    const { startDate, endDate } = details;

    const now = new Date();

    if (now < startDate) {
      return CorporateBallotStatus.Pending;
    }

    if (now < endDate) {
      return CorporateBallotStatus.Active;
    }

    return CorporateBallotStatus.Closed;
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
   * Remove the Ballot
   *
   * @note deletes the corporate action with the associated ballot if ballot has not started
   * @throws if ballot has already started
   * @throws if ballot is not found
   */
  public remove: NoArgsProcedureMethod<void>;
}
