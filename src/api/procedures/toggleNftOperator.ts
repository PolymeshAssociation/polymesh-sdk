import { assertTxSupported } from '~/api/procedures/utils';
import { NftCollection, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, NftOperatorParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, booleanToBool, stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = NftOperatorParams & {
  collection: NftCollection;
  approve: boolean;
};

/**
 * @hidden
 */
export async function prepareToggleNftOperator(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'nft', 'setApprovalForAll'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { collection, operator, approve } = args;

  assertTxSupported(TxTags.nft.SetApprovalForAll, '8.1.1', context);

  const actingAccount = await context.getActingAccount();
  const operatorAccount = asAccount(operator, context);

  if (operatorAccount.address === actingAccount.address) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'An Account cannot be its own operator',
    });
  }

  // the chain records an operator for any Asset ID, so the SDK checks the collection is real
  const [exists, isApproved] = await Promise.all([
    collection.exists(),
    collection.isOperatorApproved({ owner: actingAccount, operator: operatorAccount }),
  ]);

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The NFT collection doesn't exist",
    });
  }

  if (isApproved === approve) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: approve ? 'The operator is already approved' : 'The operator is not approved',
    });
  }

  return {
    transaction: tx.nft.setApprovalForAll,
    args: [
      assetToMeshAssetId(collection, context),
      stringToAccountId(operatorAccount.address, context),
      booleanToBool(approve, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * @note the chain checks only the extrinsic permission. An operator is approved over the signing
 *   Account's own NFTs, so no Asset or Portfolio permission applies
 */
export function getAuthorization(): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.nft.SetApprovalForAll],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleNftOperator = (): Procedure<Params, void> =>
  new Procedure(prepareToggleNftOperator, getAuthorization);
