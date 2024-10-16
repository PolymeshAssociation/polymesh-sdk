import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import {
  BatchTransactionSpec,
  ExtrinsicParams,
  ProcedureAuthorization,
  TransactionSpec,
} from '~/types/internal';
import { assetToMeshAssetId, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  asset: BaseAsset;
};

export interface Storage {
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareUnlinkTickerFromAsset(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | BatchTransactionSpec<void, unknown[][]>
  | TransactionSpec<void, ExtrinsicParams<'asset', 'unlinkTickerFromAssetId'>>
> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    storage: { ticker },
    context,
  } = this;

  const { asset } = args;

  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (isV6) {
    throw new PolymeshError({
      code: ErrorCode.General,
      message: 'Unlinking ticker from asset is only supported on v7+ chains',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawAssetId = assetToMeshAssetId(asset, context);

  return {
    transaction: tx.asset.unlinkTickerFromAssetId,
    args: [rawTicker, rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { ticker },
  } = this;

  return {
    roles: [{ type: RoleType.TickerOwner, ticker }],
    permissions: {
      transactions: [TxTags.asset.UnlinkTickerFromAssetId],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<Storage> {
  const { asset } = args;

  const { ticker } = await asset.details();

  if (!ticker) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'There is no ticker to unlink from the Asset',
    });
  }

  return {
    ticker,
  };
}

/**
 * @hidden
 */
export const unlinkTickerFromAsset = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareUnlinkTickerFromAsset, getAuthorization, prepareStorage);
