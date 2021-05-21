import {
  configureDividendDistribution,
  ConfigureDividendDistributionParams,
  Context,
  DividendDistribution,
  Namespace,
  SecurityToken,
} from '~/internal';
import { DistributionWithDetails } from '~/types';
import { ProcedureMethod } from '~/types/internal';
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
   * @note required roles:
   *   - Security Token Corporate Actions Agent
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
   * Retrieve all Dividend Distributions associated to this Security Token
   */
  public get(): Promise<DistributionWithDetails[]> {
    const { parent, context } = this;

    return context.getDividendDistributionsForTokens({ tokens: [parent] });
  }
}
