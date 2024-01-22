import { ConfidentialAccount, Context, createConfidentialAccount, PolymeshError } from '~/internal';
import { CreateConfidentialAccountParams, ErrorCode, ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Confidential Account related functionality
 */
export class ConfidentialAccounts {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.createConfidentialAccount = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createConfidentialAccount, { ...args }],
      },
      context
    );
  }

  /**
   * Retrieve a ConfidentialAccount
   */
  public async getConfidentialAccount(args: { publicKey: string }): Promise<ConfidentialAccount> {
    const { context } = this;
    const { publicKey } = args;

    const confidentialAsset = new ConfidentialAccount({ publicKey }, context);

    const identity = await confidentialAsset.getIdentity();

    if (!identity) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No confidential Account exists',
        data: { publicKey },
      });
    }

    return confidentialAsset;
  }

  /**
   * Create a confidential Account
   */
  public createConfidentialAccount: ProcedureMethod<
    CreateConfidentialAccountParams,
    ConfidentialAccount
  >;
}
