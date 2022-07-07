import BigNumber from 'bignumber.js';

import {
  Account,
  Context,
  Entity,
  modifyAllowance,
  ModifyAllowanceParams,
  PolymeshError,
  quitSubsidy,
} from '~/internal';
import {
  AllowanceOperation,
  DecreaseAllowanceParams,
  ErrorCode,
  IncreaseAllowanceParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetAllowanceParams,
} from '~/types';
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
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
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
    const { beneficiary, subsidizer } = identifiers;

    super(identifiers, context);

    this.beneficiary = new Account({ address: beneficiary }, context);
    this.subsidizer = new Account({ address: subsidizer }, context);

    this.quit = createProcedureMethod(
      { getProcedureAndArgs: () => [quitSubsidy, { subsidy: this }], voidArgs: true },
      context
    );

    this.setAllowance = createProcedureMethod<
      Pick<ModifyAllowanceParams, 'allowance'>,
      ModifyAllowanceParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAllowance,
          {
            ...args,
            subsidy: this,
            operation: AllowanceOperation.Set,
          } as ModifyAllowanceParams,
        ],
      },
      context
    );

    this.increaseAllowance = createProcedureMethod<
      Pick<ModifyAllowanceParams, 'allowance'>,
      ModifyAllowanceParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAllowance,
          {
            ...args,
            subsidy: this,
            operation: AllowanceOperation.Increase,
          } as ModifyAllowanceParams,
        ],
      },
      context
    );

    this.decreaseAllowance = createProcedureMethod<
      Pick<ModifyAllowanceParams, 'allowance'>,
      ModifyAllowanceParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAllowance,
          {
            ...args,
            subsidy: this,
            operation: AllowanceOperation.Decrease,
          } as ModifyAllowanceParams,
        ],
      },
      context
    );
  }

  /**
   * Terminate this Subsidy relationship. The beneficiary Account will be forced to pay for their own transactions
   *
   * @note both the beneficiary and the subsidizer are allowed to unilaterally quit the Subsidy
   */
  public quit: NoArgsProcedureMethod<void>;

  /**
   * Set allowance for this Subsidy relationship
   *
   * @note Only the subsidizer is allowed to set the allowance
   *
   * @throws if the allowance to set is equal to the current allowance
   */
  public setAllowance: ProcedureMethod<Pick<SetAllowanceParams, 'allowance'>, void>;

  /**
   * Increase allowance for this Subsidy relationship
   *
   * @note Only the subsidizer is allowed to increase the allowance
   */
  public increaseAllowance: ProcedureMethod<Pick<IncreaseAllowanceParams, 'allowance'>, void>;

  /**
   * Decrease allowance for this Subsidy relationship
   *
   * @note Only the subsidizer is allowed to decrease the allowance
   *
   * @throws if the amount to decrease by is more than the existing allowance
   */
  public decreaseAllowance: ProcedureMethod<Pick<DecreaseAllowanceParams, 'allowance'>, void>;

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
  public toHuman(): HumanReadable {
    const { beneficiary, subsidizer } = this;

    return toHumanReadable({
      beneficiary,
      subsidizer,
    });
  }
}
