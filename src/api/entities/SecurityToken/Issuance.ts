import BigNumber from 'bignumber.js';

import { Context, issueTokens, Namespace, SecurityToken } from '~/internal';
import { ProcedureMethod } from '~/types';
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

    this.issue = createProcedureMethod(
      { getProcedureAndArgs: args => [issueTokens, { ticker, ...args }] },
      context
    );
  }

  /**
   * Issue a certain amount of tokens to the caller's default portfolio
   *
   * @param args.amount - amount of tokens to be issued
   */
  public issue: ProcedureMethod<{ amount: BigNumber }, SecurityToken>;
}
