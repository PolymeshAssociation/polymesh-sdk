import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, IssuanceData, Role, RoleType } from '~/types';
import { numberToBalance, stringToIdentityId, stringToTicker } from '~/utils';

export interface SetIssuanceDataParams {
  issuances: IssuanceData[];
}

export type Params = SetIssuanceDataParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetIssuanceData(
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
  const { ticker, issuances } = args;

  const investors = issuances.map(issuance => stringToIdentityId(issuance.did, context));
  const values = issuances.map(issuance => new BigNumber(issuance.balance));

  if (investors.length !== values.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You must set the same number of investors as values',
    });
  }

  const securityToken = new SecurityToken({ ticker }, context);
  const { isDivisible, totalSupply } = await securityToken.details();

  values.forEach(value => {
    if (isDivisible) {
      if (value.decimalPlaces() > 6) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'At most one balance exceeds the six decimals limit',
        });
      }
    } else {
      if (value.decimalPlaces()) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'At most one balance has decimals in its format',
        });
      }
    }
  });

  const mintSupply = values.reduce((acc, next) => {
    return acc.plus(next);
  }, new BigNumber(0));

  const limitTotalSupply = new BigNumber(Math.pow(10, 12));

  if (totalSupply.plus(mintSupply).isGreaterThan(limitTotalSupply)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `The total supply for "${ticker}" cannot be bigger than ${limitTotalSupply.toString()}`,
    });
  }

  // TODO: check canTransfer method

  const rawTicker = stringToTicker(ticker, context);
  const balances = issuances.map(issuance => numberToBalance(issuance.balance, context));

  this.addTransaction(asset.batchIssue, {}, rawTicker, investors, balances);

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const setIssuanceData = new Procedure(prepareSetIssuanceData, getRequiredRoles);
