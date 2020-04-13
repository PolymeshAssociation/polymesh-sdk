import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, IssuanceData, Role, RoleType } from '~/types';
import { stringToTicker } from '~/utils';

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
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, issuances } = args;

  const rawTicker = stringToTicker(ticker, context);

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const setIssuanceData = new Procedure(prepareSetIssuanceData, getRequiredRoles);
