import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import {
  ConfidentialAffirmParty,
  ConfidentialLegProof,
  ConfidentialTransaction,
  ConfidentialTransactionStatus,
  ErrorCode,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  confidentialAffirmsToRaw,
  confidentialAffirmTransactionToMeshTransaction,
} from '~/utils/conversion';

interface SenderAffirm {
  party: ConfidentialAffirmParty.Sender;
  proofs: ConfidentialLegProof[];
}

interface ObserverAffirm {
  party: ConfidentialAffirmParty.Mediator | ConfidentialAffirmParty.Receiver;
}

export type AffirmConfidentialTransactionParams = { legId: BigNumber } & (
  | SenderAffirm
  | ObserverAffirm
);

export type Params = {
  transaction: ConfidentialTransaction;
} & AffirmConfidentialTransactionParams;

/**
 * @hidden
 */
export async function prepareAffirmConfidentialTransactions(
  this: Procedure<Params, ConfidentialTransaction>,
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
  this: Procedure<Params, ConfidentialTransaction>
): Promise<ProcedureAuthorization> {
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
export const affirmConfidentialTransactions = (): Procedure<Params, ConfidentialTransaction> =>
  new Procedure(prepareAffirmConfidentialTransactions, getAuthorization);
