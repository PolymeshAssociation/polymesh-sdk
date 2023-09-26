import { assertGroupDoesNotExist, createCreateGroupResolver } from '~/api/procedures/utils';
import { CustomPermissionGroup, FungibleAsset, Procedure } from '~/internal';
import { CreateGroupParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
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
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export async function prepareCreateGroup(
  this: Procedure<Params, CustomPermissionGroup, Storage>,
  args: Params
): Promise<
  TransactionSpec<CustomPermissionGroup, ExtrinsicParams<'externalAgents', 'createGroup'>>
> {
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

  return {
    transaction: externalAgents.createGroup,
    args: [rawTicker, rawExtrinsicPermissions],
    resolver: createCreateGroupResolver(context),
  };
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
    asset: new FungibleAsset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const createGroup = (): Procedure<Params, CustomPermissionGroup, Storage> =>
  new Procedure(prepareCreateGroup, getAuthorization, prepareStorage);
