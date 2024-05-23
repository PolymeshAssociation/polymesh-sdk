import { Context, FungibleAsset, issueTokens, Namespace } from '~/internal';
import { IssueTokensParams, ProcedureMethod } from '~/types';
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
   */
  public issue: ProcedureMethod<IssueTokensParams, FungibleAsset>;
}
