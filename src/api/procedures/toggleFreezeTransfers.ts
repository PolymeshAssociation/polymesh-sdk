import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToTicker } from '~/utils/conversion';

export interface ToggleFreezeTransfersParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export type Params = ToggleFreezeTransfersParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareToggleFreezeTransfers(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'freeze'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;
  const { ticker, freeze } = args;

  const rawTicker = stringToTicker(ticker, context);

  const assetEntity = new BaseAsset({ ticker }, context);

  const isFrozen = await assetEntity.isFrozen();

  if (freeze) {
    if (isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already frozen',
      });
    }

    return {
      transaction: asset.freeze,
      args: [rawTicker],
      resolver: undefined,
    };
  }
  if (!isFrozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The Asset is already unfrozen',
    });
  }

  return {
    transaction: asset.unfreeze,
    args: [rawTicker],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker, freeze }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.asset.Freeze : TxTags.asset.Unfreeze],
      assets: [new BaseAsset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeTransfers = (): Procedure<Params, void> =>
  new Procedure(prepareToggleFreezeTransfers, getAuthorization);
