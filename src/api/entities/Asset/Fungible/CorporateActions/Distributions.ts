import BigNumber from 'bignumber.js';

import {
  configureDividendDistribution,
  Context,
  DividendDistribution,
  FungibleAsset,
  Namespace,
  PolymeshError,
} from '~/internal';
import {
  ConfigureDividendDistributionParams,
  DistributionWithDetails,
  ErrorCode,
  ProcedureMethod,
} from '~/types';
import {
  assetToMeshAssetId,
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  distributionToDividendDistributionParams,
  meshCorporateActionToCorporateActionParams,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Distributions related functionality
 */
export class Distributions extends Namespace<FungibleAsset> {
  /**
   * Create a Dividend Distribution for a subset of the Asset Holders at a certain (existing or future) Checkpoint
   *
   * @note required role:
   *   - Origin Portfolio Custodian
   */
  public configureDividendDistribution: ProcedureMethod<
    ConfigureDividendDistributionParams,
    DividendDistribution
  >;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.configureDividendDistribution = createProcedureMethod(
      { getProcedureAndArgs: args => [configureDividendDistribution, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Retrieve a single Dividend Distribution associated to this Asset by its ID
   *
   * @throws if there is no Distribution with the passed ID
   */
  public async getOne(args: { id: BigNumber }): Promise<DistributionWithDetails> {
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
    const [corporateAction, capitalDistribution, details] = await Promise.all([
      query.corporateAction.corporateActions(rawAssetId, rawLocalId),
      query.capitalDistribution.distributions(rawCaId),
      query.corporateAction.details(rawCaId),
    ]);

    if (corporateAction.isNone || capitalDistribution.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Dividend Distribution does not exist',
      });
    }

    const dist = capitalDistribution.unwrap();

    const distribution = new DividendDistribution(
      {
        id,
        assetId: parent.id,
        ...meshCorporateActionToCorporateActionParams(corporateAction.unwrap(), details, context),
        ...distributionToDividendDistributionParams(dist, context),
      },
      context
    );

    const { reclaimed, remaining } = dist;

    return {
      distribution,
      details: {
        remainingFunds: balanceToBigNumber(remaining),
        fundsReclaimed: boolToBoolean(reclaimed),
      },
    };
  }

  /**
   * Retrieve all Dividend Distributions associated to this Asset, along with their details
   */
  public get(): Promise<DistributionWithDetails[]> {
    const { parent, context } = this;

    return context.getDividendDistributionsForAssets({ assets: [parent] });
  }
}
