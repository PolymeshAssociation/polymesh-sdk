import BigNumber from 'bignumber.js';
import { CAId, Distribution } from 'polymesh-types/types';

import {
  configureDividendDistribution,
  ConfigureDividendDistributionParams,
  Context,
  DividendDistribution,
  Namespace,
  SecurityToken,
} from '~/internal';
import { CorporateActionParams, DistributionWithDetails } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import {
  balanceToBigNumber,
  boolToBoolean,
  corporateActionIdentifierToCaId,
  distributionToDividendDistributionParams,
  meshCorporateActionToCorporateActionParams,
  stringToTicker,
  u32ToBigNumber,
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
      args => [configureDividendDistribution, { ticker, ...args }],
      context
    );
  }

  /**
   * Retrieve all Dividend Distributions associated to this Security Token
   */
  public async get(): Promise<DistributionWithDetails[]> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const corporateActions = await query.corporateAction.corporateActions.entries(rawTicker);
    const unpredictableCas = corporateActions.filter(
      ([, action]) => action.unwrap().kind.isUnpredictableBenefit
    );
    const distributionsMultiParams: CAId[] = [];
    const corporateActionParams: CorporateActionParams[] = [];
    const corporateActionIds: BigNumber[] = [];

    unpredictableCas.forEach(
      ([
        {
          args: [, rawId],
        },
        corporateAction,
      ]) => {
        const localId = u32ToBigNumber(rawId);
        corporateActionIds.push(localId);
        distributionsMultiParams.push(
          corporateActionIdentifierToCaId({ ticker, localId }, context)
        );
        const action = corporateAction.unwrap();
        corporateActionParams.push(meshCorporateActionToCorporateActionParams(action, context));
      }
    );

    const distributions = await query.capitalDistribution.distributions.multi<Distribution>(
      distributionsMultiParams
    );

    return distributions.map((distribution, index) => {
      const { reclaimed, remaining } = distribution;
      return {
        distribution: new DividendDistribution(
          {
            ticker,
            id: corporateActionIds[index],
            ...corporateActionParams[index],
            ...distributionToDividendDistributionParams(distribution, context),
          },
          context
        ),
        details: {
          remainingFunds: balanceToBigNumber(remaining),
          fundsReclaimed: boolToBoolean(reclaimed),
        },
      };
    });
  }
}
