import BigNumber from 'bignumber.js';

import { NumberedPortfolio } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { bytesToString, numberToU64, stringToBytes, stringToIdentityId } from '~/utils';

export interface RenamePortfolioParams {
  name: string;
}

/**
 * @hidden
 */
export type Params = { did: string; id: BigNumber } & RenamePortfolioParams;

/**
 * @hidden
 */
export async function prepareRenamePortfolio(
  this: Procedure<Params, NumberedPortfolio>,
  args: Params
): Promise<NumberedPortfolio> {
  const {
    context: {
      polymeshApi: {
        query: { portfolio: queryPortfolio },
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { did, id, name: newName } = args;

  const numberedPortfolio = new NumberedPortfolio({ did, id }, context);
  const identityId = stringToIdentityId(did, context);
  const rawPortfolioNumber = numberToU64(id, context);

  const [isOwned, rawPortfolioName, rawPortfolios] = await Promise.all([
    numberedPortfolio.isOwned(),
    queryPortfolio.portfolios(identityId, rawPortfolioNumber),
    queryPortfolio.portfolios.entries(identityId),
  ]);

  if (!isOwned) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You are not the owner of this Portfolio',
    });
  }

  if (bytesToString(rawPortfolioName) === newName) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New name is the same as current name',
    });
  }

  const portfolioNames = rawPortfolios.map(([, name]) => bytesToString(name));

  if (portfolioNames.includes(newName)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A portfolio with that name already exists',
    });
  }

  this.addTransaction(
    portfolio.renamePortfolio,
    {},
    rawPortfolioNumber,
    stringToBytes(newName, context)
  );

  return new NumberedPortfolio({ did, id }, context);
}

/**
 * @hidden
 */
export const renamePortfolio = new Procedure(prepareRenamePortfolio);
