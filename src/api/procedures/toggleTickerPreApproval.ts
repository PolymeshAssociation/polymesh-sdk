import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
  preApprove: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleTickerPreApproval(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'preApprove'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, preApprove } = args;

  const identity = await context.getSigningIdentity();
  const isPreApproved = await identity.isAssetPreApproved(ticker);

  if (isPreApproved === preApprove) {
    const message = isPreApproved
      ? 'The signing identity has already pre-approved the ticker'
      : 'The signing identity has not pre-approved the asset';
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message,
      data: { identity: identity.did, ticker },
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const transaction = preApprove ? tx.asset.preApproveTicker : tx.asset.removeTickerPreApproval;

  return {
    transaction,
    args: [rawTicker],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker, preApprove }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [
        preApprove ? TxTags.asset.PreApproveTicker : TxTags.asset.RemoveTickerPreApproval,
      ],
      assets: [new BaseAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleTickerPreApproval = (): Procedure<Params, void> =>
  new Procedure(prepareToggleTickerPreApproval, getAuthorization);
