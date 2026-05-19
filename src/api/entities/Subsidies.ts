import { Account, Namespace, PolymeshError, Subsidy } from '~/internal';
import { ErrorCode, SubCallback, SubsidyWithAllowance, UnsubCallback } from '~/types';
import { accountIdToString, balanceToBigNumber, stringToAccountId } from '~/utils/conversion';

/**
 * Handles all Account Subsidies related functionality
 */
export class Subsidies extends Namespace<Account> {
  /**
   * Get the list of Subsidy relationship along with their subsidized amount for which this Account is the subsidizer
   */
  public async getBeneficiaries(): Promise<SubsidyWithAllowance[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            relayer: { subsidies },
          },
        },
      },
      context,
      parent: { address: subsidizer },
    } = this;

    const rawSubsidizer = stringToAccountId(subsidizer, context);

    const entries = await subsidies.entries();

    return entries.reduce<SubsidyWithAllowance[]>(
      (
        result,
        [
          {
            args: [rawBeneficiary],
          },
          rawSubsidy,
        ]
      ) => {
        const { payingKey, remaining } = rawSubsidy.unwrap();

        if (rawSubsidizer.eq(payingKey)) {
          const beneficiary = accountIdToString(rawBeneficiary);
          const subsidy = new Subsidy({ beneficiary, subsidizer }, context);
          const allowance = balanceToBigNumber(remaining);

          return [...result, { subsidy, allowance }];
        }

        return result;
      },
      []
    );
  }

  /**
   * Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.
   *
   * @returns the Subsidy relationship, or null if this Account isn't being subsidized
   */
  public getSubsidizer(): Promise<SubsidyWithAllowance | null>;

  /**
   * Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.
   *
   * @param callback - Callback function that can be used to listen for changes to the subsidy relationship
   *
   * @note can be subscribed to, if connected to node using a web socket
   * @returns the Subsidy relationship, or null if this Account isn't being subsidized
   */
  public getSubsidizer(callback: SubCallback<SubsidyWithAllowance | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getSubsidizer(
    callback?: SubCallback<SubsidyWithAllowance | null>
  ): Promise<SubsidyWithAllowance | null | UnsubCallback> {
    const {
      context,
      parent: { address },
    } = this;

    if (callback) {
      context.assertSupportsSubscription();
      return context.accountSubsidy(address, callback);
    }

    return context.accountSubsidy(address);
  }

  /**
   * Get pending subsidies (for which this Account is the beneficiary) that have been authorised but not yet accepted.
   *
   * @note this method is supported only with v8 chains
   */
  public getPendingSubsidies(): Promise<SubsidyWithAllowance[]> {
    const { context } = this;

    if (context.isV7) {
      throw new PolymeshError({
        code: ErrorCode.NotSupported,
        message: 'This method is only supported in chain v8',
      });
    }

    return context.getPendingSubsidies();
  }
}
