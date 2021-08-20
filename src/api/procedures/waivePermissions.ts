import { assertPortfolioExists } from '~/api/procedures/utils';
import { DefaultPortfolio, Identity, NumberedPortfolio, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import { portfolioIdToMeshPortfolioId, portfolioLikeToPortfolioId, stringToTicker } from '~/utils/conversion';
import { getTicker } from '~/utils/internal';

/**
 * @hidden
 */
export interface WaivePermissionsParams {
  token: string | SecurityToken;
}

export type Params = WaivePermissionsParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export async function prepareWaivePermissions(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { identity, token } = args;

  const ticker = getTicker(token);
  
  // 

  const rawTicker = stringToTicker(ticker, context);

  // const isOwnedBy = await portfolio.isOwnedBy();

  // if (isOwnedBy) {
  //   throw new PolymeshError({
  //     code: ErrorCode.ValidationError,
  //     message: 'The Portfolio owner cannot quit custody',
  //   });
  // }

  // await assertPortfolioExists(portfolioId, context);

  // const rawPortfolioId = portfolioIdToMeshPortfolioId(portfolioId, context);

  // this.addTransaction(tx.portfolio.quitPortfolioCustody, {}, rawPortfolioId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.externalAgents.Abdicate],
      tokens: [],
      portfolios: [],
    },
    roles: [{ type: RoleType.Identity, did }],
  };
}

/**
 * @hidden
 */
export const waivePermissions = (): Procedure<Params, void> =>
  new Procedure(prepareWaivePermissions, getAuthorization);
