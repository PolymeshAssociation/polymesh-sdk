import { ISubmittableResult } from '@polkadot/types/types';
import { identity } from 'lodash';

import { PolymeshTransaction, PolymeshTransactionBatch, Procedure } from '~/internal';
import { CreateTransactionBatchParams, TxTag, TxTags } from '~/types';
import {
  BatchTransactionSpec,
  isResolverFunction,
  ProcedureAuthorization,
  ResolverFunction,
  TransactionSpec,
  TxWithArgs,
} from '~/types/internal';
import { isPolymeshTransaction } from '~/utils';
import { transactionToTxTag } from '~/utils/conversion';
import { sliceBatchReceipt } from '~/utils/internal';

export interface Storage {
  processedTransactions: TxWithArgs[];
  tags: TxTag[];
  resolvers: ResolverFunction<unknown>[];
}

/**
 * @hidden
 */
export async function prepareCreateTransactionBatch<ReturnValues extends unknown[]>(
  this: Procedure<CreateTransactionBatchParams<ReturnValues>, ReturnValues, Storage>
): Promise<BatchTransactionSpec<ReturnValues, unknown[][]>> {
  const { processedTransactions: transactions, resolvers } = this.storage;

  return {
    transactions,
    resolver: receipt =>
      Promise.all(resolvers.map(resolver => resolver(receipt))) as Promise<ReturnValues>,
  };
}

/**
 * @hidden
 */
export function getAuthorization<ReturnValues extends unknown[]>(
  this: Procedure<CreateTransactionBatchParams<ReturnValues>, ReturnValues, Storage>
): ProcedureAuthorization {
  const {
    storage: { tags },
  } = this;
  return {
    permissions: {
      transactions: [...tags, TxTags.utility.BatchAtomic],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage<ReturnValues extends unknown[]>(
  this: Procedure<CreateTransactionBatchParams<ReturnValues>, ReturnValues, Storage>,
  args: CreateTransactionBatchParams<ReturnValues>
): Storage {
  const { transactions: inputTransactions } = args;

  const resolvers: ResolverFunction<unknown>[] = [];
  const transactions: TxWithArgs[] = [];
  const tags: TxTag[] = [];

  /*
   * We extract each transaction spec and build an array of all transactions (with args and fees), resolvers and transformers,
   *   to create a new batch spec that contains everything. We use the resolvers and transformers to
   *   create one big resolver that returns an array of the transformed results of each transaction
   *
   * We also get the tags of all transactions to check for permissions. This is necessary even though permissions were checked when
   *   building the individual transactions, since some transactions can be run individually without having an Identity, but these special rules are ignored
   *   when running them as part of a batch
   */
  inputTransactions.forEach(transaction => {
    let spec: TransactionSpec<unknown, unknown[]> | BatchTransactionSpec<unknown, unknown[][]>;

    const startIndex = transactions.length;

    if (isPolymeshTransaction(transaction)) {
      spec = PolymeshTransaction.toTransactionSpec(transaction);
      const { transaction: tx, args: txArgs, fee, feeMultiplier } = spec;

      transactions.push({
        transaction: tx,
        args: txArgs,
        fee,
        feeMultiplier,
      });

      tags.push(transactionToTxTag(tx));
    } else {
      spec = PolymeshTransactionBatch.toTransactionSpec(transaction);
      const { transactions: batchTransactions } = spec;

      batchTransactions.forEach(({ transaction: tx, args: txArgs, fee, feeMultiplier }) => {
        transactions.push({
          transaction: tx,
          args: txArgs,
          fee,
          feeMultiplier,
        });

        tags.push(transactionToTxTag(tx));
      });
    }

    const { transformer = identity, resolver } = spec;

    const endIndex = transactions.length;

    /*
     * We pass the subset of events to the resolver that only correspond to the
     * transactions added in this iteration, and pass the result through the transformer, if any
     */
    resolvers.push(async (receipt: ISubmittableResult) => {
      let value;

      if (isResolverFunction(resolver)) {
        value = resolver(sliceBatchReceipt(receipt, startIndex, endIndex));
      } else {
        value = resolver;
      }

      return transformer(value);
    });
  });

  return {
    processedTransactions: transactions,
    resolvers,
    tags,
  };
}

/**
 * @hidden
 */
export const createTransactionBatch = <ReturnValues extends unknown[]>(): Procedure<
  CreateTransactionBatchParams<ReturnValues>,
  ReturnValues,
  Storage
> =>
  new Procedure<CreateTransactionBatchParams<ReturnValues>, ReturnValues, Storage>(
    prepareCreateTransactionBatch,
    getAuthorization,
    prepareStorage
  );
