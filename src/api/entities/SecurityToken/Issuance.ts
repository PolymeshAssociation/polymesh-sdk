import BigNumber from 'bignumber.js';

import { Context, issueTokens, Namespace, SecurityToken } from '~/internal';
import { ProcedureMethod } from '~/types/internal';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuance extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.issue = createProcedureMethod((args) => [issueTokens, { ticker, ...args }], context);
  }

  /**
   * Issue a certain amount of tokens to the primary issuance agent
   *
   * @param args.amount - amount of tokens to be issued to primary issuance agent
   */
  public issue: ProcedureMethod<{ amount: BigNumber }, SecurityToken>;
}
