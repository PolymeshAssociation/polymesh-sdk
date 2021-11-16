import { isEqual } from 'lodash';

import { CustomPermissionGroup, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransactionPermissions, TxGroup, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  numberToU32,
  permissionsLikeToPermissions,
  stringToTicker,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

export interface SetGroupPermissionsParams {
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
export type Params = { group: CustomPermissionGroup } & SetGroupPermissionsParams;

/**
 * @hidden
 */
export async function prepareSetGroupPermissions(
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

  const { group, permissions } = args;

  const { transactions } = permissionsLikeToPermissions(permissions, context);
  const { transactions: transactionPermissions } = await group.getPermissions();

  if (isEqual(transactionPermissions, transactions)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New permissions are the same as the current ones',
    });
  }

  const {
    token: { ticker },
    id,
  } = group;
  const rawTicker = stringToTicker(ticker, context);
  const rawAgId = numberToU32(id, context);
  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(
    transactions,
    context
  );

  this.addTransaction(
    externalAgents.setGroupPermissions,
    {},
    rawTicker,
    rawAgId,
    rawExtrinsicPermissions
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { group: { token } }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.externalAgents.SetGroupPermissions],
      portfolios: [],
      tokens: [token],
    },
  };
}

/**
 * @hidden
 */
export const setGroupPermissions = (): Procedure<Params, void> =>
  new Procedure(prepareSetGroupPermissions, getAuthorization);
