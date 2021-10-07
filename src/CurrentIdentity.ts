import {
  Context,
  createVenue,
  CreateVenueParams,
  inviteAccount,
  InviteAccountParams,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryKeys,
  RemoveSecondaryKeysParams,
  reserveTicker,
  ReserveTickerParams,
  TickerReservation,
  toggleFreezeSecondaryKeys,
  Venue,
} from '~/internal';
import { PermissionType, ProcedureMethod, Signer } from '~/types';
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
    this.createVenue = createProcedureMethod(
      { getProcedureAndArgs: args => [createVenue, args] },
      context
    );
    this.freezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: true }] },
      context
    );
    this.unfreezeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: () => [toggleFreezeSecondaryKeys, { freeze: false }] },
      context
    );
    this.reserveTicker = createProcedureMethod(
      {
        getProcedureAndArgs: args => [reserveTicker, args],
      },
      context
    );
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

  /**
   * Reserve a ticker symbol to later use in the creation of a Security Token.
   *   The ticker will expire after a set amount of time, after which other users can reserve it
   */
  public reserveTicker: ProcedureMethod<ReserveTickerParams, TickerReservation>;
}
