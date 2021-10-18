import { TxTags } from 'polymesh-types/types';

import { Account, Identity, PolymeshError, Procedure } from '~/internal';
import {
  AuthorizationType,
  ErrorCode,
  Permissions,
  PermissionsLike,
  PermissionType,
  RoleType,
  SignerType,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  permissionsLikeToPermissions,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface InviteAccountParams {
  targetAccount: string | Account;
  permissions?: PermissionsLike;
  expiry?: Date;
}

export type Params = InviteAccountParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export async function prepareInviteAccount(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { targetAccount, permissions: permissionsLike, expiry, identity } = args;

  const address = signerToString(targetAccount);

  const authorizationRequests = await identity.authorizations.getSent();

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(target) === address &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.JoinIdentity
    );
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account already has a pending invitation to join this Identity',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Account, value: address },
    context
  );

  let authorizationValue: Permissions = {
    tokens: { type: PermissionType.Include, values: [] },
    transactions: { type: PermissionType.Include, values: [] },
    transactionGroups: [],
    portfolios: { type: PermissionType.Include, values: [] },
  };

  if (permissionsLike) {
    authorizationValue = permissionsLikeToPermissions(permissionsLike, context);
  }

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.JoinIdentity,
      value: authorizationValue,
    },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(
    tx.identity.addAuthorization,
    {},
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.Identity, did }],
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const inviteAccount = (): Procedure<Params, void> =>
  new Procedure(prepareInviteAccount, getAuthorization);
