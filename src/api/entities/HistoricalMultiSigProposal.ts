import BigNumber from 'bignumber.js';

import { Context, MultiSig, MultiSigProposal } from '~/internal';
import { Account, EventIdentifier, MultiSigProposalVote } from '~/types';

interface HumanReadable {
  multiSigAddress: string;
  proposalId: number;
}

/**
 * Represents a historical MultiSigProposal
 */
export class HistoricalMultiSigProposal {
  public proposalId: BigNumber;
  public multiSig: MultiSig;

  protected context: Context;

  /**
   * @hidden
   */
  public constructor(identifiers: HumanReadable, context: Context) {
    const { proposalId, multiSigAddress } = identifiers;

    this.context = context;

    this.proposalId = new BigNumber(proposalId);
    this.multiSig = new MultiSig({ address: multiSigAddress }, context);
  }

  /**
   * Get the MultiSigProposalVotes associated with this MultiSigProposal
   */
  public async votes(): Promise<MultiSigProposalVote[]> {
    const { multiSig, proposalId, context } = this;

    const multiSigProposal = new MultiSigProposal(
      { multiSigAddress: multiSig.address, id: proposalId },
      context
    );

    return multiSigProposal.votes();
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal was created
   *
   * @note uses the middlewareV2
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { multiSig, proposalId, context } = this;

    const multiSigProposal = new MultiSigProposal(
      { multiSigAddress: multiSig.address, id: proposalId },
      context
    );

    return multiSigProposal.createdAt();
  }

  /**
   * Retrieve the account which created this MultiSig Proposal
   *
   * @note uses the middlewareV2
   */
  public async creator(): Promise<Account | null> {
    const { multiSig, proposalId, context } = this;

    const multiSigProposal = new MultiSigProposal(
      { multiSigAddress: multiSig.address, id: proposalId },
      context
    );

    return multiSigProposal.creator();
  }

  /**
   * Return HistoricalMultiSigProposal static data
   */
  public toHuman(): HumanReadable {
    return {
      multiSigAddress: this.multiSig.address,
      proposalId: this.proposalId.toNumber(),
    };
  }
}
