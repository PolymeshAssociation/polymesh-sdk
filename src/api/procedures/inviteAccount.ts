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
  this: Procedure<InviteAccountParams>,
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

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.JoinIdentity,
      value: authorizationValue,
    },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction({
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
  });
}

/**
 * @hidden
 */
export const inviteAccount = (): Procedure<InviteAccountParams> =>
  new Procedure(prepareInviteAccount, {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      tokens: [],
      portfolios: [],
    },
  });
