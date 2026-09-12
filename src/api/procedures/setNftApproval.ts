import { assertTxSupported } from '~/api/procedures/utils';
import { Account, Nft, PolymeshError, Procedure } from '~/internal';
import { AccountLike, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64, stringToAccountId } from '~/utils/conversion';
import { asAccount, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  nft: Nft;
  /**
   * the Account to approve, or `null` to clear the approval
   */
  spender: AccountLike | null;
}

/**
 * @hidden
 */
export async function prepareSetNftApproval(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'nft', 'approve'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { nft, spender } = args;

  assertTxSupported(TxTags.nft.Approve, '8.1.1', context);

  const [holder, currentApproval, actingAccount] = await Promise.all([
    nft.getOwner(),
    nft.getApproval(),
    context.getActingAccount(),
  ]);

  if (!holder) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The NFT does not exist',
    });
  }

  // approvals are key to key, so a Portfolio has no Account that could grant one
  if (!(holder instanceof Account)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only an NFT held by an Account can be approved, and this one is held in a Portfolio',
    });
  }

  if (holder.address !== actingAccount.address) {
    const isOperator = await nft.collection.isOperatorApproved({
      owner: holder,
      operator: actingAccount,
    });

    if (!isOperator) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          "Only the NFT's holder, or an operator it has approved for the collection, can set the NFT's approval",
        data: { holder: holder.address },
      });
    }
  }

  const spenderAddress = spender ? asAccount(spender, context).address : null;

  if (spenderAddress === (currentApproval?.address ?? null)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: spenderAddress
        ? 'The Account is already approved for the NFT'
        : 'The NFT has no approval to clear',
    });
  }

  return {
    transaction: tx.nft.approve,
    args: [
      assetToMeshAssetId(nft.collection, context),
      bigNumberToU64(nft.id, context),
      optionize(stringToAccountId)(spenderAddress, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * @note the chain checks only the extrinsic permission. Whether the caller may approve is decided
 *   by who holds the NFT, which `prepareSetNftApproval` checks
 */
export function getAuthorization(): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.nft.Approve],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setNftApproval = (): Procedure<Params, void> =>
  new Procedure(prepareSetNftApproval, getAuthorization);
