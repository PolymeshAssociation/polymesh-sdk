import { isEqual } from 'lodash';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TransactionPermissions, TxGroup, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permissionsLikeToPermissions,
  stringToTicker,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

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
export async function prepareCreateGroup(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
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
      const details = await group.details();
      currentTransactionPermissions.push(details.permissions);
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

  this.addTransaction(externalAgents.createGroup, {}, rawTicker, rawExtrinsicPermissions);
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
export const createGroup = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareCreateGroup, getAuthorization, prepareStorage);
