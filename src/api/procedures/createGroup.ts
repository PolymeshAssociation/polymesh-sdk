

import { Procedure, SecurityToken } from '~/internal';
import { TransactionPermissions, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { permissionsLikeToPermissions, stringToTicker, transactionPermissionsToExtrinsicPermissions } from '~/utils/conversion';

export interface CreateGroupParams {
  permissions: {
    transactions: TransactionPermissions;
  }
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
export async function prepareCreateGroup(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
  } = this;
  const { ticker, permissions } = args;

  const rawTicker = stringToTicker(ticker, context);
  const { transactions } = permissionsLikeToPermissions(permissions, context);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(transactions!, context);

  this.addTransaction(externalAgents.createGroup, {}, rawTicker, rawExtrinsicPermissions);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.CreateGroup],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createGroup = (): Procedure<Params, void> =>
  new Procedure(prepareCreateGroup, getAuthorization);
