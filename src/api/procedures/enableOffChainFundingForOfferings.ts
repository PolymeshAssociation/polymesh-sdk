import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import {
  EnableOffChainFundingParams,
  ErrorCode,
  OfferingSaleStatus,
  OfferingTimingStatus,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64, stringToTicker } from '~/utils/conversion';

export interface Params extends EnableOffChainFundingParams {
  id: BigNumber;
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export async function prepareEnableOffChainFundingForOfferings(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'sto', 'enableOffchainFunding'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { asset, id, offChainTicker } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawId = bigNumberToU64(id, context);
  const rawTicker = stringToTicker(offChainTicker, context);

  const offering = new Offering({ id, assetId: asset.id }, context);

  const [
    exists,
    {
      status: { timing, sale },
    },
  ] = await Promise.all([offering.exists(), offering.details()]);

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering does not exist',
      data: { id },
    });
  }

  if (timing === OfferingTimingStatus.Expired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering has already ended',
      data: { id },
    });
  }

  if ([OfferingSaleStatus.Closed, OfferingSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is already closed',
    });
  }

  return {
    transaction: txSto.enableOffchainFunding,
    args: [rawAssetId, rawId, rawTicker],
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
      transactions: [TxTags.sto.EnableOffchainFunding],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const enableOffChainFundingForOfferings = (): Procedure<Params, void> =>
  new Procedure(prepareEnableOffChainFundingForOfferings, getAuthorization);
