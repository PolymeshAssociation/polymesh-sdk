import { ISubmittableResult } from '@polkadot/types/types';

import { Checkpoint, Context, FungibleAsset, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
}

/**
 * @hidden
 */
export const createCheckpointResolver =
  (ticker: string, context: Context) =>
  (receipt: ISubmittableResult): Checkpoint => {
    const [{ data }] = filterEventRecords(receipt, 'checkpoint', 'CheckpointCreated');
    const id = u64ToBigNumber(data[2]);

    return new Checkpoint({ ticker, id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateCheckpoint(
  this: Procedure<Params, Checkpoint>,
  args: Params
): Promise<TransactionSpec<Checkpoint, ExtrinsicParams<'checkpoint', 'createCheckpoint'>>> {
  const { context } = this;
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  return {
    transaction: context.polymeshApi.tx.checkpoint.createCheckpoint,
    args: [rawTicker],
    resolver: createCheckpointResolver(ticker, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Checkpoint>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.checkpoint.CreateCheckpoint],
      assets: [new FungibleAsset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpoint = (): Procedure<Params, Checkpoint> =>
  new Procedure(prepareCreateCheckpoint, getAuthorization);
