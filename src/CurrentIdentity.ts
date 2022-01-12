import {
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
import { Account, NoArgsProcedureMethod, PermissionType, ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles functionality related to the Current Identity
 */
export class CurrentIdentity {
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
      { secondaryKeys: Account[] },
      ModifySignerPermissionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => {
          const { secondaryKeys } = args;
          const signers = secondaryKeys.map(account => {
            return {
              account,
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
  public revokePermissions: ProcedureMethod<{ secondaryKeys: Account[] }, void>;

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
}
