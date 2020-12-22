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

  const { owner, primaryIssuanceAgent, isDivisible } = await securityToken.details();

  const defaultPortfolio = new DefaultPortfolio(
    { did: primaryIssuanceAgent ? primaryIssuanceAgent.did : owner.did },
    context
  );

  const portfolioBalance = await defaultPortfolio.getTokenBalances({ tokens: [ticker] });

  const { total, locked } = portfolioBalance[0];

  if (total.minus(locked).lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient balance',
    });
  }

  if (amount.mod(1) && !isDivisible) {
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
  const { owner, primaryIssuanceAgent } = await securityToken.details();

  return {
    identityRoles: [{ type: RoleType.TokenOwnerOrPia, ticker }],
    signerPermissions: {
      transactions: [TxTags.asset.Redeem],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [
        new DefaultPortfolio(
          { did: primaryIssuanceAgent ? primaryIssuanceAgent.did : owner.did },
          context
        ),
      ],
    },
  };
}

/**
 * @hidden
 */
export const redeemToken = new Procedure(prepareRedeemToken, getAuthorization);
