import { QueryableStorageEntry } from '@polkadot/api/types';
import { BlockNumber } from '@polkadot/types/interfaces/runtime';
import { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';

import { Identity, Proposal } from '~/api/entities';
import { ProposalState } from '~/api/entities/Proposal/types';
import { createProposal, CreateProposalParams } from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { proposals } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  Ensured,
  ErrorCode,
  ProposalOrderByInput,
  ProposalTimeFrames,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { balanceToBigNumber, identityIdToString, u32ToBigNumber, valueToDid } from '~/utils';

/**
 * Handles all Governance related functionality
 */
export class Governance {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Retrieve a list of all active committee members
   */
  public async getGovernanceCommitteeMembers(): Promise<Identity[]> {
    const {
      context: {
        polymeshApi: {
          query: { committeeMembership },
        },
      },
      context,
    } = this;

    const activeMembers = await committeeMembership.activeMembers();

    return activeMembers.map(member => new Identity({ did: identityIdToString(member) }, context));
  }

  /**
   * Retrieve a list of proposals. Can be filtered using parameters
   *
   * @param opts.proposers - identities (or identity IDs) for which to fetch proposals. Defaults to all proposers
   * @param opts.states - state of the proposal
   * @param opts.orderBy - the order in which the proposals are returned
   * @param opts.size - page size
   * @param opts.start - page offset
   */
  public async getProposals(
    opts: {
      proposers?: (string | Identity)[];
      states?: ProposalState[];
      orderBy?: ProposalOrderByInput;
      size?: number;
      start?: number;
    } = {}
  ): Promise<Proposal[]> {
    const {
      context: { middlewareApi },
      context,
    } = this;

    const { proposers, states, orderBy, size, start } = opts;

    let result: ApolloQueryResult<Ensured<Query, 'proposals'>>;

    try {
      result = await middlewareApi.query<Ensured<Query, 'proposals'>>(
        proposals({
          proposers: proposers?.map(proposer => valueToDid(proposer)),
          states,
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

    return result.data.proposals.map(({ pipId }) => new Proposal({ pipId }, context));
  }

  /**
   * Create a proposal
   *
   * @param args.discussionUrl - URL to the forum/messageboard/issue where the proposal is being discussed
   * @param args.bondAmount - amount of POLYX that will be bonded initially in support of the proposal
   * @param args.tag - tag associated with the transaction that will be executed if the proposal passes
   * @param args.args - arguments passed to the transaction
   */
  public async createProposal(args: CreateProposalParams): Promise<TransactionQueue<Proposal>> {
    return createProposal.prepare(args, this.context);
  }

  /**
   * Get the minimum amount of POLYX that has to be deposited when creating a proposal
   *
   * @note can be subscribed to
   */
  public async minimumProposalDeposit(): Promise<BigNumber>;
  public async minimumProposalDeposit(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async minimumProposalDeposit(
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
        },
      },
    } = this;

    if (callback) {
      return pips.minimumProposalDeposit(res => {
        callback(balanceToBigNumber(res));
      });
    }

    const minimumProposalDeposit = await pips.minimumProposalDeposit();

    return balanceToBigNumber(minimumProposalDeposit);
  }

  /**
   * Retrieve the proposal time frames. This includes:
   *
   * - Amount of blocks from proposal creation until the proposal can be voted on (cool off)
   * - Amount of blocks from when cool off ends until the voting period is over (duration)
   *
   * @note can be subscribed to
   */
  public async proposalTimeFrames(): Promise<ProposalTimeFrames>;
  public async proposalTimeFrames(
    callback: SubCallback<ProposalTimeFrames>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async proposalTimeFrames(
    callback?: SubCallback<ProposalTimeFrames>
  ): Promise<ProposalTimeFrames | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { pips },
          queryMulti,
        },
      },
    } = this;

    const assembleResult = (
      coolOffPeriod: BlockNumber,
      proposalDuration: BlockNumber
    ): ProposalTimeFrames => {
      return {
        coolOff: u32ToBigNumber(coolOffPeriod).toNumber(),
        duration: u32ToBigNumber(proposalDuration).toNumber(),
      };
    };

    if (callback) {
      // NOTE @shuffledex: the type assertions are necessary because queryMulti doesn't play nice with strict types
      return queryMulti<[BlockNumber, BlockNumber]>(
        [
          [pips.proposalCoolOffPeriod as QueryableStorageEntry<'promise'>],
          [pips.proposalDuration as QueryableStorageEntry<'promise'>],
        ],
        ([rawCoolOffPeriod, rawProposalDuration]) => {
          callback(assembleResult(rawCoolOffPeriod, rawProposalDuration));
        }
      );
    }

    // NOTE @shuffledex: the type assertions are necessary because queryMulti doesn't play nice with strict types
    const [rawCoolOff, rawDuration] = await queryMulti<[BlockNumber, BlockNumber]>([
      [pips.proposalCoolOffPeriod as QueryableStorageEntry<'promise'>],
      [pips.proposalDuration as QueryableStorageEntry<'promise'>],
    ]);

    return assembleResult(rawCoolOff, rawDuration);
  }
}
