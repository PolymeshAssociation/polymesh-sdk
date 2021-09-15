import BigNumber from 'bignumber.js';

import {
  configureDividendDistribution,
  ConfigureDividendDistributionParams,
  Context,
  DividendDistribution,
  Namespace,
  PolymeshError,
  SecurityToken,
} from '~/internal';
import { DistributionWithDetails, ErrorCode, ProcedureMethod } from '~/types';
import {
  balanceToBigNumber,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  distributionToDividendDistributionParams,
  meshCorporateActionToCorporateActionParams,
  numberToU32,
  stringToTicker,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Distributions related functionality
 */
export class Distributions extends Namespace<SecurityToken> {
  /**
   * Create a Dividend Distribution for a subset of the Tokenholders at a certain (existing or future) Checkpoint
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
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.configureDividendDistribution = createProcedureMethod(
      { getProcedureAndArgs: args => [configureDividendDistribution, { ticker, ...args }] },
      context
    );
  }

  /**
   * Retrieve a single Dividend Distribution associated to this Security Token by its ID
   *
   * @throws if there is no Distribution with the passed ID
   */
  public async getOne(args: { id: BigNumber }): Promise<DistributionWithDetails> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;
    const { id } = args;

    const rawTicker = stringToTicker(ticker, context);
    const rawCaId = numberToU32(id, context);
    const [corporateAction, capitalDistribution] = await Promise.all([
      query.corporateAction.corporateActions(rawTicker, rawCaId),
      query.capitalDistribution.distributions(
        corporateActionIdentifierToCaId({ ticker, localId: id }, context)
      ),
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
        ticker,
        ...meshCorporateActionToCorporateActionParams(corporateAction.unwrap(), context),
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
   * Retrieve all Dividend Distributions associated to this Security Token, along with their details
   */
  public get(): Promise<DistributionWithDetails[]> {
    const { parent, context } = this;

    return context.getDividendDistributionsForTokens({ tokens: [parent] });
  }
}
