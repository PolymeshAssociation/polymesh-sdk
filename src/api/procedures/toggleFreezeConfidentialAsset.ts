import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { booleanToBool } from '@polymeshassociation/polymesh-sdk/utils/conversion';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAsset, PolymeshError } from '~/internal';
import { ConfidentialProcedureAuthorization, RoleType, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { serializeConfidentialAssetId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  confidentialAsset: ConfidentialAsset;
  freeze: boolean;
};

/**
 * @hidden
 */
export async function prepareToggleFreezeConfidentialAsset(
  this: ConfidentialProcedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'confidentialAsset', 'setAssetFrozen'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { confidentialAsset, freeze } = args;

  const isFrozen = await confidentialAsset.isFrozen();

  const rawAssetId = serializeConfidentialAssetId(confidentialAsset);
  const rawFreeze = booleanToBool(freeze, context);

  if (freeze === isFrozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `The Asset is already ${freeze ? 'frozen' : 'unfrozen'}`,
    });
  }

  return {
    transaction: tx.confidentialAsset.setAssetFrozen,
    args: [rawAssetId, rawFreeze],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: ConfidentialProcedure<Params, void>,
  { confidentialAsset: asset }: Params
): Promise<ConfidentialProcedureAuthorization> {
  return {
    roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: asset.id }],
    permissions: {
      transactions: [TxTags.confidentialAsset.SetAssetFrozen],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeConfidentialAsset = (): ConfidentialProcedure<Params, void> =>
  new ConfidentialProcedure(prepareToggleFreezeConfidentialAsset, getAuthorization);
