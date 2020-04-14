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
        query,
        tx: { asset },
      },
    },
    context,
  } = this;
  const { ticker, issuances } = args;

  const investors = issuances.map(issuance => stringToIdentityId(issuance.did, context));
  const values = issuances.map(issuance => numberToBalance(issuance.balance, context));

  if (investors.length !== values.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You must set the same number of investors as values',
    });
  }

  const securityToken = new SecurityToken({ ticker }, context);
  const { isDivisible, totalSupply } = await securityToken.details();
  // check granularity

  debugger;

  const rawTicker = stringToTicker(ticker, context);

  // this.addTransaction(asset.batchIssue, {}, rawTicker, [], []);

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const setIssuanceData = new Procedure(prepareSetIssuanceData, getRequiredRoles);
