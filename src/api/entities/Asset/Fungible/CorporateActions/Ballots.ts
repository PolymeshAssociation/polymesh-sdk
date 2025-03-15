import BigNumber from 'bignumber.js';

import { createBallot } from '~/api/procedures/createBallot';
import { removeBallot } from '~/api/procedures/removeBallot';
import { Context, CorporateBallot, FungibleAsset, Namespace, PolymeshError } from '~/internal';
import {
  CreateBallotParams,
  ErrorCode,
  ProcedureMethod,
  RemoveCorporateBallotParams,
} from '~/types';
import { assetToMeshAssetId, u32ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod, getCorporateBallotDetails } from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

/**
 * Handles all Asset Ballots related functionality
 */
export class Ballots extends Namespace<FungibleAsset> {
  /**
   * Create a Ballot for an Asset
   *
   */
  public create: ProcedureMethod<CreateBallotParams, CorporateBallot>;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.create = createProcedureMethod(
      { getProcedureAndArgs: args => [createBallot, { asset: parent, ...args }] },
      context
    );

    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeBallot, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Retrieve a single Ballot associated to this Asset by its ID
   *
   * @throws if there is no Ballot assigned to the provided Corporate Action with the passed ID
   * @throws if the provided Corporate Action does not exist
   */
  public async getOne(args: { id: BigNumber }): Promise<CorporateBallot> {
    const { parent, context } = this;
    const { id } = args;

    const ballotDetails = await getCorporateBallotDetails(parent, id, context);

    if (!ballotDetails) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Ballot does not exist',
      });
    }

    const ballot = new CorporateBallot(
      {
        id,
        assetId: parent.id,
        ...ballotDetails,
      },
      context
    );

    return ballot;
  }

  /**
   * Retrieve all Ballots associated to this Asset
   */
  public async get(): Promise<CorporateBallot[]> {
    const {
      parent,
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const rawNextCaId = await query.corporateAction.caIdSequence(
      assetToMeshAssetId(parent, context)
    );
    const nextCaId = u32ToBigNumber(rawNextCaId);

    const getBallot = async (id: BigNumber): Promise<CorporateBallot | undefined> => {
      try {
        const ballot = await this.getOne({ id });

        return ballot;
      } catch {
        return undefined;
      }
    };

    const ballotsPromises = [];

    for (let i = 0; i < nextCaId.toNumber(); i++) {
      ballotsPromises.push(getBallot(new BigNumber(i)));
    }

    const ballots = await Promise.all(ballotsPromises);

    return ballots.filter((b): b is CorporateBallot => b !== undefined);
  }

  /* Remove a Ballot associated to this Asset by its ID
   *
   * @throws if the Ballot does not exist
   * @throws if the Ballot has already started
   */
  public remove: ProcedureMethod<RemoveCorporateBallotParams, void>;
}
