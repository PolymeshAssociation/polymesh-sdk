import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
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
  this: Procedure<Params, Asset>,
  args: Params
): Promise<Asset> {
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

  const assetEntity = new Asset({ ticker }, context);

  const isFrozen = await assetEntity.isFrozen();

  if (freeze) {
    if (isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already frozen',
      });
    }

    this.addTransaction(asset.freeze, {}, rawTicker);
  } else {
    if (!isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already unfrozen',
      });
    }

    this.addTransaction(asset.unfreeze, {}, rawTicker);
  }

  return assetEntity;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
  { ticker, freeze }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.asset.Freeze : TxTags.asset.Unfreeze],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeTransfers = (): Procedure<Params, Asset> =>
  new Procedure(prepareToggleFreezeTransfers, getAuthorization);
