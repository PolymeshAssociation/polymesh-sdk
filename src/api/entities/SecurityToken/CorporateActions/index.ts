import {
  Context,
  Identity,
  Namespace,
  removeCorporateActionsAgent,
  SecurityToken,
} from '~/internal';
import { ProcedureMethod } from '~/types/internal';
import { identityIdToString, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

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

    const { ticker } = parent;

    this.distributions = new Distributions(parent, context);

    this.removeAgent = createProcedureMethod(
      () => [removeCorporateActionsAgent, { ticker }],
      context
    );
  }

  /**
   * Remove the Corporate Actions Agent of the Security Token
   *
   * @note this action will leave the Security Token owner as the Corporate Actions Agent
   *
   * @note required role:
   *   - Security Token Owner
   */
  public removeAgent: ProcedureMethod<void, void>;

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
