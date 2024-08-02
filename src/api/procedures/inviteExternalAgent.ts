import { ISubmittableResult } from '@polkadot/types/types';

import { createAuthorizationResolver, getGroupFromPermissions } from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  BaseAsset,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  InviteExternalAgentParams,
  SignerType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  authorizationToAuthorizationData,
  dateToMoment,
  permissionsLikeToPermissions,
  signerToString,
  signerValueToSignatory,
  stringToIdentityId,
  transactionPermissionsToExtrinsicPermissions,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

export const createGroupAndAuthorizationResolver =
  (target: Identity) =>
  (receipt: ISubmittableResult): Promise<AuthorizationRequest> => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'AuthorizationAdded');

    const id = u64ToBigNumber(data[3]);

    return target.authorizations.getOne({ id });
  };

/**
 * @hidden
 */
export type Params = InviteExternalAgentParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareInviteExternalAgent(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
): Promise<
  | TransactionSpec<
      AuthorizationRequest,
      ExtrinsicParams<'externalAgents', 'createGroupAndAddAuth'>
    >
  | TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { identity, externalAgents },
      },
    },
    context,
  } = this;

  const { asset, target, permissions, expiry = null } = args;

  const issuer = await context.getSigningIdentity();
  const targetIdentity = await context.getIdentity(target);

  const currentAgents = await asset.permissions.getAgents();

  const isAgent = !!currentAgents.find(({ agent }) => agent.isEqual(targetIdentity));

  if (isAgent) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target Identity is already an External Agent',
    });
  }

  const targetDid = signerToString(target);

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: targetDid },
    context
  );

  let newAuthorizationData: Authorization;
  let rawAuthorizationData;

  // helper to transform permissions into the relevant Authorization
  const createBecomeAgentData = (
    value: KnownPermissionGroup | CustomPermissionGroup
  ): Authorization => ({
    type: AuthorizationType.BecomeAgent,
    value,
  });

  if (permissions instanceof KnownPermissionGroup || permissions instanceof CustomPermissionGroup) {
    newAuthorizationData = createBecomeAgentData(permissions);
    rawAuthorizationData = authorizationToAuthorizationData(newAuthorizationData, context);
  } else {
    const rawAssetId = assetToMeshAssetId(asset, context);
    const { transactions } = permissionsLikeToPermissions(permissions, context);

    const matchingGroup = await getGroupFromPermissions(asset, transactions);

    /*
     * if there is no existing group with the passed permissions, we create it together with the Authorization Request.
     *   Otherwise, we use the existing group's ID to create the Authorization request
     */
    if (!matchingGroup) {
      return {
        transaction: externalAgents.createGroupAndAddAuth,
        args: [
          rawAssetId,
          transactionPermissionsToExtrinsicPermissions(transactions, context),
          stringToIdentityId(targetDid, context),
          null,
        ],
        resolver: createGroupAndAuthorizationResolver(targetIdentity),
      };
    }

    newAuthorizationData = createBecomeAgentData(matchingGroup);
    rawAuthorizationData = authorizationToAuthorizationData(newAuthorizationData, context);
  }

  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(
      newAuthorizationData,
      issuer,
      targetIdentity,
      expiry,
      context
    ),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const inviteExternalAgent = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareInviteExternalAgent, getAuthorization);
