import BigNumber from 'bignumber.js';

import { createBallot } from '~/api/procedures/createBallot';
import { Context, CorporateBallot, FungibleAsset, Namespace } from '~/internal';
import { CorporateBallotWithDetails, CreateBallotParams, ProcedureMethod } from '~/types';
import { assetToMeshAssetId, u32ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod, getCorporateBallotDetailsOrThrow } from '~/utils/internal';

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
  }

  /**
   * Retrieve a single Ballot associated to this Asset by its ID
   *
   * @throws if there is no Ballot assigned to the provided Corporate Action with the passed ID
   * @throws if the provided Corporate Action does not exist
   */
  public async getOne(args: { id: BigNumber }): Promise<CorporateBallotWithDetails> {
    const { parent, context } = this;
    const { id } = args;

    const ballotDetails = await getCorporateBallotDetailsOrThrow(parent, id, context);

    const ballot = new CorporateBallot(
      {
        id,
        assetId: parent.id,
      },
      context
    );

    return { ballot, details: ballotDetails };
  }

  /**
   * Retrieve all Ballots associated to this Asset
   */
  public async get(): Promise<CorporateBallotWithDetails[]> {
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

    const getBallotWithDetails = async (
      id: BigNumber
    ): Promise<CorporateBallotWithDetails | undefined> => {
      try {
        const ballot = await this.getOne({ id });

        return ballot;
      } catch {
        return undefined;
      }
    };

    const ballotsPromises = [];

    for (let i = 0; i < nextCaId.toNumber(); i++) {
      ballotsPromises.push(getBallotWithDetails(new BigNumber(i)));
    }

    const ballots = await Promise.all(ballotsPromises);

    return ballots.filter((b): b is CorporateBallotWithDetails => b !== undefined);
  }
}
