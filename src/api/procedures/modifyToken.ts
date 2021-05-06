import { differenceWith, isEqual } from 'lodash';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TokenIdentifier, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  stringToAssetName,
  stringToFundingRoundName,
  stringToTicker,
  tokenIdentifierToAssetIdentifier,
} from '~/utils/conversion';

export type ModifyTokenParams =
  | { makeDivisible?: true; name: string; fundingRound?: string; identifiers?: TokenIdentifier[] }
  | { makeDivisible: true; name?: string; fundingRound?: string; identifiers?: TokenIdentifier[] }
  | { makeDivisible?: true; name?: string; fundingRound: string; identifiers?: TokenIdentifier[] }
  | { makeDivisible?: true; name?: string; fundingRound?: string; identifiers: TokenIdentifier[] };

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
  const {
    ticker,
    makeDivisible,
    name: newName,
    fundingRound: newFundingRound,
    identifiers: newIdentifiers,
  } = args;

  const noArguments =
    makeDivisible === undefined &&
    newName === undefined &&
    newFundingRound === undefined &&
    newIdentifiers === undefined;

  if (noArguments) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const [{ isDivisible, name }, fundingRound, identifiers] = await Promise.all([
    securityToken.details(),
    securityToken.currentFundingRound(),
    securityToken.getIdentifiers(),
  ]);

  if (makeDivisible) {
    if (isDivisible) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token is already divisible',
      });
    }

    this.addTransaction(tx.asset.makeDivisible, {}, rawTicker);
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

  if (newIdentifiers) {
    const identifiersAreEqual =
      !differenceWith(identifiers, newIdentifiers, isEqual).length &&
      identifiers.length === newIdentifiers.length;

    if (identifiersAreEqual) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New identifiers are the same as current identifiers',
      });
    }

    this.addTransaction(
      tx.asset.updateIdentifiers,
      {},
      rawTicker,
      newIdentifiers.map(newIdentifier => tokenIdentifierToAssetIdentifier(newIdentifier, context))
    );
  }

  return securityToken;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, makeDivisible, name, fundingRound, identifiers }: Params
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

  if (identifiers) {
    transactions.push(TxTags.asset.UpdateIdentifiers);
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
export const modifyToken = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareModifyToken, getAuthorization);
