import { BaseAsset, PolymeshError, Procedure, TickerReservation } from '~/internal';
import {
  ErrorCode,
  LinkTickerToAssetParams,
  RoleType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = LinkTickerToAssetParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareLinkTickerToAsset(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'linkTickerToAssetId'>>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
  } = this;

  if (isV6) {
    throw new PolymeshError({
      code: ErrorCode.General,
      message: 'linking ticker to asset is only supported on v7+ chains',
    });
  }

  const { ticker, asset } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawAssetId = assetToMeshAssetId(asset, context);

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
  this: Procedure<Params, void>,
  { asset, ticker }: Params
): Promise<ProcedureAuthorization> {
  const { context } = this;

  const reservation = new TickerReservation({ ticker }, context);
  const [{ status }] = await Promise.all([reservation.details(), context.getSigningIdentity()]);

  const transactions = [TxTags.asset.LinkTickerToAssetId];

  if (status === TickerReservationStatus.Free) {
    transactions.push(TxTags.asset.RegisterUniqueTicker); // not sure if register is needed
  }

  return {
    permissions: {
      assets: [asset],
      transactions: [TxTags.asset.LinkTickerToAssetId],
      portfolios: [],
    },
    roles: [{ type: RoleType.TickerOwner, ticker }],
  };
}

/**
 * @hidden
 */
export const linkTickerToAsset = (): Procedure<Params, void> =>
  new Procedure(prepareLinkTickerToAsset, getAuthorization);
