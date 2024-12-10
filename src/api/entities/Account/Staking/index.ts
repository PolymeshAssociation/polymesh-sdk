import { Account, bondPolyx, Context, Namespace } from '~/internal';
import { BondPolyxParams, ProcedureMethod } from '~/types';
import { accountIdToString, stringToAccountId } from '~/utils/conversion';
import { asAccount, createProcedureMethod } from '~/utils/internal';

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

  /**
   * Fetch the controller associated to this account if there is one
   *
   * @note if this is set it implies this account is a stash account
   */
  public async getController(): Promise<Account | null> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawId = stringToAccountId(this.parent.address, context);

    const rawController = await query.staking.bonded(rawId);

    if (rawController.isNone) {
      return null;
    }

    const unwrapped = rawController.unwrap();

    console.log('unwrap', unwrapped.toString());

    const address = accountIdToString(rawController.unwrap());

    console.log('address: ', address);

    return new Account({ address }, context);
  }
}
