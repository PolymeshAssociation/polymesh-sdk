import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { ConfidentialTransaction, ConfidentialTransactionStatus, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU32, bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  transaction: ConfidentialTransaction;
}

/**
 * @hidden
 */
export async function prepareRejectConfidentialTransaction(
  this: Procedure<Params, ConfidentialTransaction>,
  args: Params
): Promise<
  TransactionSpec<
    ConfidentialTransaction,
    ExtrinsicParams<'confidentialAsset', 'rejectTransaction'>
  >
> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;

  const { transaction } = args;

  const [{ status }, legs, involvedParties, signingIdentity] = await Promise.all([
    transaction.details(),
    transaction.getLegs(),
    transaction.getInvolvedParties(),
    context.getSigningIdentity(),
  ]);

  if (status !== ConfidentialTransactionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Confidential Transaction has already been completed',
      data: { transactionId: transaction.id.toString(), status },
    });
  }

  if (!involvedParties.some(party => party.did === signingIdentity.did)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signing identity is not involved in this Confidential Transaction',
      data: { did: signingIdentity.did, transactionId: transaction.id.toString() },
    });
  }

  const rawId = bigNumberToU64(transaction.id, context);
  const rawCount = bigNumberToU32(new BigNumber(legs.length), context);

  return {
    transaction: confidentialAsset.rejectTransaction,
    args: [rawId, rawCount],
    resolver: transaction,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, ConfidentialTransaction>
): Promise<ProcedureAuthorization> {
  return {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.confidentialAsset.RejectTransaction],
    },
  };
}

/**
 * @hidden
 */
export const rejectConfidentialTransaction = (): Procedure<Params, ConfidentialTransaction> =>
  new Procedure(prepareRejectConfidentialTransaction, getAuthorization);
