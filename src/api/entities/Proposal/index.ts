import { BlockHash } from '@polkadot/types/interfaces/chain';
import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { cancelProposal, editProposal, EditProposalParams } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { eventByIndexedArgs, proposalVotes } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, ResultSet } from '~/types';
import {
  balanceToBigNumber,
  meshProposalStateToProposalState,
  requestAtBlock,
  u32ToBigNumber,
  valueToDid,
} from '~/utils';

import { ProposalDetails, ProposalStage, ProposalVote, ProposalVotesOrderByInput } from './types';

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
   *
   * @note uses the middleware
   */
  public async identityHasVoted(args?: { did: string | Identity }): Promise<boolean> {
    const { pipId, context } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      ({ did: identity } = await context.getCurrentIdentity());
    }

    const result = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Pips,
        eventId: EventIdEnum.Voted,
        eventArg0: identity,
        eventArg2: pipId.toString(),
      })
    );

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
   *
   * @note uses the middleware
   */
  public async getVotes(
    opts: {
      vote?: boolean;
      orderBy?: ProposalVotesOrderByInput;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ProposalVote>> {
    const { pipId, context } = this;

    const { vote, orderBy, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'proposalVotes'>>(
      proposalVotes({
        pipId,
        vote,
        orderBy,
        count: size,
        skip: start,
      })
    );

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
   * Cancel the proposal
   */
  public async cancel(): Promise<TransactionQueue<void>> {
    const { context, pipId } = this;
    return cancelProposal.prepare({ pipId }, context);
  }

  /**
   * Retrieve the proposal details
   */
  public async getDetails(): Promise<ProposalDetails> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
        },
      },
      pipId,
    } = this;

    const rawProposal = await pips.proposals(pipId);
    const {
      state,
      proposal: { sectionName, methodName },
    } = rawProposal.unwrap();

    return {
      state: meshProposalStateToProposalState(state),
      module: sectionName,
      method: methodName,
    };
  }

  /**
   * Retrieve the current stage of the proposal
   */
  public async getStage(): Promise<ProposalStage> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
        },
      },
      context,
      pipId,
    } = this;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [metadata, blockNumber] = await Promise.all([
      pips.proposalMetadata(pipId),
      context.getLatestBlock(),
    ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { end: rawEnd, cool_off_until: rawCoolOff } = metadata.unwrap();

    const end = u32ToBigNumber(rawEnd);
    const coolOff = u32ToBigNumber(rawCoolOff);

    if (blockNumber.lt(coolOff)) {
      return ProposalStage.CoolOff;
    }

    if (blockNumber.lt(end)) {
      return ProposalStage.Open;
    }

    return ProposalStage.Ended;
  }

  /**
   * Retrieve the minimum amount of POLYX that must be bonded by aye votes for the proposal to be considered valid
   */
  public async minimumBondedAmount(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
          rpc: { chain },
        },
      },
      pipId,
    } = this;

    const [stage, metadata] = await Promise.all([this.getStage(), pips.proposalMetadata(pipId)]);

    const { end: endBlock } = metadata.unwrap();

    const opts: { args: []; blockHash?: BlockHash } = {
      args: [],
    };

    if (stage !== ProposalStage.Open) {
      const blockHash = await chain.getBlockHash(endBlock);
      opts.blockHash = blockHash;
    }

    const result = await requestAtBlock(pips.quorumThreshold, opts);

    return balanceToBigNumber(result);
  }
}
