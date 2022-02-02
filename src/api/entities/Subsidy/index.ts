import { Account, Context, Entity, quitSubsidy } from '~/internal';
import { NoArgsProcedureMethod } from '~/types';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  beneficiaryAddress: string;
  subsidizerAddress: string;
}

interface HumanReadable {
  beneficiary: string;
  subsidizer: string;
}

/**
 * Represents a Subsidy relationship on chain
 */
export class Subsidy extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { beneficiaryAddress, subsidizerAddress } = identifier as UniqueIdentifiers;

    return typeof beneficiaryAddress === 'string' && typeof subsidizerAddress === 'string';
  }

  /**
   * Account whose transactions are being paid for
   */
  public beneficiary: Account;
  /**
   * Account that is paying for the transactions
   */
  public subsidizer: Account;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    const { beneficiaryAddress, subsidizerAddress } = identifiers;

    super(identifiers, context);

    this.beneficiary = new Account({ address: beneficiaryAddress }, context);
    this.subsidizer = new Account({ address: subsidizerAddress }, context);

    this.quit = createProcedureMethod(
      { getProcedureAndArgs: () => [quitSubsidy, { subsidy: this }], voidArgs: true },
      context
    );
  }

  /**
   * Quit this Subsidy
   *
   * @note Both the beneficiary and the subsidizer are allowed to quit the Subsidy
   */
  public quit: NoArgsProcedureMethod<void>;

  /**
   * Determine whether this Subsidy relationship exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      beneficiary: { address: beneficiaryAddress },
      subsidizer: { address: subsidizerAddress },
      context,
    } = this;

    const subsidy = await context.accountSubsidy(beneficiaryAddress);

    return subsidy !== null && subsidy.subsidizer.address === subsidizerAddress;
  }

  /**
   * Return the Subsidy's static data
   */
  public toJson(): HumanReadable {
    const { beneficiary, subsidizer } = this;

    return toHumanReadable({
      beneficiary,
      subsidizer,
    });
  }
}
