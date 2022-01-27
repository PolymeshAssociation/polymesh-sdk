import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { numberToBalance, stringToTicker } from '~/utils/conversion';

export interface IssueTokensParams {
  amount: BigNumber;
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<IssueTokensParams, SecurityToken>,
  args: IssueTokensParams
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;
  const { ticker, amount } = args;

  const securityToken = new SecurityToken({ ticker }, context);

  const { isDivisible, totalSupply } = await securityToken.details();

  const supplyAfterMint = amount.plus(totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_BALANCE,
      },
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = numberToBalance(amount, context, isDivisible);

  this.addTransaction({
    transaction: asset.issue,
    args: [rawTicker, rawValue],
  });

  return securityToken;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueTokensParams, SecurityToken>,
  { ticker }: IssueTokensParams
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.asset.Issue],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const issueTokens = (): Procedure<IssueTokensParams, SecurityToken> =>
  new Procedure(prepareIssueTokens, getAuthorization);
