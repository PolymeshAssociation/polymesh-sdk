import { UniqueIdentifiers } from '~/api/entities/Identity';
import {
  Context,
  createVenue,
  CreateVenueParams,
  Identity,
  inviteAccount,
  InviteAccountParams,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryKeys,
  RemoveSecondaryKeysParams,
  toggleFreezeSecondaryKeys,
  Venue,
} from '~/internal';
import {
  PermissionType,
  ProcedureMethod,
  SecondaryKey,
  Signer,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Represents the Identity associated to the current [[Account]]
 */
export class CurrentIdentity extends Identity {
  /**
   * Create a CurrentIdentity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.removeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: args => [removeSecondaryKeys, args] },
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
      { getProcedureAndArgs: args => [modifySignerPermissions, args] },
      context
    );
    this.inviteAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteAccount, args] },
      context
    );
    this.createVenue = createProcedureMethod(
      { getProcedureAndArgs: args => [createVenue, args] },
      context
    );
    this.freezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: true, identity: this }] },
      context
    );
    this.unfreezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: false, identity: this }] },
      context
    );
  }

  /**
   * Get the list of secondary keys related to the Identity
   *
   * @note can be subscribed to
   */
  public async getSecondaryKeys(): Promise<SecondaryKey[]>;
  public async getSecondaryKeys(callback: SubCallback<SecondaryKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryKeys(
    callback?: SubCallback<SecondaryKey[]>
  ): Promise<SecondaryKey[] | UnsubCallback> {
    const { context } = this;

    if (callback) {
      return context.getSecondaryKeys(callback);
    }

    return context.getSecondaryKeys();
  }

  /**
   * Remove a list of secondary keys associated with the Identity
   */
  public removeSecondaryKeys: ProcedureMethod<RemoveSecondaryKeysParams, void>;

  /**
   * Revoke all permissions of a list of secondary keys associated with the Identity
   */
  public revokePermissions: ProcedureMethod<{ secondaryKeys: Signer[] }, void>;

  /**
   * Modify all permissions of a list of secondary keys associated with the Identity
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join this Identity
   *
   * @note this may create AuthorizationRequest which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public inviteAccount: ProcedureMethod<InviteAccountParams, void>;

  /**
   * Create a Venue
   */
  public createVenue: ProcedureMethod<CreateVenueParams, Venue>;

  /**
   * Freeze all the secondary keys in this Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the keys are unfrozen via [[unfreezeSecondaryKeys]]
   */
  public freezeSecondaryKeys: ProcedureMethod<void, void>;

  /**
   * Unfreeze all the secondary keys in this Identity. This will restore their permissions as they were before being frozen
   */
  public unfreezeSecondaryKeys: ProcedureMethod<void, void>;
}
