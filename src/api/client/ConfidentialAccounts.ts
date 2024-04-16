import { Context, PolymeshError } from '@polymeshassociation/polymesh-sdk/internal';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';

import {
  applyIncomingAssetBalance,
  applyIncomingConfidentialAssetBalances,
  ConfidentialAccount,
  createConfidentialAccount,
} from '~/internal';
import {
  ApplyIncomingBalanceParams,
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialProcedureMethod,
  CreateConfidentialAccountParams,
} from '~/types';
import { createConfidentialProcedureMethod } from '~/utils/internal';

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

    this.createConfidentialAccount = createConfidentialProcedureMethod(
      {
        getProcedureAndArgs: args => [createConfidentialAccount, { ...args }],
      },
      context
    );

    this.applyIncomingBalance = createConfidentialProcedureMethod(
      {
        getProcedureAndArgs: args => [applyIncomingAssetBalance, { ...args }],
      },
      context
    );

    this.applyIncomingBalances = createConfidentialProcedureMethod(
      {
        getProcedureAndArgs: args => [applyIncomingConfidentialAssetBalances, { ...args }],
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
  public createConfidentialAccount: ConfidentialProcedureMethod<
    CreateConfidentialAccountParams,
    ConfidentialAccount
  >;

  /**
   * Applies incoming balance to a Confidential Account
   */
  public applyIncomingBalance: ConfidentialProcedureMethod<
    ApplyIncomingBalanceParams,
    ConfidentialAccount
  >;

  /**
   * Applies any incoming balance to a Confidential Account
   */
  public applyIncomingBalances: ConfidentialProcedureMethod<
    ApplyIncomingConfidentialAssetBalancesParams,
    ConfidentialAccount
  >;
}
