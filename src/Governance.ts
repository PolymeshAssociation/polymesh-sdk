import { Identity } from '~/api/entities';
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
}
