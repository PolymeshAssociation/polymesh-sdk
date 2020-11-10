import BigNumber from 'bignumber.js';

import { NumberedPortfolio } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { numberToU64, stringToIdentityId } from '~/utils';

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

  const [isOwned, rawPortfolioName, portfolioBalances] = await Promise.all([
    numberedPortfolio.isOwnedBy(),
    queryPortfolio.portfolios(identityId, rawPortfolioNumber),
    numberedPortfolio.getTokenBalances(),
  ]);

  if (rawPortfolioName.isEmpty) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Portfolio doesn't exist",
    });
  }

  if (!isOwned) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You are not the owner of this Portfolio',
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
export const deletePortfolio = new Procedure(prepareDeletePortfolio);
