import {
  configureDividendDistribution,
  ConfigureDividendDistributionParams,
  Context,
  DividendDistribution,
  Namespace,
  SecurityToken,
} from '~/internal';
import { DistributionWithDetails, ProcedureMethod } from '~/types';
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
   * Retrieve all Dividend Distributions associated to this Security Token
   */
  public get(): Promise<DistributionWithDetails[]> {
    const { parent, context } = this;

    return context.getDividendDistributionsForTokens({ tokens: [parent] });
  }
}
