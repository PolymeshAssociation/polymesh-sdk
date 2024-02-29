import { ConfidentialAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, FreezeConfidentialAccountAssetParams, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  booleanToBool,
  confidentialAccountToMeshPublicKey,
  serializeConfidentialAssetId,
} from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = {
  confidentialAsset: ConfidentialAsset;
  freeze: boolean;
} & FreezeConfidentialAccountAssetParams;

/**
 * @hidden
 */
export async function prepareToggleFreezeConfidentialAccountAsset(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'confidentialAsset', 'setAccountAssetFrozen'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { confidentialAccount, confidentialAsset, freeze } = args;

  const account = asConfidentialAccount(confidentialAccount, context);

  const isAccountFrozen = await confidentialAsset.isAccountFrozen(account);

  const rawAccountId = confidentialAccountToMeshPublicKey(account, context);
  const rawAssetId = serializeConfidentialAssetId(confidentialAsset);
  const rawFreeze = booleanToBool(freeze, context);

  if (freeze === isAccountFrozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `The account is already ${freeze ? 'frozen' : 'unfrozen'}`,
      data: {
        confidentialAccount: account.publicKey,
        confidentialAsset: confidentialAsset.id,
      },
    });
  }

  return {
    transaction: tx.confidentialAsset.setAccountAssetFrozen,
    args: [rawAccountId, rawAssetId, rawFreeze],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { confidentialAsset: asset }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: asset.id }],
    permissions: {
      transactions: [TxTags.confidentialAsset.SetAccountAssetFrozen],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeConfidentialAccountAsset = (): Procedure<Params, void> =>
  new Procedure(prepareToggleFreezeConfidentialAccountAsset, getAuthorization);
