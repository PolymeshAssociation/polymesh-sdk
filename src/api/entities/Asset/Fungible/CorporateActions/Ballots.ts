import BigNumber from 'bignumber.js';

import { createBallot } from '~/api/procedures/createBallot';
import { Context, CorporateBallot, FungibleAsset, Namespace, PolymeshError } from '~/internal';
import { CreateBallotParams, ErrorCode, ProcedureMethod } from '~/types';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  boolToBoolean,
  bytesToString,
  corporateActionIdentifierToCaId,
  meshCorporateBallotMetaToCorporateBallotMeta,
  momentToDate,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

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
  public async getOne(args: { id: BigNumber }): Promise<CorporateBallot> {
    const {
      parent,
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const { id } = args;
    const rawAssetId = assetToMeshAssetId(parent, context);
    const rawLocalId = bigNumberToU32(id, context);
    const rawCaId = corporateActionIdentifierToCaId({ asset: parent, localId: id }, context);

    const [corporateAction, rawDescription, rawMetas, rawRcv, rawTimeRange] = await Promise.all([
      query.corporateAction.corporateActions(rawAssetId, rawLocalId),
      query.corporateAction.details(rawCaId),
      query.corporateBallot.metas(rawCaId),
      query.corporateBallot.rcv(rawCaId),
      query.corporateBallot.timeRanges(rawCaId),
    ]);
    const timeRange = rawTimeRange.unwrap();

    if (corporateAction.isNone || rawMetas.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Ballot does not exist',
      });
    }

    const meta = meshCorporateBallotMetaToCorporateBallotMeta(rawMetas.unwrap());

    const ballot = new CorporateBallot(
      {
        id,
        assetId: parent.id,
        meta,
        description: bytesToString(rawDescription),
        rcv: boolToBoolean(rawRcv),
        startDate: momentToDate(timeRange.start),
        endDate: momentToDate(timeRange.end),
        declarationDate: momentToDate(corporateAction.unwrap().declDate),
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
}
