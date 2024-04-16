import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { PolymeshError } from '~/internal';
import {
  AffirmConfidentialTransactionParams,
  ConfidentialAffirmParty,
  ConfidentialProcedureAuthorization,
  ConfidentialTransaction,
  ConfidentialTransactionStatus,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import {
  confidentialAffirmsToRaw,
  confidentialAffirmTransactionToMeshTransaction,
} from '~/utils/conversion';

export type Params = {
  transaction: ConfidentialTransaction;
} & AffirmConfidentialTransactionParams;

/**
 * @hidden
 */
export async function prepareAffirmConfidentialTransactions(
  this: ConfidentialProcedure<Params, ConfidentialTransaction>,
  args: Params
): Promise<
  TransactionSpec<
    ConfidentialTransaction,
    ExtrinsicParams<'confidentialAsset', 'affirmTransactions'>
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

  const { transaction, legId, party } = args;

  const [{ status }, involvedParties, signingIdentity, legState] = await Promise.all([
    transaction.details(),
    transaction.getInvolvedParties(),
    context.getSigningIdentity(),
    transaction.getLegState(legId),
  ]);

  if (status !== ConfidentialTransactionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Confidential Transaction has already been completed',
      data: { transactionId: transaction.id.toString(), status },
    });
  }

  if (!involvedParties.some(involvedParty => involvedParty.did === signingIdentity.did)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signing identity is not involved in this Confidential Transaction',
      data: { did: signingIdentity.did, transactionId: transaction.id.toString() },
    });
  }

  if (party === ConfidentialAffirmParty.Sender) {
    if (legState.proved) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The leg has already been affirmed by the sender',
        data: { transactionId: transaction.id.toString(), legId: legId.toString() },
      });
    }
  } else if (!legState.proved) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The sender has not yet provided amounts and proof for this leg',
      data: { legId: legId.toString },
    });
  }

  const proofs = party === ConfidentialAffirmParty.Sender ? args.proofs : undefined;

  const rawTx = confidentialAffirmTransactionToMeshTransaction(
    {
      transactionId: transaction.id,
      legId,
      party,
      proofs,
    },
    context
  );

  const rawAffirm = confidentialAffirmsToRaw([rawTx], context);

  return {
    transaction: confidentialAsset.affirmTransactions,
    args: [rawAffirm],
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
      transactions: [TxTags.confidentialAsset.AffirmTransactions],
    },
  };
}

/**
 * @hidden
 */
export const affirmConfidentialTransactions = (): ConfidentialProcedure<
  Params,
  ConfidentialTransaction
> => new ConfidentialProcedure(prepareAffirmConfidentialTransactions, getAuthorization);
