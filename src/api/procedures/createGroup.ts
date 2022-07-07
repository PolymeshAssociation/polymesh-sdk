import { assertGroupDoesNotExist, createCreateGroupResolver } from '~/api/procedures/utils';
import { Asset, CustomPermissionGroup, PostTransactionValue, Procedure } from '~/internal';
import { CreateGroupParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permissionsLikeToPermissions,
  stringToTicker,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

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
