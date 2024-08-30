import { BaseAsset, PolymeshError, Procedure, TickerReservation } from '~/internal';
import {
  ErrorCode,
  LinkTickerToAssetParams,
  RoleType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import {
  BatchTransactionSpec,
  ExtrinsicParams,
  ProcedureAuthorization,
  TransactionSpec,
} from '~/types/internal';
import { assetToMeshAssetId, stringToTicker } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = LinkTickerToAssetParams & {
  asset: BaseAsset;
};

export interface Storage {
  status: TickerReservationStatus;
}

/**
 * @hidden
 */
export async function prepareLinkTickerToAsset(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | BatchTransactionSpec<void, unknown[][]>
  | TransactionSpec<void, ExtrinsicParams<'asset', 'linkTickerToAssetId'>>
> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    storage: { status },
    context,
  } = this;

  const { ticker, asset } = args;

  if (isV6) {
    throw new PolymeshError({
      code: ErrorCode.General,
      message: 'linking ticker to asset is only supported on v7+ chains',
    });
  }

  if (status === TickerReservationStatus.AssetCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The ticker has already been linked to an asset',
      data: { ticker },
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawAssetId = assetToMeshAssetId(asset, context);

  if (status === TickerReservationStatus.Free) {
    return {
      transactions: [
        checkTxType({
          transaction: tx.asset.registerUniqueTicker,
          args: [rawTicker],
        }),
        checkTxType({
          transaction: tx.asset.linkTickerToAssetId,
          args: [rawTicker, rawAssetId],
        }),
      ],
      resolver: undefined,
    };
  }

  return {
    transaction: tx.asset.linkTickerToAssetId,
    args: [rawTicker, rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset, ticker }: Params
): Promise<ProcedureAuthorization> {
  const transactions = [TxTags.asset.LinkTickerToAssetId];
  const { status } = this.storage;

  if (status === TickerReservationStatus.Free) {
    transactions.push(TxTags.asset.RegisterUniqueTicker);
  }

  const auth = {
    permissions: {
      assets: [asset],
      transactions,
      portfolios: [],
    },
  };

  if (status === TickerReservationStatus.Reserved) {
    return {
      ...auth,
      roles: [{ type: RoleType.TickerOwner, ticker }],
    };
  }

  return auth;
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<Storage> {
  const { context } = this;
  const { ticker } = args;

  const reservation = new TickerReservation({ ticker }, context);
  const { status } = await reservation.details();

  return {
    status,
  };
}

/**
 * @hidden
 */
export const linkTickerToAsset = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareLinkTickerToAsset, getAuthorization, prepareStorage);
