import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ApproveAllowanceParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToBalance, stringToAccountId } from '~/utils/conversion';
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

  const { asset, amount, spender } = args;

  if (amount.lt(0)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'Allowance amount cannot be less than 0. Pass 0 to revoke the allowance or greater than 0 to set the new allowance',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { address: spenderAddress } = asAccount(spender, context);

  return Promise.resolve({
    transaction: approve,
    args: [
      rawAssetId,
      stringToAccountId(spenderAddress, context),
      bigNumberToBalance(amount, context),
    ],
    resolver: undefined,
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [asset],
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
