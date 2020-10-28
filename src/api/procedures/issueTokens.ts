import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { numberToBalance, stringToTicker } from '~/utils';
import { MAX_TOKEN_AMOUNT } from '~/utils/constants';

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

  if (supplyAfterMint.isGreaterThan(MAX_TOKEN_AMOUNT)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_TOKEN_AMOUNT,
      },
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = numberToBalance(amount, context, isDivisible);

  this.addTransaction(asset.issue, {}, rawTicker, rawValue);

  return securityToken;
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: IssueTokensParams): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const issueTokens = new Procedure(prepareIssueTokens, getRequiredRoles);
