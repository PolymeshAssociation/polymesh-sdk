import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import {
  fundingRoundNameToString,
  stringToFundingRoundName,
  stringToTicker,
  stringToTokenName,
} from '~/utils';

export type ModifyTokenParams =
  | { makeDivisible?: true; name: string; fundingRound?: string }
  | { makeDivisible: true; name?: string; fundingRound?: string }
  | { makeDivisible?: true; name?: string; fundingRound: string };

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
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, makeDivisible, name: newName, fundingRound: newFundingRound } = args;

  if (makeDivisible === undefined && newName === undefined && newFundingRound === undefined) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const [{ isDivisible, owner, name }, fundingRound] = await Promise.all([
    securityToken.details(),
    query.asset.fundingRound(ticker),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (owner.did !== context.getCurrentIdentity().did) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You must be the owner of the Security Token to modify any of its properties',
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
  } else if (makeDivisible === false) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot make the token indivisible',
    });
  }

  if (newName) {
    if (newName === name) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New name is the same as current name',
      });
    }

    this.addTransaction(tx.asset.renameToken, {}, rawTicker, stringToTokenName(newName, context));
  }

  if (newFundingRound) {
    if (newFundingRound === fundingRoundNameToString(fundingRound)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New funding round name is the same as current funding round',
      });
    }

    this.addTransaction(
      tx.asset.setFundingRound,
      {},
      rawTicker,
      stringToFundingRoundName(newFundingRound, context)
    );
  }

  return securityToken;
}

export const modifyToken = new Procedure(prepareModifyToken);
