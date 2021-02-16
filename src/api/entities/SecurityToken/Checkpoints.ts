import { Context, createCheckpoint, Namespace, SecurityToken } from '~/internal';
import { ProcedureMethod } from '~/types/internal';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Checkpoints related functionality
 */
export class Checkpoints extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.create = createProcedureMethod(() => [createCheckpoint, { ticker }], context);
  }

  /**
   * Create a snapshot of Security Token holders and their respective balances at this moment
   *
   * @note required role:
   *   - Security Token Owner
   */
  public create: ProcedureMethod<void, SecurityToken>;
}
