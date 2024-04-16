import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { booleanToBool } from '@polymeshassociation/polymesh-sdk/utils/conversion';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAsset, PolymeshError } from '~/internal';
import {
  ConfidentialProcedureAuthorization,
  FreezeConfidentialAccountAssetParams,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import {
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
  this: ConfidentialProcedure<Params, void>,
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
  this: ConfidentialProcedure<Params, void>,
  { confidentialAsset: asset }: Params
): ConfidentialProcedureAuthorization {
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
export const toggleFreezeConfidentialAccountAsset = (): ConfidentialProcedure<Params, void> =>
  new ConfidentialProcedure(prepareToggleFreezeConfidentialAccountAsset, getAuthorization);
