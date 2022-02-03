import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, SecurityIdentifier, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  securityIdentifierToAssetIdentifier,
  stringToAssetName,
  stringToFundingRoundName,
  stringToTicker,
} from '~/utils/conversion';
import { hasSameElements } from '~/utils/internal';

export type ModifyAssetParams =
  | {
      /**
       * makes an indivisible Asset divisible
       */
      makeDivisible?: true;
      name: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible: true;
      name?: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound?: string;
      identifiers: SecurityIdentifier[];
    };

/**
 * @hidden
 */
export type Params = { ticker: string } & ModifyAssetParams;

/**
 * @hidden
 */
export async function prepareModifyAsset(
  this: Procedure<Params, Asset>,
  args: Params
): Promise<Asset> {
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
      code: ErrorCode.NoDataChange,
      message: 'Nothing to modify',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const asset = new Asset({ ticker }, context);

  const [{ isDivisible, name }, fundingRound, identifiers] = await Promise.all([
    asset.details(),
    asset.currentFundingRound(),
    asset.getIdentifiers(),
  ]);

  if (makeDivisible) {
    if (isDivisible) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already divisible',
      });
    }

    this.addTransaction({
      transaction: tx.asset.makeDivisible,
      args: [rawTicker],
    });
  }

  if (newName) {
    if (newName === name) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New name is the same as current name',
      });
    }

    this.addTransaction({
      transaction: tx.asset.renameAsset,
      args: [rawTicker, stringToAssetName(newName, context)],
    });
  }

  if (newFundingRound) {
    if (newFundingRound === fundingRound) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New funding round name is the same as current funding round',
      });
    }

    this.addTransaction({
      transaction: tx.asset.setFundingRound,
      args: [rawTicker, stringToFundingRoundName(newFundingRound, context)],
    });
  }

  if (newIdentifiers) {
    const identifiersAreEqual = hasSameElements(identifiers, newIdentifiers);

    if (identifiersAreEqual) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New identifiers are the same as current identifiers',
      });
    }

    this.addTransaction({
      transaction: tx.asset.updateIdentifiers,
      args: [
        rawTicker,
        newIdentifiers.map(newIdentifier =>
          securityIdentifierToAssetIdentifier(newIdentifier, context)
        ),
      ],
    });
  }

  return asset;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
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
    permissions: {
      transactions,
      portfolios: [],
      assets: [new Asset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyAsset = (): Procedure<Params, Asset> =>
  new Procedure(prepareModifyAsset, getAuthorization);
