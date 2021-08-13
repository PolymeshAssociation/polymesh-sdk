import { UniqueIdentifiers } from '~/api/entities/Account';
import { Account, Context, Identity, leaveIdentity } from '~/internal';
import { ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.leaveIdentity = createProcedureMethod(
      { getProcedureAndArgs: () => [leaveIdentity, { account: this }] },
      context
    );
  }

  /**
   * Leave the current Identity. This operation can only be done if this Account is a secondary key for the Identity
   */
  public leaveIdentity: ProcedureMethod<void, void>;

  /**
   * Retrieve the current Identity (null if there is none)
   */
  public async getIdentity(): Promise<Identity | null> {
    const identity = await super.getIdentity();

    return identity && new Identity({ did: identity.did }, this.context);
  }
}
