import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { numberToBalance, stringToTicker } from '~/utils/conversion';

export interface IssueAssetParams {
  amount: BigNumber;
  ticker: string;
}

export interface Storage {
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareIssueAsset(
  this: Procedure<IssueAssetParams, Asset, Storage>,
  args: IssueAssetParams
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
  const rawValue = numberToBalance(amount, context, isDivisible);
  this.addTransaction(asset.issue, {}, rawTicker, rawValue);

  return assetEntity;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueAssetParams, Asset, Storage>
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
  this: Procedure<IssueAssetParams, Asset, Storage>,
  { ticker }: IssueAssetParams
): Storage {
  const { context } = this;

  return {
    asset: new Asset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const issueAsset = (): Procedure<IssueAssetParams, Asset, Storage> =>
  new Procedure(prepareIssueAsset, getAuthorization, prepareStorage);
