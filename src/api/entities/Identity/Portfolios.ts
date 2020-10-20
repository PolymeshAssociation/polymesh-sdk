import { DefaultPortfolio, Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { PortfolioNumber } from '~/polkadot';
import { stringToIdentityId, u64ToBigNumber } from '~/utils';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * Retrieve all the Portfolios for the Identity
   */
  public async getPortfolios(): Promise<[DefaultPortfolio, ...NumberedPortfolio[]]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      parent: { did },
    } = this;

    const identityId = stringToIdentityId(did, context);
    const rawPortfolios = await portfolio.portfolios.entries(identityId);

    const portfolios: [DefaultPortfolio, ...NumberedPortfolio[]] = [
      new DefaultPortfolio({ did }, context),
    ];
    rawPortfolios.forEach(([key]) => {
      portfolios.push(
        new NumberedPortfolio({ id: u64ToBigNumber(key.args[1] as PortfolioNumber), did }, context)
      );
    });

    return portfolios;
  }
}
