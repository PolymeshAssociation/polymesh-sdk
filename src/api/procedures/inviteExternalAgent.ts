import { ISubmittableResult } from '@polkadot/types/types';
import { AuthorizationData, TxTags } from 'polymesh-types/types';

import {
  AuthorizationRequest,
  Context,
  createGroup,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  SignerType,
  TransactionPermissions,
  TxGroup,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, getDid, optionize } from '~/utils/internal';

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
  token: SecurityToken;
}

/**
 * @hidden
 */
const authorizationDataResolver = (
  value: KnownPermissionGroup | CustomPermissionGroup,
  context: Context
): AuthorizationData =>
  authorizationToAuthorizationData(
    {
      type: AuthorizationType.BecomeAgent,
      value,
    },
    context
  );

/**
 * @hidden
 */
export const createAuthorizationResolver = (
  authData: Authorization,
  issuer: Identity,
  target: Identity,
  expiry: Date | null,
  context: Context
) => (receipt: ISubmittableResult): AuthorizationRequest => {
  const [{ data }] = filterEventRecords(receipt, 'identity', 'AuthorizationAdded');
  const id = u64ToBigNumber(data[3]);
  return new AuthorizationRequest({ authId: id, expiry, issuer, target, data: authData }, context);
};
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
    storage: { token },
  } = this;

  const { ticker, target, permissions, expiry } = args;

  const issuer = await context.getCurrentIdentity();
  let targetIdentity: Identity;
  if (typeof target === 'string') {
    targetIdentity = new Identity({ did: target }, context);
  } else {
    targetIdentity = target;
  }

  const [currentAgents, did] = await Promise.all([
    token.permissions.getAgents(),
    getDid(target, context),
  ]);

  const isAgent = !!currentAgents.find(({ agent: { did: agentDid } }) => agentDid === did);

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

  let rawAuthorizationData;

  if (permissions instanceof KnownPermissionGroup || permissions instanceof CustomPermissionGroup) {
    rawAuthorizationData = authorizationDataResolver(permissions, context);
  } else {
    // We know this procedure returns a PostTransactionValue, so this assertion is necessary
    const createGroupResult = (await this.addProcedure(createGroup(), {
      ticker,
      permissions,
    })) as PostTransactionValue<CustomPermissionGroup>;
    rawAuthorizationData = createGroupResult.transform(customPermissionGroup =>
      authorizationDataResolver(customPermissionGroup, context)
    );
  }

  const rawExpiry = optionize(dateToMoment)(expiry, context);

  const [auth] = this.addTransaction(
    identity.addAuthorization,
    {
      resolvers: [
        createAuthorizationResolver(
          rawAuthorizationData as Authorization,
          issuer,
          targetIdentity,
          expiry || null,
          context
        ),
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
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest, Storage>
): ProcedureAuthorization {
  const {
    storage: { token },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      tokens: [token],
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
    token: new SecurityToken({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const inviteExternalAgent = (): Procedure<Params, AuthorizationRequest, Storage> =>
  new Procedure(prepareInviteExternalAgent, getAuthorization, prepareStorage);
