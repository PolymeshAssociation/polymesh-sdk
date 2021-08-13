import { isEqual } from 'lodash';

import { CustomPermissionGroup } from '~/api/entities/CustomPermissionGroup';
import { SecurityToken } from '~/api/entities/SecurityToken';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransactionPermissions, TxGroup, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  numberToU32,
  permissionsLikeToPermissions,
  stringToTicker,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

export interface SetCustomPermissionsParams {
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
export type Params = { group: CustomPermissionGroup } & SetCustomPermissionsParams;

/**
 * @hidden
 */
export async function prepareSetCustomPermissions(
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
  const sortedTransactions = transactions && {
    ...transactions,
    values: [...transactions.values].sort(),
  };
  const { transactions: transactionPermissions } = await group.getPermissions();

  if (isEqual(transactionPermissions, sortedTransactions)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New permissions are the same as the currents',
    });
  }

  const { ticker, id } = group;
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
  { group: { ticker } }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.SetGroupPermissions],
      portfolios: [],
      tokens: [new SecurityToken({ ticker }, context)],
    },
  };
}

/**
 * @hidden
 */
export const setCustomPermissions = (): Procedure<Params, void> =>
  new Procedure(prepareSetCustomPermissions, getAuthorization);
