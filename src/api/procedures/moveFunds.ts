import BigNumber from 'bignumber.js';

import { assertPortfolioExists } from '~/api/procedures/utils';
import { DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import {
  ErrorCode,
  MoveFundsParams,
  PortfolioId,
  PortfolioMovement,
  RoleType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  portfolioMovementToMovePortfolioItem,
} from '~/utils/conversion';
import { asTicker } from '~/utils/internal';

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

  const fromPortfolioId = portfolioLikeToPortfolioId(fromPortfolio);
  const toPortfolioId = portfolioLikeToPortfolioId(toPortfolio);

  await Promise.all([
    assertPortfolioExists(fromPortfolioId, context),
    assertPortfolioExists(toPortfolioId, context),
  ]);

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

  const portfolioBalances = await fromPortfolio.getAssetBalances({
    assets: items.map(({ asset }) => asset),
  });
  const balanceExceeded: (PortfolioMovement & { free: BigNumber })[] = [];

  portfolioBalances.forEach(({ asset: { ticker }, free }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transferItem = items.find(({ asset: itemAsset }) => asTicker(itemAsset) === ticker)!;

    if (transferItem.amount.gt(free)) {
      balanceExceeded.push({ ...transferItem, free });
    }
  });

  if (balanceExceeded.length) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
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

  this.addTransaction({
    transaction: portfolio.movePortfolioFunds,
    args: [rawFrom, rawTo, rawMovePortfolioItems],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { from, to }: Params
): ProcedureAuthorization {
  const { context } = this;
  const {
    owner: { did },
  } = from;
  let portfolioId: PortfolioId = { did };

  if (from instanceof NumberedPortfolio) {
    portfolioId = { ...portfolioId, number: from.id };
  }

  let toPortfolio;
  if (!to) {
    toPortfolio = new DefaultPortfolio({ did }, context);
  } else if (to instanceof BigNumber) {
    toPortfolio = new NumberedPortfolio({ did, id: to }, context);
  } else {
    toPortfolio = to;
  }

  return {
    permissions: {
      transactions: [TxTags.portfolio.MovePortfolioFunds],
      assets: [],
      portfolios: [from, toPortfolio],
    },
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
  };
}

/**
 * @hidden
 */
export const moveFunds = (): Procedure<Params, void> =>
  new Procedure(prepareMoveFunds, getAuthorization);
