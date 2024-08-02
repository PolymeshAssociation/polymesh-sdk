import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, boolToBoolean } from '~/utils/conversion';

export interface TogglePauseRequirementsParams {
  pause: boolean;
}

/**
 * @hidden
 */
export type Params = TogglePauseRequirementsParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareTogglePauseRequirements(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'pauseAssetCompliance'>>
  | TransactionSpec<void, ExtrinsicParams<'complianceManager', 'resumeAssetCompliance'>>
> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { asset, pause } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const { paused } = await query.complianceManager.assetCompliances(rawAssetId);

  if (pause === boolToBoolean(paused)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `Requirements are already ${paused ? '' : 'un'}paused`,
    });
  }

  return {
    transaction: pause
      ? tx.complianceManager.pauseAssetCompliance
      : tx.complianceManager.resumeAssetCompliance,
    args: [rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset, pause }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [
        pause
          ? TxTags.complianceManager.PauseAssetCompliance
          : TxTags.complianceManager.ResumeAssetCompliance,
      ],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const togglePauseRequirements = (): Procedure<Params, void> =>
  new Procedure(prepareTogglePauseRequirements, getAuthorization);
