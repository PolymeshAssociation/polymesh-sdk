import BigNumber from 'bignumber.js';

import { CorporateBallotDetails } from '~/api/entities/CorporateBallot/types';
import { removeBallot } from '~/api/procedures/removeBallot';
import { Context, Entity, FungibleAsset, PolymeshError } from '~/internal';
import { ErrorCode, NoArgsProcedureMethod } from '~/types';
import {
  createProcedureMethod,
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

    try {
      await getCorporateBallotDetailsOrThrow(asset, id, context);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Retrieve details associated with this Ballot
   *
   * @throws if the Ballot does not exist
   */
  public async details(): Promise<CorporateBallotDetails> {
    const { id, asset, context } = this;

    const details = await getCorporateBallotDetails(asset, id, context);

    if (!details) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The CorporateBallot does not exist',
      });
    }

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
   * Remove the Ballot
   *
   * @note deletes the corporate action with the associated ballot if ballot has not started
   * @throws if ballot has already started
   * @throws if ballot is not found
   */
  public remove: NoArgsProcedureMethod<void>;
}
