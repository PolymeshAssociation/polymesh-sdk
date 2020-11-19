import BigNumber from 'bignumber.js';

import { DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, PortfolioMovement } from '~/types';
import {
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  portfolioMovementToMovePortfolioItem,
} from '~/utils/conversion';

export interface MoveFundsParams {
  to?: BigNumber | DefaultPortfolio | NumberedPortfolio;
  items: PortfolioMovement[];
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

  const { from: fromPortfolio, to, items } = args;

  const {
    owner: { did: fromDid },
  } = fromPortfolio;

  let toPortfolio;
  if (!to) {
    toPortfolio = new DefaultPortfolio({ did: fromDid }, context);
  } else if (to instanceof BigNumber) {
    toPortfolio = new NumberedPortfolio({ did: fromDid, id: to }, context);
  } else {
    toPortfolio = to;
  }

  const {
    owner: { did: toDid },
  } = toPortfolio;

  const [fromPortfolioId, toPortfolioId, currentIdentity] = await Promise.all([
    portfolioLikeToPortfolioId(fromPortfolio, context),
    portfolioLikeToPortfolioId(toPortfolio, context),
    context.getCurrentIdentity(),
  ]);

  if (fromDid !== toDid) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Both portfolios should have the same owner',
    });
  }

  if (currentIdentity.did !== fromDid) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The current identity should be the owner of the origin portfolio',
    });
  }

  if (fromPortfolioId.number === toPortfolioId.number) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Origin and destination should be different Portfolios',
    });
  }

  const [fromIsOwned, toIsOwned, portfolioBalances] = await Promise.all([
    fromPortfolio.isOwnedBy(),
    toPortfolio.isOwnedBy(),
    fromPortfolio.getTokenBalances({
      tokens: items.map(({ token }) => token),
    }),
  ]);

  if (!fromIsOwned || !toIsOwned) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You must be the owner of both Portfolios',
    });
  }

  const balanceExceeded: (PortfolioMovement & { free: BigNumber })[] = [];

  portfolioBalances.forEach(({ token: { ticker }, total, locked }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transferItem = items.find(
      ({ token: t }) => (typeof t === 'string' ? t : t.ticker) === ticker
    )!;

    const free = total.minus(locked);
    if (transferItem.amount.gt(free)) {
      balanceExceeded.push({ ...transferItem, free });
    }
  });

  if (balanceExceeded.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "Some of the amounts being transferred exceed the Portfolio's balance",
      data: {
        balanceExceeded,
      },
    });
  }

  const rawFrom = portfolioIdToMeshPortfolioId(fromPortfolioId, context);
  const rawTo = portfolioIdToMeshPortfolioId(toPortfolioId, context);

  const rawMovePortfolioItems = items.map(item =>
    portfolioMovementToMovePortfolioItem(item, context)
  );

  this.addTransaction(portfolio.movePortfolioFunds, {}, rawFrom, rawTo, rawMovePortfolioItems);
}

/**
 * @hidden
 */
export const moveFunds = new Procedure(prepareMoveFunds);
