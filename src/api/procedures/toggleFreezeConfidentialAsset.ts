import { ConfidentialAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { booleanToBool, serializeConfidentialAssetId } from '~/utils/conversion';

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
  this: Procedure<Params, void>,
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
export function getAuthorization(
  this: Procedure<Params, void>,
  { confidentialAsset: asset }: Params
): ProcedureAuthorization {
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
export const toggleFreezeConfidentialAsset = (): Procedure<Params, void> =>
  new Procedure(prepareToggleFreezeConfidentialAsset, getAuthorization);
