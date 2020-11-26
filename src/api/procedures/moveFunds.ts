import BigNumber from 'bignumber.js';

import { DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, PortfolioMovement, Role, RoleType } from '~/types';
import { PortfolioId } from '~/types/internal';
import {
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  portfolioMovementToMovePortfolioItem,
  portfolioToPortfolioId,
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

  const fromPortfolioId = portfolioToPortfolioId(fromPortfolio);

  const toPortfolioId = await portfolioLikeToPortfolioId(toPortfolio, context);

  if (fromDid !== toDid) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Both portfolios should have the same owner',
    });
  }

  if (fromPortfolioId.number === toPortfolioId.number) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Origin and destination should be different Portfolios',
    });
  }

  const portfolioBalances = await fromPortfolio.getTokenBalances({
    tokens: items.map(({ token }) => token),
  });
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
export function getRequiredRoles({ from }: Params): Role[] {
  let portfolioId: PortfolioId = { did: from.owner.did };

  if (from instanceof NumberedPortfolio) {
    portfolioId = { ...portfolioId, number: from.id };
  }
  return [{ type: RoleType.PortfolioCustodian, portfolioId }];
}

/**
 * @hidden
 */
export const moveFunds = new Procedure(prepareMoveFunds, getRequiredRoles);
