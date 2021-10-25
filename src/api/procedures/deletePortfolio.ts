import BigNumber from 'bignumber.js';

import { NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, portfolioLikeToPortfolio } from '~/utils/conversion';

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
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { did, id } = args;

  const numberedPortfolio = new NumberedPortfolio({ did, id }, context);
  const rawPortfolioNumber = numberToU64(id, context);

  const [exists, portfolioBalances] = await Promise.all([
    numberedPortfolio.exists(),
    numberedPortfolio.getTokenBalances(),
  ]);

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Portfolio doesn't exist",
    });
  }

  if (portfolioBalances.some(({ total }) => total.gt(0))) {
    throw new PolymeshError({
      code: ErrorCode.EntityInUse,
      message: 'Only empty Portfolios can be deleted',
    });
  }

  this.addTransaction(portfolio.deletePortfolio, {}, rawPortfolioNumber);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<DeletePortfolioParams>,
  { did, id }: DeletePortfolioParams
): ProcedureAuthorization {
  const { context } = this;
  const portfolioId = { did, number: id };
  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      transactions: [TxTags.portfolio.DeletePortfolio],
      portfolios: [portfolioLikeToPortfolio({ identity: did, id }, context)],
      tokens: [],
    },
  };
}

/**
 * @hidden
 */
export const deletePortfolio = (): Procedure<DeletePortfolioParams> =>
  new Procedure(prepareDeletePortfolio, getAuthorization);
