import { DefaultPortfolio, NumberedPortfolio } from '~/api/entities';
import { PortfolioItem } from '~/api/entities/types';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { portfolioIdToMeshPortfolioId, portfolioItemToMovePortfolioItem } from '~/utils';

export interface MoveFundsParams {
  to: DefaultPortfolio | NumberedPortfolio;
  items: PortfolioItem[];
}

/**
 * @hidden
 */
export type Params = MoveFundsParams & {
  from: DefaultPortfolio | NumberedPortfolio;
};

/**
 * @hidden
 */
export async function prepareMoveFunds(this: Procedure<Params, void>, args: Params): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { from: fromPortfolio, to: toPortfolio, items } = args;

  if (fromPortfolio === toPortfolio) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot move tokens to the same portfolio of origin',
    });
  }

  const [fromIsOwned, toIsOwned, portfolioBalances] = await Promise.all([
    fromPortfolio.isOwned(),
    toPortfolio.isOwned(),
    fromPortfolio.getTokenBalances({
      tokens: items.map(({ token }) => token),
    }),
  ]);

  if (!fromIsOwned || !toIsOwned) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You are not the owner of these Portfolios',
    });
  }

  const balanceExceeded: PortfolioItem[] = [];

  portfolioBalances.forEach(({ token: { ticker }, total }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transferItem = items.find(
      ({ token: t }) => (typeof t === 'string' ? t : t.ticker) === ticker
    )!;

    if (transferItem.amount.gt(total)) {
      balanceExceeded.push(transferItem);
    }
  });

  if (balanceExceeded.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the token amount exceed the actual balance',
      data: {
        balanceExceeded,
      },
    });
  }

  const {
    owner: { did },
  } = fromPortfolio;

  const castedFromPortfolio = fromPortfolio as NumberedPortfolio;

  const fromPortfolioId = castedFromPortfolio.id
    ? { number: castedFromPortfolio.id, did }
    : { did };
  const rawFrom = portfolioIdToMeshPortfolioId(fromPortfolioId, context);

  const castedToPortfolio = toPortfolio as NumberedPortfolio;

  const toPortfolioId = castedToPortfolio.id ? { number: castedToPortfolio.id, did } : { did };
  const rawTo = portfolioIdToMeshPortfolioId(toPortfolioId, context);

  const rawMovePortfolioItem = items.map(item => portfolioItemToMovePortfolioItem(item, context));

  this.addTransaction(portfolio.movePortfolioFunds, {}, rawFrom, rawTo, rawMovePortfolioItem);
}

/**
 * @hidden
 */
export const moveFunds = new Procedure(prepareMoveFunds);
