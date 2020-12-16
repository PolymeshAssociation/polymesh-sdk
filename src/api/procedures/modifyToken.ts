import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToAssetName, stringToFundingRoundName, stringToTicker } from '~/utils/conversion';

export type ModifyTokenParams =
  | { makeDivisible?: true; name: string; fundingRound?: string }
  | { makeDivisible: true; name?: string; fundingRound?: string }
  | { makeDivisible?: true; name?: string; fundingRound: string };

/**
 * @hidden
 */
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
  const { ticker, makeDivisible, name: newName, fundingRound: newFundingRound } = args;

  if (makeDivisible === undefined && newName === undefined && newFundingRound === undefined) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  // TODO: queryMulti
  const [{ isDivisible, name }, fundingRound] = await Promise.all([
    securityToken.details(),
    securityToken.currentFundingRound(),
  ]);

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

    this.addTransaction(tx.asset.renameAsset, {}, rawTicker, stringToAssetName(newName, context));
  }

  if (newFundingRound) {
    if (newFundingRound === fundingRound) {
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

/**
 * @hidden
 */
/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, makeDivisible, name, fundingRound }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (makeDivisible !== undefined) {
    transactions.push(TxTags.asset.MakeDivisible);
  }

  if (name) {
    transactions.push(TxTags.asset.RenameAsset);
  }

  if (fundingRound) {
    transactions.push(TxTags.asset.SetFundingRound);
  }

  return {
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions,
      portfolios: [],
      tokens: [new SecurityToken({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyToken = new Procedure(prepareModifyToken, getAuthorization);
