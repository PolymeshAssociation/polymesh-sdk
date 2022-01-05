import {
  Account,
  AuthorizationRequest,
  Context,
  inviteAccount,
  InviteAccountParams,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryKeys,
  RemoveSecondaryKeysParams,
  toggleFreezeSecondaryKeys,
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

    this.removeSecondaryKeys = createProcedureMethod(
      {
        getProcedureAndArgs: args => [removeSecondaryKeys, { ...args }],
      },
      context
    );

    this.revokePermissions = createProcedureMethod<
      { secondaryKeys: Signer[] },
      ModifySignerPermissionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => {
          const { secondaryKeys } = args;
          const signers = secondaryKeys.map(signer => {
            return {
              signer,
              permissions: {
                tokens: { type: PermissionType.Include, values: [] },
                transactions: { type: PermissionType.Include, values: [] },
                portfolios: { type: PermissionType.Include, values: [] },
              },
            };
          });
          return [modifySignerPermissions, { secondaryKeys: signers }];
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
    this.freezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: true }], voidArgs: true },
      context
    );
    this.unfreezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: false }], voidArgs: true },
      context
    );
  }

  /**
   * Remove a list of secondary keys associated with the Current Identity
   */
  public removeSecondaryKeys: ProcedureMethod<RemoveSecondaryKeysParams, void>;

  /**
   * Revoke all permissions of a list of secondary keys associated with the Current Identity
   */
  public revokePermissions: ProcedureMethod<{ secondaryKeys: Signer[] }, void>;

  /**
   * Modify all permissions of a list of secondary keys associated with the Current Identity
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join the Current Identity as a secondary key
   *
   * @note this will create an AuthorizationRequest which has to be accepted by
   *   the corresponding Account. An Account can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public inviteAccount: ProcedureMethod<InviteAccountParams, AuthorizationRequest>;

  /**
   * Freeze all the secondary keys in the Current Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the keys are unfrozen via [[unfreezeSecondaryKeys]]
   */
  public freezeSecondaryKeys: NoArgsProcedureMethod<void>;

  /**
   * Unfreeze all the secondary keys in the Current Identity. This will restore their permissions as they were before being frozen
   */
  public unfreezeSecondaryKeys: NoArgsProcedureMethod<void>;

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
