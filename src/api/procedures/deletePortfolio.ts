import BigNumber from 'bignumber.js';

import { NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Role, RoleType } from '~/types';
import { numberToU64, stringToIdentityId } from '~/utils/conversion';

export interface DeletePortfolioParams {
  did: string;
  id: BigNumber;
}

/**
 * @hidden
 */
export async function prepareDeletePortfolio(
  this: Procedure<DeletePortfolioParams>,
  args: DeletePortfolioParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        query: { portfolio: queryPortfolio },
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { did, id } = args;

  const numberedPortfolio = new NumberedPortfolio({ did, id }, context);
  const identityId = stringToIdentityId(did, context);
  const rawPortfolioNumber = numberToU64(id, context);

  const [rawPortfolioName, portfolioBalances] = await Promise.all([
    queryPortfolio.portfolios(identityId, rawPortfolioNumber),
    numberedPortfolio.getTokenBalances(),
  ]);

  if (rawPortfolioName.isEmpty) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Portfolio doesn't exist",
    });
  }

  if (portfolioBalances.some(({ total }) => total.gt(0))) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot delete a Portfolio that contains any assets',
    });
  }

  this.addTransaction(portfolio.deletePortfolio, {}, rawPortfolioNumber);
}

/**
 * @hidden
 */
export function getRequiredRoles({ did, id }: DeletePortfolioParams): Role[] {
  const portfolioId = { did, number: id };
  return [{ type: RoleType.PortfolioCustodian, portfolioId }];
}

/**
 * @hidden
 */
export const deletePortfolio = new Procedure(prepareDeletePortfolio, getRequiredRoles);
