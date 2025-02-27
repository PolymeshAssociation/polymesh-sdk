import BigNumber from 'bignumber.js';

import { Context, Entity, FungibleAsset } from '~/internal';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';
import { toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface BallotMotion {
  title: string;
  infoLink: string;
  choices: string[];
}

export interface BallotMeta {
  title: string;
  motions: BallotMotion[];
}

export interface HumanReadable {
  id: string;
  assetId: string;
  meta: BallotMeta;
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
  public asset: FungibleAsset;

  /**
   * Ballot metadata
   */
  public meta: BallotMeta;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & { meta: BallotMeta }, context: Context) {
    super(args, context);

    const { id, assetId, meta } = args;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
    this.meta = meta;
  }

  /**
   * Determine whether this Ballot exists on chain
   *
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { corporateBallot },
        },
      },
      id,
      asset,
      context,
    } = this;

    const caId = corporateActionIdentifierToCaId({ localId: id, asset }, context);

    const ballot = await corporateBallot.metas(caId);

    return ballot.isSome;
  }

  /**
   * Return the Dividend Distribution's static data
   */
  public override toHuman(): HumanReadable {
    const { id, asset, meta } = this;

    return toHumanReadable({ id, assetId: asset.id, meta });
  }
}
