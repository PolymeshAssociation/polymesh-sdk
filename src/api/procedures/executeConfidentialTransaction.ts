import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, PolymeshError, Procedure } from '~/internal';
import { ConfidentialTransactionStatus, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU32, bigNumberToU64 } from '~/utils/conversion';

export interface ExecuteConfidentialTransactionParams {
  transaction: ConfidentialTransaction;
}

/**
 * @hidden
 */
export async function prepareExecuteConfidentialTransaction(
  this: Procedure<ExecuteConfidentialTransactionParams, ConfidentialTransaction>,
  args: ExecuteConfidentialTransactionParams
): Promise<
  TransactionSpec<
    ConfidentialTransaction,
    ExtrinsicParams<'confidentialAsset', 'executeTransaction'>
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

  const {
    transaction,
    transaction: { id },
  } = args;

  const [signingIdentity, pendingAffirmsCount, { status }, involvedParties, legs] =
    await Promise.all([
      context.getSigningIdentity(),
      transaction.getPendingAffirmsCount(),
      transaction.details(),
      transaction.getInvolvedParties(),
      transaction.getLegs(),
    ]);

  if (!involvedParties.some(party => party.did === signingIdentity.did)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing identity is not involved in this Confidential Transaction',
    });
  }

  if (!pendingAffirmsCount.isZero()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The Confidential Transaction needs to be affirmed by all parties before it can be executed',
      data: {
        pendingAffirmsCount,
      },
    });
  }

  if (
    status === ConfidentialTransactionStatus.Executed ||
    status === ConfidentialTransactionStatus.Rejected
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `The Confidential Transaction has already been ${status.toLowerCase()}`,
    });
  }

  return {
    transaction: confidentialAsset.executeTransaction,
    args: [bigNumberToU64(id, context), bigNumberToU32(new BigNumber(legs.length), context)],
    resolver: transaction,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ExecuteConfidentialTransactionParams, ConfidentialTransaction>
): Promise<ProcedureAuthorization> {
  return {
    permissions: {
      transactions: [TxTags.confidentialAsset.ExecuteTransaction],
      portfolios: [],
      assets: [],
    },
  };
}

/**
 * @hidden
 */
export const executeConfidentialTransaction = (): Procedure<
  ExecuteConfidentialTransactionParams,
  ConfidentialTransaction
> => new Procedure(prepareExecuteConfidentialTransaction, getAuthorization);
