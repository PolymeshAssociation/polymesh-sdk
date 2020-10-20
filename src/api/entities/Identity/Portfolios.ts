import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { createPortfolio } from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { ErrorCode } from '~/types';
import { numberToU64, stringToIdentityId } from '~/utils';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * Retrieve a numbered Portfolio or the default Portfolio if Portfolio ID is not passed
   *
   * @param args.porfolioId - optional, defaults to the default portfolio
   */
  public async getPortfolio(args?: {
    portfolioId: BigNumber;
  }): Promise<DefaultPortfolio | NumberedPortfolio> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      parent: { did },
    } = this;

    let portfolioId;
    if (args) {
      portfolioId = args.portfolioId;
    }

    if (!portfolioId) {
      return new DefaultPortfolio({ did }, context);
    }

    const identityId = stringToIdentityId(did, context);
    const rawPortfolioNumber = numberToU64(portfolioId, context);
    const rawPortfolioName = await portfolio.portfolios(identityId, rawPortfolioNumber);

    if (rawPortfolioName.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Portfolio doesn't exist",
      });
    }

    return new NumberedPortfolio({ id: portfolioId, did }, context);
  }

  /**
   * Create a new Portfolio for the Current Identity
   */
  public createPortfolio(args: { name: string }): Promise<TransactionQueue<NumberedPortfolio>> {
    return createPortfolio.prepare(args, this.context);
  }
}
