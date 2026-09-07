import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ApproveAllowanceParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { UNLIMITED_ALLOWANCE } from '~/utils/constants';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  bigNumberToU128,
  stringToAccountId,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { asset: FungibleAsset } & ApproveAllowanceParams;

/**
 * @hidden
 */
export function prepareApproveAllowance(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'approve'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          asset: { approve },
        },
      },
    },
    context,
  } = this;

  const { asset, amount, spender, unlimited } = args;

  if (!!unlimited === !!amount) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Pass either an allowance amount or `unlimited`, but not both',
    });
  }

  if (amount?.lt(0)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'Allowance amount cannot be less than 0. Pass 0 to revoke the allowance or greater than 0 to set the new allowance',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { address: spenderAddress } = asAccount(spender, context);

  /*
   * an unlimited allowance is `Balance::MAX`, which is far above the balance any real amount may
   *   take, so it goes straight to a `u128` rather than through the capped balance conversion
   */
  const rawAmount = amount
    ? bigNumberToBalance(amount, context)
    : bigNumberToU128(UNLIMITED_ALLOWANCE, context);

  return Promise.resolve({
    transaction: approve,
    args: [rawAssetId, stringToAccountId(spenderAddress, context), rawAmount],
    resolver: undefined,
  });
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void>): ProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      transactions: [TxTags.asset.Approve],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const approveAllowance = (): Procedure<Params, void> =>
  new Procedure(prepareApproveAllowance, getAuthorization);
