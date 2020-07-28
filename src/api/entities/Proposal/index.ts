import { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { editProposal, EditProposalParams } from '~/api/procedures';
import { Entity, PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { proposalVotes } from '~/middleware/queries';
import { ProposalVotesOrderByInput, Query } from '~/middleware/types';
import { Ensured, ErrorCode } from '~/types';

import { ProposalVote } from './types';

/**
 * Properties that uniquely identify a Proposal
 */
export interface UniqueIdentifiers {
  pipId: number;
}

/**
 * Represents a Polymesh Improvement Proposal (PIP)
 */
export class Proposal extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { pipId } = identifier as UniqueIdentifiers;

    return typeof pipId === 'number';
  }

  /**
   * internal identifier
   */
  public pipId: number;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { pipId } = identifiers;

    this.pipId = pipId;
  }

  /**
   * Retrieve all the votes of the proposal. Can be filtered using parameters
   *
   * @param opts.vote - vote decision (positive or negative)
   * @param opts.orderBy - the order in witch the votes are returned
   * @param opts.size - number of votes in each requested page (default: 25)
   * @param opts.start - page offset
   */
  public async getVotes(
    opts: {
      vote?: boolean;
      orderBy?: ProposalVotesOrderByInput;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ProposalVote[]> {
    const {
      context: { middlewareApi },
      pipId,
      context,
    } = this;

    const { vote, orderBy, size, start } = opts;

    let result: ApolloQueryResult<Ensured<Query, 'proposalVotes'>>;
    try {
      result = await middlewareApi.query<Ensured<Query, 'proposalVotes'>>(
        proposalVotes({
          pipId,
          vote,
          orderBy,
          count: size,
          skip: start,
        })
      );
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    return result.data.proposalVotes.map(({ account: did, vote: proposalVote, weight }) => {
      return {
        account: new Identity({ did }, context),
        vote: proposalVote,
        weight: new BigNumber(weight),
      };
    });
  }

  /**
   * Edit a proposal
   *
   * @param args.discussionUrl - URL to the forum/messageboard/issue where the proposal is being discussed
   */
  public async edit(args: EditProposalParams): Promise<TransactionQueue<void>> {
    const { context, pipId } = this;
    return editProposal.prepare({ pipId, ...args }, context);
  }
}
