import { AgentGroup, TxTags } from 'polymesh-types/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { CustomPermissionGroup } from '~/api/entities/CustomPermissionGroup';
import { KnownPermissionGroup } from '~/api/entities/KnownPermissionGroup';
import { Context, Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { AuthorizationType, ErrorCode, PermissionGroup, TransactionPermissions, TxGroup } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { authorizationToAuthorizationData, dateToMoment, tickerToString, u64ToBigNumber } from '~/utils/conversion';
import { filterEventRecords, getDid, optionize } from '~/utils/internal';

export interface InviteExternalAgentParams {
  target: string | Identity;
  group: KnownPermissionGroup | CustomPermissionGroup | ({
    transactions: TransactionPermissions;
  }
| {
    transactionGroups: TxGroup[];
  })
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
 export const createCreateGroupResolver = (
  context: Context
) => (receipt: ISubmittableResult): CustomPermissionGroup => {
  const [{ data }] = filterEventRecords(receipt, 'externalAgents', 'GroupCreated');

  const result = new CustomPermissionGroup({ id: u64ToBigNumber(data[2]), ticker: tickerToString(data[1]) }, context)

  return result;
};

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
        tx: { identity, externalAgents },
      },
    },
    context,
    storage: { token },
  } = this;
  
  const { target, group, expiry } = args;

  const [getAgents, did] = await Promise.all([
    token.permissions.getAgents(),
    getDid(target, context)
  ]);

  const isCurrentAgent = getAgents.map(({ identity: agentIdentity }) => agentIdentity.did).includes(did);

  if (isCurrentAgent) {
    throw new PolymeshError({
      code: ErrorCode.IdentityNotPresent,
      message: 'The target identity is already an External Agent',
    });
  }

  if (!(group instanceof KnownPermissionGroup && group instanceof CustomPermissionGroup)) {
    
  }

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.BecomeAgent,
      value: group || // ,
    },
    context
  );
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
 export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
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
  this: Procedure<Params, void, Storage>,
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
 export const inviteExternalAgent = (): Procedure<Params, void, Storage> =>
 new Procedure(prepareInviteExternalAgent, getAuthorization, prepareStorage);
