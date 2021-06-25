import BigNumber from 'bignumber.js';

import { DefaultPortfolio, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToBalance, stringToTicker } from '~/utils/conversion';

export interface RedeemTokenParams {
  amount: BigNumber;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & RedeemTokenParams;

/**
 * @hidden
 */
export async function prepareRedeemToken(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { ticker, amount } = args;

  const securityToken = new SecurityToken({ ticker }, context);
  const rawTicker = stringToTicker(ticker, context);

  const { primaryIssuanceAgents, isDivisible } = await securityToken.details();

  if (primaryIssuanceAgents.length !== 1) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'There is no a default Primary Issuance Agent for the given asset',
    });
  }

  const defaultPortfolio = new DefaultPortfolio({ did: primaryIssuanceAgents[0].did }, context);

  const portfolioBalance = await defaultPortfolio.getTokenBalances({ tokens: [ticker] });

  const { free } = portfolioBalance[0];

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient free balance',
      data: {
        free,
      },
    });
  }

  if (amount.decimalPlaces() && !isDivisible) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Security Token must be divisible',
    });
  }

  this.addTransaction(tx.asset.redeem, {}, rawTicker, numberToBalance(amount, context));
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): Promise<ProcedureAuthorization> {
  const { context } = this;

  const securityToken = new SecurityToken({ ticker }, context);
  const { primaryIssuanceAgents } = await securityToken.details();

  if (primaryIssuanceAgents.length !== 1) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'There is no a default Primary Issuance Agent for the given asset',
    });
  }

  const did = primaryIssuanceAgents[0].did;

  return {
    identityRoles: [{ type: RoleType.TokenPia, ticker }],
    signerPermissions: {
      transactions: [TxTags.asset.Redeem],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export const redeemToken = (): Procedure<Params, void> =>
  new Procedure(prepareRedeemToken, getAuthorization);
