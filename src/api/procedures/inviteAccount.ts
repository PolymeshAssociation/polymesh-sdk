import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, PolymeshError, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  InviteAccountParams,
  Permissions,
  PermissionType,
  SignerType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  permissionsLikeToPermissions,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { asAccount, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareInviteAccount(
  this: Procedure<InviteAccountParams, AuthorizationRequest>,
  args: InviteAccountParams
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { targetAccount, permissions: permissionsLike, expiry = null } = args;

  const identity = await context.getSigningIdentity();

  const address = signerToString(targetAccount);

  const account = asAccount(targetAccount, context);

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
    assets: { type: PermissionType.Include, values: [] },
    transactions: { type: PermissionType.Include, values: [] },
    transactionGroups: [],
    portfolios: { type: PermissionType.Include, values: [] },
  };

  if (permissionsLike) {
    authorizationValue = permissionsLikeToPermissions(permissionsLike, context);
  }

  const authRequest: Authorization = {
    type: AuthorizationType.JoinIdentity,
    value: authorizationValue,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authRequest, context);
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(authRequest, identity, account, expiry, context),
  };
}

/**
 * @hidden
 */
export const inviteAccount = (): Procedure<InviteAccountParams, AuthorizationRequest> =>
  new Procedure(prepareInviteAccount, {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      assets: [],
      portfolios: [],
    },
  });
