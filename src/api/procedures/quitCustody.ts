import { assertPortfolioExists } from '~/api/procedures/utils';
import { DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, PortfolioId, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { portfolioIdToMeshPortfolioId, portfolioLikeToPortfolioId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  portfolio: DefaultPortfolio | NumberedPortfolio;
};

export interface Storage {
  portfolioId: PortfolioId;
}

/**
 * @hidden
 */
export async function prepareQuitCustody(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { portfolioId },
    context,
  } = this;

  const { portfolio } = args;

  const isOwnedBy = await portfolio.isOwnedBy();

  if (isOwnedBy) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Portfolio owner cannot quit custody',
    });
  }

  await assertPortfolioExists(portfolioId, context);

  const rawPortfolioId = portfolioIdToMeshPortfolioId(portfolioId, context);

  this.addTransaction({
    transaction: tx.portfolio.quitPortfolioCustody,
    args: [rawPortfolioId],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { portfolio }: Params
): ProcedureAuthorization {
  const {
    storage: { portfolioId },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.portfolio.QuitPortfolioCustody],
      assets: [],
      portfolios: [portfolio],
    },
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { portfolio }: Params
): Promise<Storage> {
  return {
    portfolioId: portfolioLikeToPortfolioId(portfolio),
  };
}

/**
 * @hidden
 */
export const quitCustody = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareQuitCustody, getAuthorization, prepareStorage);
