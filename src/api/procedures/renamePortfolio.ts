import BigNumber from 'bignumber.js';

import { NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Role, RoleType } from '~/types';
import { numberToU64, stringToIdentityId, stringToText, textToString } from '~/utils/conversion';

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

  const identityId = stringToIdentityId(did, context);
  const rawPortfolioNumber = numberToU64(id, context);

  const [rawPortfolioName, rawPortfolios] = await Promise.all([
    queryPortfolio.portfolios(identityId, rawPortfolioNumber),
    queryPortfolio.portfolios.entries(identityId),
  ]);

  if (textToString(rawPortfolioName) === newName) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New name is the same as current name',
    });
  }

  const portfolioNames = rawPortfolios.map(([, name]) => textToString(name));

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
    stringToText(newName, context)
  );

  return new NumberedPortfolio({ did, id }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ did, id }: Params): Role[] {
  const portfolioId = { did, number: id };
  return [{ type: RoleType.PortfolioCustodian, portfolioId }];
}

/**
 * @hidden
 */
export const renamePortfolio = new Procedure(prepareRenamePortfolio, getRequiredRoles);
