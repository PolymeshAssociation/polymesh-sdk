import BigNumber from 'bignumber.js';

import { NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  numberToU64,
  portfolioNameToNumber,
  stringToIdentityId,
  stringToText,
} from '~/utils/conversion';

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
        query,
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { did, id, name: newName } = args;

  const identityId = stringToIdentityId(did, context);

  const rawNewName = stringToText(newName, context);

  const existingPortfolioNumber = await portfolioNameToNumber(identityId, rawNewName, query);

  if (existingPortfolioNumber) {
    if (id.eq(existingPortfolioNumber)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New name is the same as current name',
      });
    } else {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'A portfolio with that name already exists',
      });
    }
  }

  this.addTransaction(portfolio.renamePortfolio, {}, numberToU64(id, context), rawNewName);

  return new NumberedPortfolio({ did, id }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, NumberedPortfolio>,
  { did, id }: Params
): ProcedureAuthorization {
  const portfolioId = { did, number: id };
  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      transactions: [TxTags.portfolio.RenamePortfolio],
      portfolios: [new NumberedPortfolio({ did, id }, this.context)],
      tokens: [],
    },
  };
}

/**
 * @hidden
 */
export const renamePortfolio = (): Procedure<Params, NumberedPortfolio> =>
  new Procedure(prepareRenamePortfolio, getAuthorization);
