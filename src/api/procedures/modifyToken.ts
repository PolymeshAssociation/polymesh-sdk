import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { stringToTicker } from '~/utils';

export type ModifyTokenParams =
  | { makeDivisible?: true; name: string }
  | { makeDivisible: true; name?: string };

export type Params = { ticker: string } & ModifyTokenParams;

/**
 * @hidden
 */
export async function prepareModifyToken(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, makeDivisible } = args;

  if (makeDivisible === undefined) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const { isDivisible } = await securityToken.details();

  if (makeDivisible) {
    if (isDivisible) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token is already divisible',
      });
    }

    this.addTransaction(tx.asset.makeDivisible, {}, rawTicker);
  } else {
    /* istanbul ignore else: it does not apply to our business logic. this line will be remove in future task */
    if (makeDivisible === false) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'You cannot make the token indivisible',
      });
    }
  }

  return securityToken;
}

/**
 * @hidden
 */
export function getRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const modifyToken = new Procedure(prepareModifyToken, getRoles);
