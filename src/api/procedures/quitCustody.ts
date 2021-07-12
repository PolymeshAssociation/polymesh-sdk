import { assertPortfolioExists } from '~/api/procedures/utils';
import { DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import { portfolioIdToMeshPortfolioId, portfolioLikeToPortfolioId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  portfolio: DefaultPortfolio | NumberedPortfolio;
};

/**
 * @hidden
 */
export async function prepareQuitCustody(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { portfolio } = args;

  const {
    owner: { did },
  } = portfolio;

  const { did: currentDid } = await context.getCurrentIdentity();

  if (currentDid === did) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio Custodian is the Current Identity',
    });
  }

  const portfolioId = portfolioLikeToPortfolioId(portfolio);

  await assertPortfolioExists(portfolioId, context);

  const rawPortfolioId = portfolioIdToMeshPortfolioId(portfolioId, context);

  this.addTransaction(tx.portfolio.quitPortfolioCustody, {}, rawPortfolioId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { portfolio }: Params
): ProcedureAuthorization {
  const {
    owner: { did },
  } = portfolio;
  let portfolioId: PortfolioId = { did };

  if (portfolio instanceof NumberedPortfolio) {
    portfolioId = { ...portfolioId, number: portfolio.id };
  }

  return {
    permissions: {
      transactions: [TxTags.portfolio.QuitPortfolioCustody],
      tokens: [],
      portfolios: [portfolio],
    },
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
  };
}

/**
 * @hidden
 */
export const quitCustody = (): Procedure<Params, void> =>
  new Procedure(prepareQuitCustody, getAuthorization);
