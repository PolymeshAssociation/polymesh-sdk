import { BigNumber } from 'bignumber.js';

import { Context, Entity, evaluateMultiSigProposal, MultiSig, PolymeshError } from '~/internal';
import { multiSigProposalQuery, multiSigProposalVotesQuery } from '~/middleware/queries';
import { MultiSigProposal as MiddlewareMultiSigProposal, Query } from '~/middleware/types';
import {
  Account,
  ErrorCode,
  EventIdentifier,
  MultiSigProposalAction,
  MultiSigProposalDetails,
  MultiSigProposalVote,
  NoArgsProcedureMethod,
  SignerType,
  TxTag,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  bigNumberToU64,
  boolToBoolean,
  meshProposalStatusToProposalStatus,
  middlewareEventDetailsToEventIdentifier,
  momentToDate,
  signerValueToSigner,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { asAccount, assertAddressValid, createProcedureMethod, optionize } from '~/utils/internal';

interface UniqueIdentifiers {
  multiSigAddress: string;
  id: BigNumber;
}

export interface HumanReadable {
  multiSigAddress: string;
  id: string;
}

/**
 * A proposal for a MultiSig transaction. This is a wrapper around an extrinsic that will be executed when the amount of approvals reaches the signature threshold set on the MultiSig Account
 */
export class MultiSigProposal extends Entity<UniqueIdentifiers, HumanReadable> {
  public multiSig: MultiSig;
  public id: BigNumber;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { multiSigAddress, id } = identifiers;

    assertAddressValid(multiSigAddress, context.ss58Format);

    this.multiSig = new MultiSig({ address: multiSigAddress }, context);
    this.id = id;

    this.approve = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          evaluateMultiSigProposal,
          { proposal: this, action: MultiSigProposalAction.Approve },
        ],
        voidArgs: true,
      },
      context
    );

    this.reject = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          evaluateMultiSigProposal,
          { proposal: this, action: MultiSigProposalAction.Reject },
        ],
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Approve this MultiSig proposal
   */
  public approve: NoArgsProcedureMethod<void>;

  /**
   * Reject this MultiSig proposal
   */
  public reject: NoArgsProcedureMethod<void>;

  /**
   * Fetches the details of the Proposal. This includes the amount of approvals and rejections, the expiry, and details of the wrapped extrinsic
   */
  public async details(): Promise<MultiSigProposalDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSig: { address: multiSigAddress },
      id,
      context,
    } = this;

    const rawMultiSignAddress = stringToAccountId(multiSigAddress, context);
    const rawId = bigNumberToU64(id, context);

    const [
      {
        approvals: rawApprovals,
        rejections: rawRejections,
        status: rawStatus,
        expiry: rawExpiry,
        autoClose: rawAutoClose,
      },
      proposalOpt,
    ] = await Promise.all([
      multiSig.proposalDetail(rawMultiSignAddress, rawId),
      multiSig.proposals(rawMultiSignAddress, rawId),
    ]);

    if (proposalOpt.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Proposal with ID: "${id}" was not found. It may have already been executed`,
      });
    }

    const proposal = proposalOpt.unwrap();
    const { method, section } = proposal;
    const { args } = proposal.toJSON();

    const approvalAmount = u64ToBigNumber(rawApprovals);
    const rejectionAmount = u64ToBigNumber(rawRejections);
    const expiry = optionize(momentToDate)(rawExpiry.unwrapOr(null));
    const status = meshProposalStatusToProposalStatus(rawStatus, expiry);
    const autoClose = boolToBoolean(rawAutoClose);

    return {
      approvalAmount,
      rejectionAmount,
      status,
      expiry,
      autoClose,
      args,
      txTag: `${section}.${method}` as TxTag,
    };
  }

  /**
   * Determines whether this Proposal exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSig: { address: multiSigAddress },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const rawMultiSignAddress = stringToAccountId(multiSigAddress, context);
    const rawProposal = await multiSig.proposals(rawMultiSignAddress, rawId);

    return rawProposal.isSome;
  }

  /**
   * Returns a human readable representation
   */
  public toHuman(): HumanReadable {
    const {
      multiSig: { address: multiSigAddress },
      id,
    } = this;

    return {
      multiSigAddress,
      id: id.toString(),
    };
  }

  /**
   * Fetches the individual votes for this MultiSig proposal and their identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal Vote was casted
   *
   * @note uses the middlewareV2
   */
  public async votes(): Promise<MultiSigProposalVote[]> {
    const {
      multiSig: { address },
      id,
      context,
    } = this;

    const {
      data: {
        multiSigProposalVotes: { nodes: signerVotes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'multiSigProposalVotes'>>(
      multiSigProposalVotesQuery({
        proposalId: `${address}/${id.toString()}`,
      })
    );

    return signerVotes.map(signerVote => {
      const { signer, action, createdBlock, eventIdx } = signerVote;

      const { signerType, signerValue } = signer!;
      return {
        signer: signerValueToSigner(
          { type: signerType as unknown as SignerType, value: signerValue },
          context
        ),
        action: action!,
        ...middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx),
      };
    });
  }

  /**
   * @hidden
   *
   * Queries the SQ to get MultiSig Proposal details
   */
  private async getProposalDetails(): Promise<MiddlewareMultiSigProposal | null> {
    const {
      context,
      id,
      multiSig: { address },
    } = this;
    const {
      data: {
        multiSigProposals: {
          nodes: [node],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'multiSigProposals'>>(
      multiSigProposalQuery({
        multisigId: address,
        proposalId: id.toNumber(),
      })
    );
    return node;
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const proposal = await this.getProposalDetails();

    return optionize(middlewareEventDetailsToEventIdentifier)(
      proposal?.createdBlock,
      proposal?.eventIdx
    );
  }

  /**
   * Retrieve the account which created this MultiSig Proposal
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async creator(): Promise<Account | null> {
    const { context } = this;
    const proposal = await this.getProposalDetails();

    return optionize(asAccount)(proposal?.creatorAccount, context);
  }
}
