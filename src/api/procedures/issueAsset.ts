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

/**
 * @hidden
 */
export async function prepareIssueAsset(
  this: Procedure<IssueAssetParams, Asset>,
  args: IssueAssetParams
): Promise<Asset> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;
  const { ticker, amount } = args;

  const assetEntity = new Asset({ ticker }, context);

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
  this: Procedure<IssueAssetParams, Asset>,
  { ticker }: IssueAssetParams
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.asset.Issue],
      assets: [new Asset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const issueAsset = (): Procedure<IssueAssetParams, Asset> =>
  new Procedure(prepareIssueAsset, getAuthorization);
