import { Context, Identity, Namespace, SecurityToken } from '~/internal';
import { identityIdToString, stringToTicker } from '~/utils/conversion';

import { Distributions } from './Distributions';

/**
 * Handles all Security Token Corporate Actions related functionality
 */
export class CorporateActions extends Namespace<SecurityToken> {
  public distributions: Distributions;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    this.distributions = new Distributions(parent, context);
  }

  /**
   * Retrieve the Security Token's Corporate Actions agent
   */
  public async getAgent(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { corporateAction },
        },
      },
      parent: { ticker },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const agent = await corporateAction.agent(rawTicker);

    if (agent.isNone) {
      const token = new SecurityToken({ ticker }, context);
      const { owner } = await token.details();
      return owner;
    }

    return new Identity({ did: identityIdToString(agent.unwrap()) }, context);
  }
}
