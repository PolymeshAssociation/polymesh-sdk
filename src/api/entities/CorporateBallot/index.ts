import BigNumber from 'bignumber.js';

import { Context, Entity, FungibleAsset } from '~/internal';
import { BallotMeta, CreateBallotParams } from '~/types';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';
import { toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  assetId: string;
  meta: BallotMeta;
  description: string;
  declarationDate: string;
  startDate: string;
  endDate: string;
  rcv: boolean;
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
   * Ballot description
   */
  public description: string;

  /**
   * Ballot metadata
   */
  public meta: BallotMeta;

  /**
   * Ballot declaration date
   */
  public declarationDate: Date;

  /**
   * Ballot start date
   */
  public startDate: Date;

  /**
   * Ballot end date
   */
  public endDate: Date;

  /**
   * Ballot Rcv
   */
  public rcv: boolean;

  /**
   * @hidden
   */
  public constructor(
    args: UniqueIdentifiers &
      Omit<CreateBallotParams, 'declarationDate' | 'rcv'> & { rcv: boolean; declarationDate: Date },
    context: Context
  ) {
    super(args, context);

    const { id, assetId, meta, rcv, startDate, endDate, description, declarationDate } = args;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
    this.meta = meta;
    this.rcv = rcv;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.declarationDate = declarationDate;
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
    const { id, asset, meta, description, declarationDate, startDate, endDate, rcv } = this;

    return toHumanReadable({
      id,
      assetId: asset.id,
      meta,
      description,
      declarationDate,
      startDate,
      endDate,
      rcv,
    });
  }
}
