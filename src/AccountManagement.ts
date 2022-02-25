import {
  Account,
  AuthorizationRequest,
  Context,
  inviteAccount,
  InviteAccountParams,
  leaveIdentity,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryAccounts,
  RemoveSecondaryAccountsParams,
  subsidizeAccount,
  SubsidizeAccountParams,
  toggleFreezeSecondaryAccounts,
} from '~/internal';
import {
  AccountBalance,
  NoArgsProcedureMethod,
  PermissionType,
  ProcedureMethod,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles functionality related to Account Management
 */
export class AccountManagement {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.leaveIdentity = createProcedureMethod(
      { getProcedureAndArgs: () => [leaveIdentity, undefined], voidArgs: true },
      context
    );
    this.removeSecondaryAccounts = createProcedureMethod(
      {
        getProcedureAndArgs: args => [removeSecondaryAccounts, { ...args }],
      },
      context
    );
    this.revokePermissions = createProcedureMethod<
      { secondaryAccounts: Account[] },
      ModifySignerPermissionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => {
          const { secondaryAccounts } = args;
          const accounts = secondaryAccounts.map(account => {
            return {
              account,
              permissions: {
                tokens: { type: PermissionType.Include, values: [] },
                transactions: { type: PermissionType.Include, values: [] },
                portfolios: { type: PermissionType.Include, values: [] },
              },
            };
          });
          return [modifySignerPermissions, { secondaryAccounts: accounts }];
        },
      },
      context
    );
    this.modifyPermissions = createProcedureMethod(
      { getProcedureAndArgs: args => [modifySignerPermissions, { ...args }] },
      context
    );
    this.inviteAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteAccount, { ...args }] },
      context
    );
    this.freezeSecondaryAccounts = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeSecondaryAccounts, { freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreezeSecondaryAccounts = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeSecondaryAccounts, { freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.subsidizeAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [subsidizeAccount, { ...args }] },
      context
    );
  }

  /**
   * Disassociate the signing Account from its Identity. This operation can only be done if the signing Account is a secondary Account
   */
  public leaveIdentity: NoArgsProcedureMethod<void>;

  /**
   * Remove a list of secondary Accounts associated with the signing Identity
   */
  public removeSecondaryAccounts: ProcedureMethod<RemoveSecondaryAccountsParams, void>;

  /**
   * Revoke all permissions of a list of secondary Accounts associated with the signing Identity
   */
  public revokePermissions: ProcedureMethod<{ secondaryAccounts: Account[] }, void>;

  /**
   * Modify all permissions of a list of secondary Accounts associated with the signing Identity
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join the signing Identity as a secondary Account
   *
   * @note this will create an AuthorizationRequest which has to be accepted by
   *   the corresponding Account. An Account can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public inviteAccount: ProcedureMethod<InviteAccountParams, AuthorizationRequest>;

  /**
   * Freeze all of the secondary Accounts in the signing Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the Accounts are unfrozen via [[unfreezeSecondaryAccounts]]
   */
  public freezeSecondaryAccounts: NoArgsProcedureMethod<void>;

  /**
   * Unfreeze all of the secondary Accounts in the signing Identity. This will restore their permissions as they were before being frozen
   */
  public unfreezeSecondaryAccounts: NoArgsProcedureMethod<void>;

  /**
   * Send an Authorization Request to an Account to subsidize its transaction fees
   *
   * @note this will create an AuthorizationRequest which has to be accepted by
   *   the beneficiary Account. An Account can fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public subsidizeAccount: ProcedureMethod<SubsidizeAccountParams, AuthorizationRequest>;

  /**
   * Get the free/locked POLYX balance of an Account
   *
   * @param args.account - defaults to the signing Account
   *
   * @note can be subscribed to
   */
  public getAccountBalance(args?: { account: string | Account }): Promise<AccountBalance>;
  public getAccountBalance(callback: SubCallback<AccountBalance>): Promise<UnsubCallback>;
  public getAccountBalance(
    args: { account: string | Account },
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getAccountBalance(
    args?: { account: string | Account } | SubCallback<AccountBalance>,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const { context } = this;
    let account: string | Account | undefined;
    let cb: SubCallback<AccountBalance> | undefined = callback;

    switch (typeof args) {
      case 'undefined': {
        break;
      }
      case 'function': {
        cb = args;
        break;
      }
      default: {
        ({ account } = args);
        break;
      }
    }

    if (!account) {
      account = context.getSigningAccount();
    } else if (typeof account === 'string') {
      account = new Account({ address: account }, context);
    }

    if (cb) {
      return account.getBalance(cb);
    }

    return account.getBalance();
  }

  /**
   * Create an Account instance from an address. If no address is passed, the signing Account is returned
   */
  public getAccount(args?: { address: string }): Account {
    const { context } = this;

    if (args) {
      return new Account(args, context);
    }

    return context.getSigningAccount();
  }

  /**
   * Return a list that contains all the signing Accounts associated to the SDK instance's Signing Manager
   *
   * @throws — if there is no Signing Manager attached to the SDK
   */
  public async getSigningAccounts(): Promise<Account[]> {
    return this.context.getSigningAccounts();
  }
}
