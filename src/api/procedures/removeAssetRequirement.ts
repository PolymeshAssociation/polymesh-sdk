import BigNumber from 'bignumber.js';

import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveAssetRequirementParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU32, u32ToBigNumber } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveAssetRequirementParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareRemoveAssetRequirement(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  TransactionSpec<void, ExtrinsicParams<'complianceManager', 'removeComplianceRequirement'>>
> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { asset, requirement } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const reqId = requirement instanceof BigNumber ? requirement : requirement.id;

  const { requirements } = await query.complianceManager.assetCompliances(rawAssetId);

  if (!requirements.some(({ id: rawId }) => u32ToBigNumber(rawId).eq(reqId))) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: `There is no compliance requirement with id "${reqId}"`,
    });
  }

  return {
    transaction: tx.complianceManager.removeComplianceRequirement,
    args: [rawAssetId, bigNumberToU32(reqId, context)],
    resolver: undefined,
  };
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
      transactions: [TxTags.complianceManager.RemoveComplianceRequirement],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeAssetRequirement = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveAssetRequirement, getAuthorization);
