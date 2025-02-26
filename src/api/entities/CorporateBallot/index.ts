import BigNumber from 'bignumber.js';

import { Context, Entity, FungibleAsset } from '~/internal';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';
import { toHumanReadable } from '~/utils/internal';

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
  public asset: FungibleAsset;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers, context: Context) {
    super(args, context);

    const { id, assetId } = args;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
  }

  /**
   * Determine whether this Ballot exists on chain
   *
   */
  public async exists(): Promise<boolean> {
    const {
      polymeshApi: { query },
    } = this.context;

    const caId = corporateActionIdentifierToCaId(
      { localId: this.id, asset: this.asset },
      this.context
    );

    const ballot = await query.corporateBallot.metas(caId);

    return ballot.isSome;
  }

  /**
   * Return the Dividend Distribution's static data
   */
  public override toHuman(): HumanReadable {
    const { id, asset } = this;

    return toHumanReadable({ id, assetId: asset });
  }
}
