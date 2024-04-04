import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveAssetRequirementParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU32, stringToTicker, u32ToBigNumber } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveAssetRequirementParams & {
  ticker: string;
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
  const { ticker, requirement } = args;

  const rawTicker = stringToTicker(ticker, context);

  const reqId = requirement instanceof BigNumber ? requirement : requirement.id;

  const { requirements } = await query.complianceManager.assetCompliances(rawTicker);

  if (!requirements.some(({ id: rawId }) => u32ToBigNumber(rawId).eq(reqId))) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: `There is no compliance requirement with id "${reqId}"`,
    });
  }

  return {
    transaction: tx.complianceManager.removeComplianceRequirement,
    args: [rawTicker, bigNumberToU32(reqId, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.complianceManager.RemoveComplianceRequirement],
      assets: [new FungibleAsset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeAssetRequirement = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveAssetRequirement, getAuthorization);
