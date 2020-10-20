import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { PortfolioNumber } from '~/polkadot';
import { stringToIdentityId, u64ToBigNumber } from '~/utils';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * Retrieve all the portfolios for the current identity
   */
  public async getPortfolios(): Promise<[DefaultPortfolio, ...NumberedPortfolio[]]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const { did } = await context.getCurrentIdentity();
    const identityId = stringToIdentityId(did, context);
    const rawPortfolios = await portfolio.portfolios.entries(identityId);

    const numberedPortfolios: [DefaultPortfolio, ...NumberedPortfolio[]] = [
      new DefaultPortfolio({ did }, context),
    ];
    rawPortfolios.forEach(([key]) => {
      numberedPortfolios.push(
        new NumberedPortfolio({ id: u64ToBigNumber(key.args[1] as PortfolioNumber), did }, context)
      );
    });

    return numberedPortfolios;
  }
}
