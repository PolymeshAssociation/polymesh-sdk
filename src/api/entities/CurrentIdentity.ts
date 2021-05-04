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
import { SecondaryKey, Signer, SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
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
              permissions: { tokens: [], transactions: [], portfolios: [] },
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
   *
   * @param args.secondaryKeys.permissions - list of permissions
   * @param args.secondaryKeys.permissions.tokens - array of Security Tokens on which to grant permissions. A null value represents full permissions
   * @param args.secondaryKeys.permissions.transactions - array of transaction tags that the Secondary Key has permission to execute. A null value represents full permissions
   * @param args.secondaryKeys.permissions.portfolios - array of Portfolios for which to grant permissions. A null value represents full permissions
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join this Identity
   *
   * @note this may create AuthorizationRequest which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @param args.permissions - list of allowed permissions (optional, defaults to no permissions)
   * @param args.permissions.tokens - array of Security Tokens (or tickers) for which to allow permission. Set null to allow all (optional, no permissions if not passed)
   * @param args.permissions.transactions - array of tags associated with the transaction that will be executed for which to allow permission. Set null to allow all (optional, no permissions if not passed)
   * @param args.permissions.portfolios - array of portfolios for which to allow permission. Set null to allow all (optional, no permissions if not passed)
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
