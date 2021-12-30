import { TxTags } from 'polymesh-types/types';

import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  Account,
  AuthorizationRequest,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
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
  this: Procedure<InviteAccountParams, AuthorizationRequest>,
  args: InviteAccountParams
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { targetAccount, permissions: permissionsLike, expiry } = args;

  const identity = await context.getCurrentIdentity();

  const address = signerToString(targetAccount);

  let account: Account;

  if (targetAccount instanceof Account) {
    account = targetAccount;
  } else {
    account = new Account({ address: targetAccount }, context);
  }

  const [authorizationRequests, existingIdentity] = await Promise.all([
    identity.authorizations.getSent(),
    account.getIdentity(),
  ] as const);

  if (existingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target Account is already part of an Identity',
    });
  }

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
      code: ErrorCode.NoDataChange,
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

  const authRequest = {
    type: AuthorizationType.JoinIdentity as AuthorizationType.JoinIdentity,
    value: authorizationValue,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authRequest, context);
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  const [auth] = this.addTransaction(
    tx.identity.addAuthorization,
    {
      resolvers: [
        createAuthorizationResolver(authRequest, identity, account, expiry || null, context),
      ],
    },
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );

  return auth;
}

/**
 * @hidden
 */
export const inviteAccount = (): Procedure<InviteAccountParams, AuthorizationRequest> =>
  new Procedure(prepareInviteAccount, {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      tokens: [],
      portfolios: [],
    },
  });
