import { MultiSig } from '~/api/entities/MultiSig';
import {
  Account,
  AuthorizationRequest,
  Context,
  createMultiSigAccount,
  inviteAccount,
  leaveIdentity,
  modifySignerPermissions,
  modifySignerPermissionsStorage,
  removeSecondaryAccounts,
  subsidizeAccount,
  Subsidy,
  toggleFreezeSecondaryAccounts,
} from '~/internal';
import {
  AccountBalance,
  CreateMultiSigParams,
  InviteAccountParams,
  ModifySignerPermissionsParams,
  NoArgsProcedureMethod,
  PermissionType,
  ProcedureMethod,
  RemoveSecondaryAccountsParams,
  SubCallback,
  SubsidizeAccountParams,
  UnsubCallback,
} from '~/types';
import { stringToAccountId } from '~/utils/conversion';
import { asAccount, assertAddressValid, createProcedureMethod } from '~/utils/internal';

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
      { secondaryAccounts: (string | Account)[] },
      ModifySignerPermissionsParams,
      void,
      modifySignerPermissionsStorage
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
    this.createMultiSigAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [createMultiSigAccount, args] },
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
   *
   * @throws if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being revoked
   */
  public revokePermissions: ProcedureMethod<{ secondaryAccounts: (string | Account)[] }, void>;

  /**
   * Modify all permissions of a list of secondary Accounts associated with the signing Identity
   *
   * @throws if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being modified
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join the signing Identity as a secondary Account
   *
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `targetAccount`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public inviteAccount: ProcedureMethod<InviteAccountParams, AuthorizationRequest>;

  /**
   * Freeze all of the secondary Accounts in the signing Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the Accounts are unfrozen via {@link unfreezeSecondaryAccounts}
   */
  public freezeSecondaryAccounts: NoArgsProcedureMethod<void>;

  /**
   * Unfreeze all of the secondary Accounts in the signing Identity. This will restore their permissions as they were before being frozen
   */
  public unfreezeSecondaryAccounts: NoArgsProcedureMethod<void>;

  /**
   * Send an Authorization Request to an Account to subsidize its transaction fees
   *
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `beneficiary` Account.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public subsidizeAccount: ProcedureMethod<SubsidizeAccountParams, AuthorizationRequest>;

  /**
   * Create a MultiSig Account
   *
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} for each signing Account which will have to be accepted before they can approve transactions. None of the signing Accounts can be associated with an Identity when accepting the Authorization
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public createMultiSigAccount: ProcedureMethod<CreateMultiSigParams, MultiSig>;

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
    } else {
      account = asAccount(account, context);
    }

    if (cb) {
      return account.getBalance(cb);
    }

    return account.getBalance();
  }

  /**
   * Return an Account instance from an address. If the Account has multiSig signers, the returned value will be a {@link api/entities/MultiSig!MultiSig} instance
   */
  public async getAccount(args: { address: string }): Promise<Account | MultiSig> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
    } = this;
    const { address } = args;
    const rawAddress = stringToAccountId(address, context);
    const rawSigners = await multiSig.multiSigSigners.entries(rawAddress);
    if (rawSigners.length > 0) {
      return new MultiSig(args, context);
    }

    return new Account(args, context);
  }

  /**
   * Return the signing Account, or null if no signing Account has been set
   */
  public getSigningAccount(): Account | null {
    try {
      return this.context.getSigningAccount();
    } catch (err) {
      return null;
    }
  }

  /**
   * Return a list that contains all the signing Accounts associated to the SDK instance's Signing Manager
   *
   * @throws — if there is no Signing Manager attached to the SDK
   */
  public async getSigningAccounts(): Promise<Account[]> {
    return this.context.getSigningAccounts();
  }

  /**
   * Return an Subsidy instance for a pair of beneficiary and subsidizer Account
   */
  public getSubsidy(args: {
    beneficiary: string | Account;
    subsidizer: string | Account;
  }): Subsidy {
    const { context } = this;

    const { beneficiary, subsidizer } = args;

    const { address: beneficiaryAddress } = asAccount(beneficiary, context);
    const { address: subsidizerAddress } = asAccount(subsidizer, context);

    return new Subsidy({ beneficiary: beneficiaryAddress, subsidizer: subsidizerAddress }, context);
  }

  /**
   * Returns `true` @param args.address is a valid ss58 address for the connected network
   */
  public isValidAddress(args: { address: string }): boolean {
    try {
      assertAddressValid(args.address, this.context.ss58Format);
    } catch (error) {
      return false;
    }

    return true;
  }
}
