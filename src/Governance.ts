import { QueryableStorageEntry } from '@polkadot/api/types';
import { BlockNumber } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';

import { Identity, Proposal } from '~/api/entities';
import { createProposal, CreateProposalParams } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import { ProposalTimeFrames, SubCallback, UnsubCallback } from '~/types';
import { balanceToBigNumber, identityIdToString, u32ToBigNumber } from '~/utils';

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
   * Get the minimum amount of POLYX to be used as a deposit for create a public referendum proposal
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
   * Get how long in blocks the proposal cool off period and proposal ballot are valid
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
        ([rawCoolOff, rawDuration]) => {
          callback(assembleResult(rawCoolOff, rawDuration));
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
