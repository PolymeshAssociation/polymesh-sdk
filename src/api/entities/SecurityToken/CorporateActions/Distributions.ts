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
   * @param args.declarationDate - date at which the issuer publicly declared the Distribution. Optional, defaults to the current date
   * @param args.checkpoint - checkpoint to be used to calculate Dividends. If a Schedule is passed, the next Checkpoint it creates will be used.
   *   If a Date is passed, a Checkpoint will be created at that date and used
   * @param args.targets - tokenholder identities to be included (or excluded) from the distribution. Inclusion/exclusion is controlled by the `treatment`
   *   property. When the value is `Include`, all tokenholders not present in the array are excluded, and vice-versa
   * @param args.defaultTaxWithholding - default percentage of the Dividends to be held for tax purposes
   * @param args.taxWithholdings - percentage of the Dividends to be held for tax purposes from individual tokenholder Identities.
   *   This overrides the value of `defaultTaxWithholding`
   * @param args.originPortfolio - portfolio from which the Dividends will be distributed. Optional, defaults to the Corporate Actions Agent's Default Portfolio
   * @param args.currency - ticker of the currency in which Dividends will be distributed
   * @param args.perShare - amount of `currency` to distribute per each share of the Security Token held
   * @param args.maxAmount - maximum amount of `currency` to distribute in total
   * @param args.paymentDate - date from which Tokenholders can claim their Dividends
   * @param args.expiryDate - a null value means the Distribution never expires
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
