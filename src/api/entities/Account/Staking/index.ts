import { bondPolyx, Context, Namespace } from '~/internal';
import { Account, BondPolyxParams, ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Staking related functionality
 */
export class Staking extends Namespace<Account> {
  /**
   * @hidden
   */
  constructor(parent: Account, context: Context) {
    super(parent, context);

    this.bond = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          bondPolyx,
          { ...args, payee: this.parent, controller: this.parent },
        ],
      },
      context
    );
  }

  /**
   * Bond POLYX for staking
   */
  public bond: ProcedureMethod<BondPolyxParams, void>;
}
