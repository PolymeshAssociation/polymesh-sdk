import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';
import { bytesToString, numberToU64, stringToIdentityId } from '~/utils';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * Retrieve a numbered Portfolio or the default Portfolio if Portfolio Id is not passed
   *
   * @param args.porfolioId - optional, default to the default portfolio
   */
  public async getPortfolio(porfolioId?: BigNumber): Promise<DefaultPortfolio | NumberedPortfolio> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const { did } = await context.getCurrentIdentity();

    if (!porfolioId) {
      return new DefaultPortfolio({ did }, context);
    }

    const identityId = stringToIdentityId(did, context);
    const rawPortolioNumber = numberToU64(porfolioId, context);
    const rawPortfolioName = await portfolio.portfolios(identityId, rawPortolioNumber);

    if (!bytesToString(rawPortfolioName)) {
      throw new PolymeshError({
        code: ErrorCode.InvalidUuid,
        message: "The Portfolio doesn't exist",
      });
    }

    return new NumberedPortfolio({ id: porfolioId, did }, context);
  }
}
