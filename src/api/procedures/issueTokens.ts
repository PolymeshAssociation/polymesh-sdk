import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { numberToBalance, stringToTicker } from '~/utils';
import { MAX_DECIMALS, MAX_TOKEN_AMOUNT } from '~/utils/constants';

/**
 * @hidden
 */
export type Params = { amount: BigNumber; ticker: string };

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<Params, SecurityToken>,
  args: Params
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

  const { isDivisible, totalSupply, primaryIssuanceAgent } = await securityToken.details();

  if (isDivisible) {
    if (amount.decimalPlaces() > MAX_DECIMALS) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Issuance amount cannot have more than ${MAX_DECIMALS} decimals`,
      });
    }
  } else {
    if (amount.decimalPlaces()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Cannot issue decimal amount of an indivisible token',
      });
    }
  }

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

  if (!primaryIssuanceAgent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You should set a primary issuance agent to issue tokens',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = numberToBalance(amount, context);

  this.addTransaction(asset.issue, {}, rawTicker, rawValue);

  return securityToken;
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const issueTokens = new Procedure(prepareIssueTokens, getRequiredRoles);
