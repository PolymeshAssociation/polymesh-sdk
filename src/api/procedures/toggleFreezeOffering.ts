import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64 } from '~/utils/conversion';

export interface ToggleFreezeOfferingParams {
  id: BigNumber;
  freeze: boolean;
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeOffering(
  this: Procedure<ToggleFreezeOfferingParams, Offering>,
  args: ToggleFreezeOfferingParams
): Promise<
  | TransactionSpec<Offering, ExtrinsicParams<'sto', 'freezeFundraiser'>>
  | TransactionSpec<Offering, ExtrinsicParams<'sto', 'unfreezeFundraiser'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { asset, id, freeze } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawId = bigNumberToU64(id, context);

  const offering = new Offering({ id, assetId: asset.id }, context);

  const {
    status: { timing, sale },
  } = await offering.details();

  if (timing === OfferingTimingStatus.Expired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering has already ended',
    });
  }

  if (freeze) {
    if (sale === OfferingSaleStatus.Frozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Offering is already frozen',
      });
    }

    return {
      transaction: txSto.freezeFundraiser,
      args: [rawAssetId, rawId],
      resolver: offering,
    };
  }

  if ([OfferingSaleStatus.Closed, OfferingSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is already closed',
    });
  }

  if (sale !== OfferingSaleStatus.Frozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The Offering is already unfrozen',
    });
  }

  return {
    transaction: txSto.unfreezeFundraiser,
    args: [rawAssetId, rawId],
    resolver: offering,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeOfferingParams, Offering>,
  { asset, freeze }: ToggleFreezeOfferingParams
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.sto.FreezeFundraiser : TxTags.sto.UnfreezeFundraiser],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeOffering = (): Procedure<ToggleFreezeOfferingParams, Offering> =>
  new Procedure(prepareToggleFreezeOffering, getAuthorization);
