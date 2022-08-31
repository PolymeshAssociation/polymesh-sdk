import { Asset, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags, WaivePermissionsParams } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToTicker } from '~/utils/conversion';
import { asAsset } from '~/utils/internal';

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
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareWaivePermissions(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
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

  const rawTicker = stringToTicker(asset.ticker, context);

  this.addTransaction({
    transaction: tx.externalAgents.abdicate,
    args: [rawTicker],
  });
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
export function prepareStorage(this: Procedure<Params, void, Storage>, { asset }: Params): Storage {
  const { context } = this;

  return {
    asset: asAsset(asset, context),
  };
}

/**
 * @hidden
 */
export const waivePermissions = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareWaivePermissions, getAuthorization, prepareStorage);
