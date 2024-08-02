import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, OfferingSaleStatus, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  asset: FungibleAsset;
  id: BigNumber;
}

/**
 * @hidden
 */
export async function prepareCloseOffering(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'sto', 'stop'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const {
    asset: { id: assetId },
    asset,
    id,
  } = args;

  const offering = new Offering({ id, assetId }, context);

  const {
    status: { sale },
  } = await offering.details();

  if ([OfferingSaleStatus.Closed, OfferingSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is already closed',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawId = bigNumberToU64(id, context);

  return {
    transaction: txSto.stop,
    args: [rawAssetId, rawId],
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
      transactions: [TxTags.sto.Stop],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const closeOffering = (): Procedure<Params, void> =>
  new Procedure(prepareCloseOffering, getAuthorization);
