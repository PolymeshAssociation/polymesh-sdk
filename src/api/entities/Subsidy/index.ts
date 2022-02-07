import BigNumber from 'bignumber.js';

import { Account, Context, Entity, PolymeshError, quitSubsidy } from '~/internal';
import { ErrorCode, NoArgsProcedureMethod } from '~/types';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  /**
   * beneficiary address
   */
  beneficiary: string;
  /**
   * subsidizer address
   */
  subsidizer: string;
}

type HumanReadable = UniqueIdentifiers;

/**
 * Represents a Subsidy relationship on chain
 */
export class Subsidy extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { beneficiary, subsidizer } = identifier as UniqueIdentifiers;

    return typeof beneficiary === 'string' && typeof subsidizer === 'string';
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
    const { beneficiary: beneficiaryAddress, subsidizer: subsidizerAddress } = identifiers;

    super(identifiers, context);

    this.beneficiary = new Account({ address: beneficiaryAddress }, context);
    this.subsidizer = new Account({ address: subsidizerAddress }, context);

    this.quit = createProcedureMethod(
      { getProcedureAndArgs: () => [quitSubsidy, { subsidy: this }], voidArgs: true },
      context
    );
  }

  /**
   * Terminate this Subsidy relationship. The beneficiary Account will be forced to pay for their own transactions
   *
   * @note Both the beneficiary and the subsidizer are allowed to unilaterally quit the Subsidy
   */
  public quit: NoArgsProcedureMethod<void>;

  /**
   * Determine whether this Subsidy relationship exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      beneficiary: { address: beneficiaryAddress },
      subsidizer,
      context,
    } = this;

    const subsidyWithAllowance = await context.accountSubsidy(beneficiaryAddress);

    return (
      subsidyWithAllowance !== null && subsidyWithAllowance.subsidy.subsidizer.isEqual(subsidizer)
    );
  }

  /**
   * Get amount of POLYX subsidized for this Subsidy relationship
   *
   * @throws if the Subsidy does not exist
   */
  public async getAllowance(): Promise<BigNumber> {
    const {
      beneficiary: { address: beneficiaryAddress },
      subsidizer,
      context,
    } = this;

    const subsidyWithAllowance = await context.accountSubsidy(beneficiaryAddress);

    if (!subsidyWithAllowance || !subsidyWithAllowance.subsidy.subsidizer.isEqual(subsidizer)) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Subsidy no longer exists',
      });
    }

    return subsidyWithAllowance.allowance;
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
