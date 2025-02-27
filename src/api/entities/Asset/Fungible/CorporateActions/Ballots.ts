import BigNumber from 'bignumber.js';

import { CorporateBallot, FungibleAsset, Namespace, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  corporateActionIdentifierToCaId,
  meshCorporateBallotMetaToCorporateBallotMeta,
} from '~/utils/conversion';

/**
 * Handles all Asset Ballots related functionality
 */
export class Ballots extends Namespace<FungibleAsset> {
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

    const [corporateAction, rawMetas] = await Promise.all([
      query.corporateAction.corporateActions(rawAssetId, rawLocalId),
      query.corporateBallot.metas(rawCaId),
    ]);

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
      },
      context
    );

    return ballot;
  }
}
