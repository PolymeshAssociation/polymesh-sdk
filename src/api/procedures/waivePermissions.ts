import { BaseAsset, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags, WaivePermissionsParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId } from '~/utils/conversion';
import { asBaseAsset } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = WaivePermissionsParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export interface Storage {
  asset: BaseAsset;
}

/**
 * @hidden
 */
export async function prepareWaivePermissions(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'externalAgents', 'abdicate'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { asset },
  } = this;

  const { identity } = args;

  const agents = await asset.permissions.getAgents();
  const isAgent = agents.some(agentWithGroup => agentWithGroup.agent.isEqual(identity));

  if (!isAgent) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Identity is not an Agent for the Asset',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  return {
    transaction: tx.externalAgents.abdicate,
    args: [rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
  return {
    signerPermissions: {
      transactions: [TxTags.externalAgents.Abdicate],
      assets: [asset],
      portfolios: [],
    },
    roles: [{ type: RoleType.Identity, did }],
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): Promise<Storage> {
  const { context } = this;

  return {
    asset: await asBaseAsset(asset, context),
  };
}

/**
 * @hidden
 */
export const waivePermissions = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareWaivePermissions, getAuthorization, prepareStorage);
