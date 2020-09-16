import { QueryableStorageEntry } from '@polkadot/api/types';
import { BlockNumber } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';
import { TxTag } from 'polymesh-types/types';

import { Identity, Proposal } from '~/api/entities';
import {
  ProposalOrderByInput,
  ProposalState,
  ProposalTimeFrames,
} from '~/api/entities/Proposal/types';
import { createProposal, CreateProposalParams } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { proposals } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  Ensured,
  ProposalWithDetails,
  SubCallback,
  TransactionArgument,
  UnsubCallback,
} from '~/types';
import {
  addressToKey,
  balanceToBigNumber,
  identityIdToString,
  middlewareProposalToProposalDetails,
  u32ToBigNumber,
} from '~/utils';

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
   * Retrieve the types of arguments that a certain transaction requires to be run
   *
   * @param args.tag - tag associated with the transaction that will be executed if the proposal passes
   */
  public getTransactionArguments(args: { tag: TxTag }): TransactionArgument[] {
    return this.context.getTransactionArguments(args);
  }

  /**
   * Retrieve a list of proposals and their respective details. Can be filtered using parameters
   *
   * @note details for a single proposal can be fetched using the `Proposal` entity's `getDetails` method
   *
   * @param opts.proposers -  accounts for which to fetch proposals. Defaults to all proposers
   * @param opts.states - state of the proposal
   * @param opts.orderBy - the order in which the proposals are returned
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware
   */
  public async getProposals(
    opts: {
      proposers?: string[];
      states?: ProposalState[];
      orderBy?: ProposalOrderByInput;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ProposalWithDetails[]> {
    const { context } = this;

    const { proposers, states, orderBy, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'proposals'>>(
      proposals({
        proposers: proposers?.map(proposer => addressToKey(proposer)),
        states,
        orderBy,
        count: size,
        skip: start,
      })
    );

    const proposalsWithDetails = result.data.proposals.map(rawProposal => {
      const { pipId } = rawProposal;
      const proposal = new Proposal({ pipId: new BigNumber(pipId) }, context);
      return {
        proposal,
        details: middlewareProposalToProposalDetails(rawProposal, context),
      };
    });

    return proposalsWithDetails;
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

  /**
   * Returns the minimum stake a proposal must gather in order to be considered by the committee
   *
   * @note can be subscribed to
   */
  public async minimumBondedAmount(): Promise<BigNumber>;
  public async minimumBondedAmount(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async minimumBondedAmount(
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
      return pips.quorumThreshold(res => {
        callback(balanceToBigNumber(res));
      });
    }

    const quorumThreshold = await pips.quorumThreshold();

    return balanceToBigNumber(quorumThreshold);
  }
}
