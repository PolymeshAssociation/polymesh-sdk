import { TxTags } from 'polymesh-types/types';

import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  Asset,
  AuthorizationRequest,
  createGroup,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  SignerType,
  TransactionPermissions,
  TxGroup,
} from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

export interface InviteExternalAgentParams {
  target: string | Identity;
  permissions:
    | KnownPermissionGroup
    | CustomPermissionGroup
    | {
        transactions: TransactionPermissions;
      }
    | {
        transactionGroups: TxGroup[];
      };
  /**
   * date at which the authorization request for invitation expires (optional)
   *
   * @note if expiry date is not set, the invitation will never expire
   */
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = InviteExternalAgentParams & {
  ticker: string;
};

/**
 * @hidden
 */
export interface Storage {
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareInviteExternalAgent(
  this: Procedure<Params, AuthorizationRequest, Storage>,
  args: Params
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
    storage: { asset },
  } = this;

  const { ticker, target, permissions, expiry = null } = args;

  const issuer = await context.getCurrentIdentity();
  const targetIdentity = await context.getIdentity(target);

  const currentAgents = await asset.permissions.getAgents();

  const isAgent = !!currentAgents.find(({ agent }) => agent.isEqual(targetIdentity));

  if (isAgent) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target Identity is already an External Agent',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  let postTransactionAuthorization: MaybePostTransactionValue<Authorization>;
  let rawAuthorizationData;

  // helper to transform permissions into the relevant Authorization
  const createBecomeAgentData = (
    value: KnownPermissionGroup | CustomPermissionGroup
  ): Authorization => ({
    type: AuthorizationType.BecomeAgent,
    value,
  });

  if (permissions instanceof KnownPermissionGroup || permissions instanceof CustomPermissionGroup) {
    postTransactionAuthorization = createBecomeAgentData(permissions);
    rawAuthorizationData = authorizationToAuthorizationData(postTransactionAuthorization, context);
  } else {
    // We know this procedure returns a PostTransactionValue, so this assertion is necessary
    const createGroupResult = (await this.addProcedure(createGroup(), {
      ticker,
      permissions,
    })) as PostTransactionValue<CustomPermissionGroup>;
    postTransactionAuthorization = createGroupResult.transform(createBecomeAgentData);

    rawAuthorizationData = postTransactionAuthorization.transform(authorization =>
      authorizationToAuthorizationData(authorization, context)
    );
  }

  const rawExpiry = optionize(dateToMoment)(expiry, context);

  const [auth] = this.addTransaction({
    transaction: identity.addAuthorization,
    resolvers: [
      createAuthorizationResolver(
        postTransactionAuthorization,
        issuer,
        targetIdentity,
        expiry,
        context
      ),
    ],
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
  });

  return auth;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
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
export function prepareStorage(
  this: Procedure<Params, AuthorizationRequest, Storage>,
  { ticker }: Params
): Storage {
  const { context } = this;

  return {
    asset: new Asset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const inviteExternalAgent = (): Procedure<Params, AuthorizationRequest, Storage> =>
  new Procedure(prepareInviteExternalAgent, getAuthorization, prepareStorage);
