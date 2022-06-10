import { ISubmittableResult } from '@polkadot/types/types';

import { assertGroupDoesNotExist } from '~/api/procedures/utils';
import { Asset, Context, CustomPermissionGroup, PostTransactionValue, Procedure } from '~/internal';
import { TransactionPermissions, TxGroup, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permissionsLikeToPermissions,
  stringToTicker,
  tickerToString,
  transactionPermissionsToExtrinsicPermissions,
  u32ToBigNumber,
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
  asset: Asset;
}

/**
 * @hidden
 */
export const createCreateGroupResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): CustomPermissionGroup => {
    const [{ data }] = filterEventRecords(receipt, 'externalAgents', 'GroupCreated');

    return new CustomPermissionGroup(
      { id: u32ToBigNumber(data[2]), ticker: tickerToString(data[1]) },
      context
    );
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
    storage: { asset },
  } = this;
  const { ticker, permissions } = args;

  const rawTicker = stringToTicker(ticker, context);
  const { transactions } = permissionsLikeToPermissions(permissions, context);

  await assertGroupDoesNotExist(asset, transactions);

  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(
    transactions,
    context
  );

  const [customPermissionGroup] = this.addTransaction({
    transaction: externalAgents.createGroup,
    resolvers: [createCreateGroupResolver(context)],
    args: [rawTicker, rawExtrinsicPermissions],
  });

  return customPermissionGroup;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CustomPermissionGroup, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.CreateGroup],
      assets: [asset],
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
    asset: new Asset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const createGroup = (): Procedure<Params, CustomPermissionGroup, Storage> =>
  new Procedure(prepareCreateGroup, getAuthorization, prepareStorage);
