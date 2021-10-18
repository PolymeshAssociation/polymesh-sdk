import { TxTags } from 'polymesh-types/types';

import { Account, PolymeshError, Procedure } from '~/internal';
import {
  AuthorizationType,
  ErrorCode,
  Permissions,
  PermissionsLike,
  PermissionType,
  SignerType,
} from '~/types';
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

/**
 * @hidden
 */
export async function prepareInviteAccount(
  this: Procedure<InviteAccountParams, void>,
  args: InviteAccountParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { targetAccount, permissions: permissionsLike, expiry } = args;

  const identity = await context.getCurrentIdentity();

  const address = signerToString(targetAccount);

  const authorizationRequests = await identity.authorizations.getSent();

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    console.log(authorizationRequest.data);
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
export const inviteAccount = (): Procedure<InviteAccountParams, void> =>
  new Procedure(prepareInviteAccount, {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      tokens: [],
      portfolios: [],
    },
  });
