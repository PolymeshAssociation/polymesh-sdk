import { AuthorizationData, TxTags } from 'polymesh-types/types';

import {
  Asset,
  Context,
  createGroup,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { AuthorizationType, ErrorCode, SignerType, TransactionPermissions, TxGroup } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { getDid, optionize } from '~/utils/internal';

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
export async function prepareInviteExternalAgent(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
    storage: { asset },
  } = this;

  const { ticker, target, permissions, expiry } = args;

  const [currentAgents, did] = await Promise.all([
    asset.permissions.getAgents(),
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

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
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
  this: Procedure<Params, void, Storage>,
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
export const inviteExternalAgent = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareInviteExternalAgent, getAuthorization, prepareStorage);
