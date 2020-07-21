import { Identity, Proposal } from '~/api/entities';
import { createProposal, CreateProposalParams } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import { identityIdToString } from '~/utils';

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
}
