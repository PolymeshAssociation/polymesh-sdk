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
  const isOwned = await numberedPortfolio.isOwned();

  if (!isOwned) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You are not the owner of this Portfolio',
    });
  }

  // TODO @shuffledex: check portfolio balance before remove

  // this.addTransaction(portfolio.deletePortfolio, {}, rawPortfolioNumber);
}

/**
 * @hidden
 */
export const deletePortfolio = new Procedure(prepareDeletePortfolio);
