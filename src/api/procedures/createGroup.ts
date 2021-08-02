import { ISubmittableResult } from '@polkadot/types/types';
import { isEqual } from 'lodash';

import { Context, CustomPermissionGroup, PolymeshError, PostTransactionValue, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TransactionPermissions, TxGroup, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permissionsLikeToPermissions,
  stringToTicker,
  tickerToString,
  transactionPermissionsToExtrinsicPermissions,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface CreateGroupParams {
  permissions:
    | {
        transactions: TransactionPermissions;
      }
    | {
        transactionGroups: TxGroup[];
      };
}

/**
 * @hidden
 */
export type Params = CreateGroupParams & {
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
export async function prepareCreateGroup(
  this: Procedure<Params, CustomPermissionGroup, Storage>,
  args: Params
): Promise<PostTransactionValue<CustomPermissionGroup>> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
    storage: { token },
  } = this;
  const { ticker, permissions } = args;

  const rawTicker = stringToTicker(ticker, context);
  const { transactions } = permissionsLikeToPermissions(permissions, context);

  const { data: groups } = await token.permissions.getGroups();

  const currentTransactionPermissions: TransactionPermissions[] = [];

  await Promise.all(
    groups.map(async group => {
      const { transactions: groupTransactions } = await group.getPermissions();
      if (groupTransactions) {
        currentTransactionPermissions.push(groupTransactions);
      }
    })
  );

  if (
    currentTransactionPermissions.some(transactionPermission =>
      isEqual(transactionPermission, transactions)
    )
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Already exists a group with exactly the same permissions',
    });
  }

  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    transactions!,
    context
  );

  const [customPermissionGroup] = this.addTransaction(externalAgents.createGroup, {
    resolvers: [createCreateGroupResolver(context)],
  }, rawTicker, rawExtrinsicPermissions);

  return customPermissionGroup
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, CustomPermissionGroup, Storage>): ProcedureAuthorization {
  const {
    storage: { token },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.CreateGroup],
      tokens: [token],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, CustomPermissionGroup, Storage>,
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
export const createGroup = (): Procedure<Params, CustomPermissionGroup, Storage> =>
  new Procedure(prepareCreateGroup, getAuthorization, prepareStorage);
