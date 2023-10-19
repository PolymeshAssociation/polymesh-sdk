import BigNumber from 'bignumber.js';

import { FungibleAsset, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, OfferingSaleStatus, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
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
  const { ticker, id } = args;

  const offering = new Offering({ ticker, id }, context);

  const {
    status: { sale },
  } = await offering.details();

  if ([OfferingSaleStatus.Closed, OfferingSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is already closed',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawId = bigNumberToU64(id, context);

  return {
    transaction: txSto.stop,
    args: [rawTicker, rawId],
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
      transactions: [TxTags.sto.Stop],
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const closeOffering = (): Procedure<Params, void> =>
  new Procedure(prepareCloseOffering, getAuthorization);
