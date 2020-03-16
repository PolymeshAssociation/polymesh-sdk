import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { stringToTicker } from '~/utils';

export type ModifyTokenParams =
  | { makeDivisible?: boolean; name: string }
  | { makeDivisible: boolean; name?: string };

export type ModifyTokenInternalParams = { ticker: string } & ModifyTokenParams;

/**
 * @hidden
 */
export async function prepareModifyToken(
  this: Procedure<ModifyTokenInternalParams, SecurityToken>,
  args: ModifyTokenInternalParams
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, makeDivisible } = args;

  if (!ticker && !makeDivisible) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You should set at least one argument to perform this action',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const { isDivisible, owner } = await securityToken.details();

  if (owner.did !== context.currentIdentity?.did) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You must be the owner of the token to modify any property of it',
    });
  }

  if (makeDivisible) {
    if (isDivisible) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token is already divisible',
      });
    }

    this.addTransaction(tx.asset.makeDivisible, {}, rawTicker);
  } else {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You can not make the token indivisible',
    });
  }

  return securityToken;
}

export const modifyToken = new Procedure(prepareModifyToken);
