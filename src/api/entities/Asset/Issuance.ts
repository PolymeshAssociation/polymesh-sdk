import BigNumber from 'bignumber.js';

import { Asset, Context, issueAsset, Namespace } from '~/internal';
import { ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Issuance related functionality
 */
export class Issuance extends Namespace<Asset> {
  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.issue = createProcedureMethod(
      { getProcedureAndArgs: args => [issueAsset, { ticker, ...args }] },
      context
    );
  }

  /**
   * Issue a certain amount of Assets to the caller's default portfolio
   *
   * @param args.amount - amount of Assets to be issued
   */
  public issue: ProcedureMethod<{ amount: BigNumber }, Asset>;
}
