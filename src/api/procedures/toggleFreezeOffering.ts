import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, stringToTicker } from '~/utils/conversion';

export interface ToggleFreezeOfferingParams {
  id: BigNumber;
  freeze: boolean;
  ticker: string;
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
  const { ticker, id, freeze } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawId = bigNumberToU64(id, context);

  const offering = new Offering({ ticker, id }, context);

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
      args: [rawTicker, rawId],
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
    args: [rawTicker, rawId],
    resolver: offering,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeOfferingParams, Offering>,
  { ticker, freeze }: ToggleFreezeOfferingParams
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.sto.FreezeFundraiser : TxTags.sto.UnfreezeFundraiser],
      assets: [new FungibleAsset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeOffering = (): Procedure<ToggleFreezeOfferingParams, Offering> =>
  new Procedure(prepareToggleFreezeOffering, getAuthorization);
