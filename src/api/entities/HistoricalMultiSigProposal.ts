import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';
import { multiSigProposalVotesQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { MultiSigProposalVote, SignerType } from '~/types';
import { Ensured } from '~/types/utils';
import { middlewareEventDetailsToEventIdentifier, signerValueToSigner } from '~/utils/conversion';

export type MiddlewareMultiSigProposal = {
  id: string;
  proposalId: number;
  multisigId: string;
  approvalCount: number;
  rejectionCount: number;
  creator?: {
    did: string;
  };
  status: string;
  createdBlockId: string;
  updatedBlockId: string;
  datetime: Date;
};

type MiddlewareMultiSigProposalUniqueIdentifiers = Pick<MiddlewareMultiSigProposal, 'id'>;

export interface HumanReadable {
  id: string;
  proposalId: number;
  multisigId: string;
  approvalCount: number;
  rejectionCount: number;
  creatorDid?: string;
  status: string;
  createdBlockId: string;
  updatedBlockId: string;
  datetime: string;
}

enum MultiSigStatusEnum {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}

/**
 * Represents historical MultiSigProposal that no longer exists on chain
 */
export class HistoricalMultiSigProposal extends Entity<
  MiddlewareMultiSigProposalUniqueIdentifiers,
  HumanReadable
> {
  public id: string;
  public proposalId: BigNumber;
  public multisigId: string;
  public approvalCount: BigNumber;
  public rejectionCount: BigNumber;
  public creatorDid?: string;
  public status: MultiSigStatusEnum;
  public createdBlockId: string;
  public updatedBlockId: string;
  public datetime: Date;

  /**
   * @hidden
   */
  public constructor(
    identifiers: MiddlewareMultiSigProposalUniqueIdentifiers,
    proposal: MiddlewareMultiSigProposal,
    context: Context
  ) {
    const { id } = identifiers;

    const {
      proposalId,
      multisigId,
      approvalCount,
      rejectionCount,
      creator,
      status,
      createdBlockId,
      updatedBlockId,
      datetime,
    } = proposal;
    super({ id }, context);

    this.id = id;
    this.proposalId = new BigNumber(proposalId);
    this.multisigId = multisigId;
    this.approvalCount = new BigNumber(approvalCount);
    this.rejectionCount = new BigNumber(rejectionCount);
    this.creatorDid = creator?.did;
    this.status = status as MultiSigStatusEnum;
    this.createdBlockId = createdBlockId;
    this.updatedBlockId = updatedBlockId;
    this.datetime = datetime;
  }

  /**
   * @hidden
   * Check if a value is of type {@link MiddlewareMultiSigProposalUniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(
    identifier: unknown
  ): identifier is MiddlewareMultiSigProposalUniqueIdentifiers {
    const { id } = identifier as MiddlewareMultiSigProposalUniqueIdentifiers;

    return typeof id === 'string';
  }

  /**
   * @hidden
   */
  public exists(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Determine whether this Entity is the same as another one
   */
  public override isEqual(entity: HistoricalMultiSigProposal): boolean {
    return entity.id === this.id;
  }

  /**
   * Get the MultiSigProposalVotes associated with this MultiSigProposal
   */
  public async getVotes(): Promise<MultiSigProposalVote[]> {
    const {
      context: { queryMiddleware },
      id: proposalId,
      context,
    } = this;

    const {
      data: {
        multiSigProposalVotes: { nodes: signerVotes },
      },
    } = await queryMiddleware<Ensured<Query, 'multiSigProposalVotes'>>(
      multiSigProposalVotesQuery({
        proposalId,
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
   * Return HistoricalMultiSigProposal static data
   */
  public toHuman(): HumanReadable {
    return {
      id: this.id,
      proposalId: this.proposalId.toNumber(),
      multisigId: this.multisigId,
      approvalCount: this.approvalCount.toNumber(),
      rejectionCount: this.rejectionCount.toNumber(),
      creatorDid: this.creatorDid,
      status: this.status,
      createdBlockId: this.createdBlockId,
      updatedBlockId: this.updatedBlockId,
      datetime: this.datetime.toISOString(),
    };
  }
}
