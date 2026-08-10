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
  TransactionPermissions,
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
    const [record] = filterEventRecords(receipt, 'identity', 'AuthorizationAdded');

    const id = u64ToBigNumber(record!.data[3]);

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
export interface Storage {
  /**
   * the Permission Group the target will be invited into, or `null` if no existing Group matches the
   *   passed permissions and one has to be created alongside the Authorization Request
   */
  matchingGroup: KnownPermissionGroup | CustomPermissionGroup | null;
  /**
   * transactions to grant the Group that has to be created. Only set when `matchingGroup` is `null`
   */
  groupTransactions: TransactionPermissions | null;
}

/**
 * @hidden
 */
export async function prepareInviteExternalAgent(
  this: Procedure<Params, AuthorizationRequest, Storage>,
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
    storage: { matchingGroup, groupTransactions },
  } = this;

  const { asset, target, expiry = null } = args;

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

  /*
   * if there is no existing group with the passed permissions, we create it together with the Authorization Request.
   *   Otherwise, we use the existing group's ID to create the Authorization request
   */
  if (!matchingGroup) {
    const rawAssetId = assetToMeshAssetId(asset, context);

    return {
      transaction: externalAgents.createGroupAndAddAuth,
      args: [
        rawAssetId,
        transactionPermissionsToExtrinsicPermissions(groupTransactions, context),
        stringToIdentityId(targetDid, context),
        null,
      ],
      resolver: createGroupAndAuthorizationResolver(targetIdentity),
    };
  }

  const newAuthorizationData: Authorization = {
    type: AuthorizationType.BecomeAgent,
    value: matchingGroup,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(newAuthorizationData, context);

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
 *
 * The chain defers the real Agent check to acceptance: `acceptBecomeAgent` runs
 * `ensure_agent_permissioned` against the authorization's creator, resolved against the accept
 * call. So the caller must already hold that permission, or the invite can never be accepted.
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest, Storage>,
  { asset }: Params
): ProcedureAuthorization {
  const {
    storage: { matchingGroup },
  } = this;

  return {
    signerPermissions: {
      transactions: [
        matchingGroup
          ? TxTags.identity.AddAuthorization
          : TxTags.externalAgents.CreateGroupAndAddAuth,
      ],
      // only `createGroupAndAddAuth` reaches `has_asset_permission` for the signing key
      assets: matchingGroup ? [] : [asset],
      portfolios: [],
    },
    agentPermissions: {
      // `createGroupAndAddAuth` is Agent checked when submitted, as well as on acceptance
      transactions: matchingGroup
        ? [TxTags.externalAgents.AcceptBecomeAgent]
        : [TxTags.externalAgents.CreateGroupAndAddAuth, TxTags.externalAgents.AcceptBecomeAgent],
      assets: [asset],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, AuthorizationRequest, Storage>,
  { asset, permissions }: Params
): Promise<Storage> {
  const { context } = this;

  if (permissions instanceof KnownPermissionGroup || permissions instanceof CustomPermissionGroup) {
    return { matchingGroup: permissions, groupTransactions: null };
  }

  const { transactions } = permissionsLikeToPermissions(permissions, context);

  return {
    matchingGroup: (await getGroupFromPermissions(asset, transactions)) ?? null,
    groupTransactions: transactions,
  };
}

/**
 * @hidden
 */
export const inviteExternalAgent = (): Procedure<Params, AuthorizationRequest, Storage> =>
  new Procedure(prepareInviteExternalAgent, getAuthorization, prepareStorage);
