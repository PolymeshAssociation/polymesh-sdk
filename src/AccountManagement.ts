import {
  Account,
  AuthorizationRequest,
  Context,
  inviteAccount,
  InviteAccountParams,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryAccounts,
  RemoveSecondaryAccountsParams,
  toggleFreezeSecondaryAccounts,
} from '~/internal';
import {
  AccountBalance,
  NoArgsProcedureMethod,
  PermissionType,
  ProcedureMethod,
  Signer,
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

    this.removeSecondaryAccounts = createProcedureMethod(
      {
        getProcedureAndArgs: args => [removeSecondaryAccounts, { ...args }],
      },
      context
    );

    this.revokePermissions = createProcedureMethod<
      { secondaryAccounts: Signer[] },
      ModifySignerPermissionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => {
          const { secondaryAccounts } = args;
          const signers = secondaryAccounts.map(signer => {
            return {
              signer,
              permissions: {
                tokens: { type: PermissionType.Include, values: [] },
                transactions: { type: PermissionType.Include, values: [] },
                portfolios: { type: PermissionType.Include, values: [] },
              },
            };
          });
          return [modifySignerPermissions, { secondaryAccounts: signers }];
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
  }

  /**
   * Remove a list of secondary Accounts associated with the signing Identity
   */
  public removeSecondaryAccounts: ProcedureMethod<RemoveSecondaryAccountsParams, void>;

  /**
   * Revoke all permissions of a list of secondary Accounts associated with the signing Identity
   */
  public revokePermissions: ProcedureMethod<{ secondaryAccounts: Signer[] }, void>;

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
   * Get the free/locked POLYX balance of an Account
   *
   * @param args.account - defaults to the current Account
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
      account = context.getCurrentAccount();
    } else if (typeof account === 'string') {
      account = new Account({ address: account }, context);
    }

    if (cb) {
      return account.getBalance(cb);
    }

    return account.getBalance();
  }

  /**
   * Create an Account instance from an address. If no address is passed, the current Account is returned
   */
  public getAccount(args?: { address: string }): Account {
    const { context } = this;

    if (args) {
      return new Account(args, context);
    }

    return context.getCurrentAccount();
  }

  /**
   * Return a list that contains all the signing Accounts associated to the SDK instance
   *
   * @throws — if there is no current Account associated to the SDK instance
   */
  public getAccounts(): Account[] {
    return this.context.getAccounts();
  }
}
