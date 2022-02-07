import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { bigNumberToBalance, stringToTicker } from '~/utils/conversion';

export interface IssueAssetsParams {
  amount: BigNumber;
  ticker: string;
}

export interface Storage {
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareIssueAssets(
  this: Procedure<IssueAssetsParams, Asset, Storage>,
  args: IssueAssetsParams
): Promise<Asset> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
    storage: { asset: assetEntity },
  } = this;
  const { ticker, amount } = args;

  const { isDivisible, totalSupply } = await assetEntity.details();

  const supplyAfterMint = amount.plus(totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_BALANCE,
      },
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = bigNumberToBalance(amount, context, isDivisible);

  this.addTransaction({
    transaction: asset.issue,
    args: [rawTicker, rawValue],
  });

  return assetEntity;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueAssetsParams, Asset, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.asset.Issue],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<IssueAssetsParams, Asset, Storage>,
  { ticker }: IssueAssetsParams
): Storage {
  const { context } = this;

  return {
    asset: new Asset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const issueAssets = (): Procedure<IssueAssetsParams, Asset, Storage> =>
  new Procedure(prepareIssueAssets, getAuthorization, prepareStorage);
