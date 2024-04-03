import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { Asset, ErrorCode, ModifyAssetParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { isNftCollection } from '~/utils';
import {
  fundingRoundToAssetFundingRound,
  nameToAssetName,
  securityIdentifierToAssetIdentifier,
  stringToTicker,
} from '~/utils/conversion';
import { asAsset, checkTxType, hasSameElements } from '~/utils/internal';

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
): Promise<BatchTransactionSpec<Asset, unknown[][]>> {
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

  const asset = await asAsset(ticker, context);

  const [{ isDivisible, name }, fundingRound, identifiers] = await Promise.all([
    asset.details(),
    asset.currentFundingRound(),
    asset.getIdentifiers(),
  ]);

  const transactions = [];
  if (makeDivisible) {
    if (isNftCollection(asset)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'NFT Collections cannot be made divisible',
      });
    }

    if (isDivisible) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already divisible',
      });
    }

    transactions.push(
      checkTxType({
        transaction: tx.asset.makeDivisible,
        args: [rawTicker],
      })
    );
  }

  if (newName) {
    if (newName === name) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New name is the same as current name',
      });
    }

    const nameBytes = nameToAssetName(newName, context);
    transactions.push(
      checkTxType({
        transaction: tx.asset.renameAsset,
        args: [rawTicker, nameBytes],
      })
    );
  }

  if (newFundingRound) {
    if (newFundingRound === fundingRound) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New funding round name is the same as current funding round',
      });
    }

    const fundingBytes = fundingRoundToAssetFundingRound(newFundingRound, context);
    transactions.push(
      checkTxType({
        transaction: tx.asset.setFundingRound,
        args: [rawTicker, fundingBytes],
      })
    );
  }

  if (newIdentifiers) {
    const identifiersAreEqual = hasSameElements(identifiers, newIdentifiers);

    if (identifiersAreEqual) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New identifiers are the same as current identifiers',
      });
    }

    transactions.push(
      checkTxType({
        transaction: tx.asset.updateIdentifiers,
        args: [
          rawTicker,
          newIdentifiers.map(newIdentifier =>
            securityIdentifierToAssetIdentifier(newIdentifier, context)
          ),
        ],
      })
    );
  }

  return { transactions, resolver: asset };
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
      assets: [new BaseAsset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyAsset = (): Procedure<Params, Asset> =>
  new Procedure(prepareModifyAsset, getAuthorization);
