import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import {
  ErrorCode,
  ModifyOfferingTimesParams,
  OfferingSaleStatus,
  OfferingTimingStatus,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, dateToMoment, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
function validateInput(
  sale: OfferingSaleStatus,
  newStart: Date | undefined,
  start: Date,
  newEnd: Date | null | undefined,
  end: Date | null,
  timing: OfferingTimingStatus
): void {
  if ([OfferingSaleStatus.Closed, OfferingSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is already closed',
    });
  }

  const areSameTimes =
    (!newStart || start === newStart) && (newEnd === undefined || end === newEnd);

  if (areSameTimes) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Nothing to modify',
    });
  }

  const now = new Date();

  if (timing === OfferingTimingStatus.Expired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering has already ended',
    });
  }

  if (timing !== OfferingTimingStatus.NotStarted && newStart) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot modify the start time of an Offering that already started',
    });
  }

  const datesAreInThePast = (newStart && now > newStart) || (newEnd && now > newEnd);

  if (datesAreInThePast) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New dates are in the past',
    });
  }
}

/**
 * @hidden
 */
export type Params = ModifyOfferingTimesParams & {
  id: BigNumber;
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareModifyOfferingTimes(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'sto', 'modifyFundraiserWindow'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { ticker, id, start: newStart, end: newEnd } = args;

  const offering = new Offering({ ticker, id }, context);

  const {
    status: { sale, timing },
    end,
    start,
  } = await offering.details();

  validateInput(sale, newStart, start, newEnd, end, timing);

  const rawTicker = stringToTicker(ticker, context);
  const rawId = bigNumberToU64(id, context);
  const rawStart = newStart ? dateToMoment(newStart, context) : dateToMoment(start, context);
  let rawEnd: u64 | null;

  if (newEnd === null) {
    rawEnd = null;
  } else if (!newEnd) {
    rawEnd = end && dateToMoment(end, context);
  } else {
    rawEnd = dateToMoment(newEnd, context);
  }

  return {
    transaction: txSto.modifyFundraiserWindow,
    args: [rawTicker, rawId, rawStart, rawEnd],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.sto.ModifyFundraiserWindow],
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyOfferingTimes = (): Procedure<Params, void> =>
  new Procedure(prepareModifyOfferingTimes, getAuthorization);
