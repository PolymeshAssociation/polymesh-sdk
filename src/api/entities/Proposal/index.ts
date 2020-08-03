import { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { cancelProposal, editProposal, EditProposalParams } from '~/api/procedures';
import { Entity, PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { eventByIndexedArgs, proposalVotes } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Pip } from '~/polkadot';
import { Ensured, ErrorCode, ResultSet } from '~/types';
import { u32ToBigNumber, valueToDid } from '~/utils';

import { ProposalStage, ProposalVote, ProposalVotesOrderByInput } from './types';

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
   * Check if an identity has voted on the proposal
   *
   * @param args.did - identity representation or identity ID as stored in the blockchain
   */
  public async identityHasVoted(args?: { did: string | Identity }): Promise<boolean> {
    const {
      context: { middlewareApi },
      pipId,
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      identity = context.getCurrentIdentity().did;
    }

    let result: ApolloQueryResult<Ensured<Query, 'eventByIndexedArgs'>>;
    try {
      result = await middlewareApi.query<Ensured<Query, 'eventByIndexedArgs'>>(
        eventByIndexedArgs({
          moduleId: ModuleIdEnum.Pips,
          eventId: EventIdEnum.Voted,
          eventArg0: identity,
          eventArg2: pipId.toString(),
        })
      );
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    if (result.data.eventByIndexedArgs) {
      return true;
    }

    return false;
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
  ): Promise<ResultSet<ProposalVote>> {
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

    const data = result.data.proposalVotes.map(({ account: did, vote: proposalVote, weight }) => {
      return {
        identity: new Identity({ did }, context),
        vote: proposalVote,
        weight: new BigNumber(weight),
      };
    });

    return {
      data,
      // TODO: replace by proper calculation once the query returns totalCount
      next: null,
    };
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

  /**
   * Cancel a proposal
   */
  public async cancel(): Promise<TransactionQueue<void>> {
    const { context, pipId } = this;
    return cancelProposal.prepare({ pipId }, context);
  }

  /**
   * Retrieve the proposal details
   */
  public async getDetails(): Promise<Pip> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
        },
      },
      pipId,
    } = this;

    const proposal = await pips.proposals(pipId);

    return proposal.unwrap();
  }

  /**
   * Retrieve the current stage of the proposal
   */
  public async getStage(): Promise<ProposalStage> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
          rpc,
        },
      },
      pipId,
    } = this;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [metadata, header] = await Promise.all([
      pips.proposalMetadata(pipId),
      (rpc as any).chain.getHeader(),
    ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { end: rawEnd, cool_off_until: rawCoolOff } = metadata.unwrap();
    const { number: rawBlockId } = header;

    const blockId = u32ToBigNumber(rawBlockId);
    const end = u32ToBigNumber(rawEnd);
    const coolOff = u32ToBigNumber(rawCoolOff);

    if (blockId.lt(coolOff)) {
      return ProposalStage.CoolOff;
    }

    if (blockId.gte(coolOff) && blockId.lt(end)) {
      return ProposalStage.Open;
    }

    return ProposalStage.Ended;
  }
}
