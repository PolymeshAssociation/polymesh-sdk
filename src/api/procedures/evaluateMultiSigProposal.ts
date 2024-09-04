import { MultiSigProposal, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MultiSigProposalAction, ProposalStatus } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU64,
  boolToBoolean,
  signerToSignatory,
  signerToSignerValue,
  stringToAccountId,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface MultiSigProposalVoteParams {
  action: MultiSigProposalAction;
  proposal: MultiSigProposal;
}

/**
 * @hidden
 */
export async function prepareMultiSigProposalEvaluation(
  this: Procedure<MultiSigProposalVoteParams, void>,
  args: MultiSigProposalVoteParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'approve'>>
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'reject'>>
> {
  const {
    context: {
      isV6,
      polymeshApi: {
        tx: { multiSig },
        query: {
          multiSig: { votes },
        },
      },
    },
    context,
  } = this;
  const {
    proposal: {
      id,
      multiSig: { address: multiSigAddress },
    },
    proposal,
    action,
  } = args;

  const rawMultiSigAddress = stringToAccountId(multiSigAddress, context);
  const rawProposalId = bigNumberToU64(id, context);
  const signingAccount = context.getSigningAccount();

  /* istanbul ignore next: this will be removed after dual version support for v6-v7 */
  const rawSigner = isV6
    ? signerToSignatory(signingAccount, context)
    : stringToAccountId(signingAccount.address, context);

  const [
    payer,
    { signers: multiSigSigners },
    { status, approvalAmount, rejectionAmount },
    hasVoted,
  ] = await Promise.all([
    proposal.multiSig.getPayer(),
    proposal.multiSig.details(),
    proposal.details(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    votes([rawMultiSigAddress, rawProposalId], rawSigner as any), // NOSONAR
  ]);

  if (
    !multiSigSigners.some(
      multiSigSigner => signerToSignerValue(multiSigSigner).value === signingAccount.address
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Account is not a signer of the MultiSig',
    });
  }

  const totalVotes = approvalAmount.plus(rejectionAmount).toNumber();

  if (boolToBoolean(hasVoted) && totalVotes > 1) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Account has already voted for this MultiSig Proposal',
    });
  }

  let errorCode = ErrorCode.UnmetPrerequisite;
  let message;

  switch (status) {
    case ProposalStatus.Invalid:
      errorCode = ErrorCode.DataUnavailable;
      message = 'The MultiSig Proposal does not exist';
      break;
    case ProposalStatus.Rejected:
      message = 'The MultiSig Proposal has already been rejected';
      break;
    case ProposalStatus.Successful:
    case ProposalStatus.Failed:
      message = 'The MultiSig Proposal has already been executed';
      break;
    case ProposalStatus.Expired:
      message = 'The MultiSig Proposal has expired';
      break;
  }

  if (message) {
    throw new PolymeshError({
      code: errorCode,
      message,
    });
  }

  let transaction;
  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (isV6) {
    transaction =
      action === MultiSigProposalAction.Approve
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (multiSig as any).approveAsKey // NOSONAR
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (multiSig as any).rejectAsKey; // NOSONAR
  } else {
    transaction = action === MultiSigProposalAction.Approve ? multiSig.approve : multiSig.reject;
  }

  return {
    transaction,
    paidForBy: payer ?? undefined,
    args: [rawMultiSigAddress, rawProposalId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const evaluateMultiSigProposal = (): Procedure<MultiSigProposalVoteParams, void> =>
  new Procedure(prepareMultiSigProposalEvaluation, {
    signerPermissions: true,
  });
