import { Balance } from '@polkadot/types/interfaces';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { IdentityId } from '~/polkadot';
import { ErrorCode, IssuanceData, Role, RoleType } from '~/types';
import { numberToBalance, stringToIdentityId, stringToTicker } from '~/utils';
import { MAX_DECIMALS, MAX_TOKEN_AMOUNT } from '~/utils/constants';

export interface IssueTokensParams {
  issuanceData: IssuanceData[];
}
export type Params = IssueTokensParams & {
  ticker: string;
};

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
  const { ticker, issuanceData } = args;

  const securityToken = new SecurityToken({ ticker }, context);

  const { isDivisible, totalSupply } = await securityToken.details();
  const values = issuanceData.map(({ amount }) => amount);

  values.forEach(value => {
    if (isDivisible) {
      if (value.decimalPlaces() > MAX_DECIMALS) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: `Issuance amounts cannot have more than ${MAX_DECIMALS} decimals`,
        });
      }
    } else {
      if (value.decimalPlaces()) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Cannot issue decimal amounts of an indivisible token',
        });
      }
    }
  });

  const supplyAfterMint = values.reduce((acc, next) => {
    return acc.plus(next);
  }, totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_TOKEN_AMOUNT)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the maximum allowed (${MAX_TOKEN_AMOUNT.toFormat()})`,
    });
  }

  // TODO: implement canTransfer

  const rawTicker = stringToTicker(ticker, context);

  const investors: IdentityId[] = [];
  const balances: Balance[] = [];

  issuanceData.forEach(({ did, amount }) => {
    investors.push(stringToIdentityId(did, context));
    balances.push(numberToBalance(amount, context));
  });

  this.addTransaction(asset.batchIssue, {}, rawTicker, investors, balances);

  return securityToken;
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const issueTokens = new Procedure(prepareIssueTokens, getRequiredRoles);
