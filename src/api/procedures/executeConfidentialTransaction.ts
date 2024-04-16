import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { bigNumberToU32, bigNumberToU64 } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialTransaction, PolymeshError } from '~/internal';
import { ConfidentialProcedureAuthorization, ConfidentialTransactionStatus, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';

export interface ExecuteConfidentialTransactionParams {
  transaction: ConfidentialTransaction;
}

/**
 * @hidden
 */
export async function prepareExecuteConfidentialTransaction(
  this: ConfidentialProcedure<ExecuteConfidentialTransactionParams, ConfidentialTransaction>,
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
  this: ConfidentialProcedure<ExecuteConfidentialTransactionParams, ConfidentialTransaction>
): Promise<ConfidentialProcedureAuthorization> {
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
export const executeConfidentialTransaction = (): ConfidentialProcedure<
  ExecuteConfidentialTransactionParams,
  ConfidentialTransaction
> => new ConfidentialProcedure(prepareExecuteConfidentialTransaction, getAuthorization);
