import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { AssetMediatorParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, identitiesToBtreeSet } from '~/utils/conversion';
import { asIdentity } from '~/utils/internal';
/**
 * @hidden
 */
export type Params = { asset: BaseAsset } & AssetMediatorParams;

/**
 * @hidden
 */
export async function prepareRemoveAssetMediators(
  this: Procedure<Params>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'removeMandatoryMediators'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { asset, mediators: mediatorInput } = args;

  const currentMediators = await asset.getRequiredMediators();

  const removeMediators = mediatorInput.map(mediator => asIdentity(mediator, context));

  removeMediators.forEach(({ did: removeDid }) => {
    const alreadySetDid = currentMediators.find(({ did: currentDid }) => currentDid === removeDid);

    if (!alreadySetDid) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One of the specified mediators to remove is not set',
        data: { assetId: asset.id, removeDid },
      });
    }
  });

  const rawNewMediators = identitiesToBtreeSet(removeMediators, context);
  const rawAssetId = assetToMeshAssetId(asset, context);

  return {
    transaction: tx.asset.removeMandatoryMediators,
    args: [rawAssetId, rawNewMediators],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params>, args: Params): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.asset.RemoveMandatoryMediators],
      portfolios: [],
      assets: [args.asset],
    },
  };
}

/**
 * @hidden
 */
export const removeAssetMediators = (): Procedure<Params> =>
  new Procedure(prepareRemoveAssetMediators, getAuthorization);
