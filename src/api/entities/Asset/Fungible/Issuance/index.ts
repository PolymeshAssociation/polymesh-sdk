import BigNumber from 'bignumber.js';

import { Context, FungibleAsset, issueTokens, Namespace } from '~/internal';
import { ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Issuance related functionality
 */
export class Issuance extends Namespace<FungibleAsset> {
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.issue = createProcedureMethod(
      { getProcedureAndArgs: args => [issueTokens, { ticker, ...args }] },
      context
    );
  }

  /**
   * Issue a certain amount of Asset tokens to the caller's default portfolio
   *
   * @param args.amount - amount of Asset tokens to be issued
   */
  public issue: ProcedureMethod<{ amount: BigNumber }, FungibleAsset>;
}
