import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { bigNumberToU32, bigNumberToU64 } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { PolymeshError } from '~/internal';
import {
  ConfidentialProcedureAuthorization,
  ConfidentialTransaction,
  ConfidentialTransactionStatus,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';

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
  this: ConfidentialProcedure<Params, ConfidentialTransaction>,
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
  this: ConfidentialProcedure<Params, ConfidentialTransaction>
): Promise<ConfidentialProcedureAuthorization> {
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
export const rejectConfidentialTransaction = (): ConfidentialProcedure<
  Params,
  ConfidentialTransaction
> => new ConfidentialProcedure(prepareRejectConfidentialTransaction, getAuthorization);
