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
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'approveAsKey'>>
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'rejectAsKey'>>
> {
  const {
    context: {
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

  const rawAddress = stringToAccountId(multiSigAddress, context);
  const rawProposalId = bigNumberToU64(id, context);
  const signingAccount = context.getSigningAccount();

  const rawSigner = signerToSignatory(signingAccount, context);

  const [creator, { signers: multiSigSigners }, { status }, hasVoted] = await Promise.all([
    proposal.multiSig.getCreator(),
    proposal.multiSig.details(),
    proposal.details(),
    votes([rawAddress, rawProposalId], rawSigner),
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

  if (boolToBoolean(hasVoted)) {
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
  if (action === MultiSigProposalAction.Approve) {
    transaction = multiSig.approveAsKey;
  } else {
    transaction = multiSig.rejectAsKey;
  }

  return {
    transaction,
    paidForBy: creator,
    args: [rawAddress, rawProposalId],
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
