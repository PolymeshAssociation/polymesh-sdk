import { isFullGroupType } from '~/api/procedures/utils';
import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveExternalAgentParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, stringToIdentityId } from '~/utils/conversion';
import { getIdentity } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RemoveExternalAgentParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareRemoveExternalAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'externalAgents', 'removeAgent'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
  } = this;

  const { asset, target } = args;

  const [currentAgents, targetIdentity] = await Promise.all([
    asset.permissions.getAgents(),
    getIdentity(target, context),
  ]);

  const agentWithGroup = currentAgents.find(({ agent }) => agent.isEqual(targetIdentity));

  if (!agentWithGroup) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target Identity is not an External Agent',
    });
  }

  if (isFullGroupType(agentWithGroup.group)) {
    const fullGroupAgents = currentAgents.filter(({ group }) => isFullGroupType(group));
    if (fullGroupAgents.length === 1) {
      throw new PolymeshError({
        code: ErrorCode.EntityInUse,
        message:
          'The target is the last Agent with full permissions for this Asset. There should always be at least one Agent with full permissions',
      });
    }
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const rawAgent = stringToIdentityId(targetIdentity.did, context);

  return {
    transaction: externalAgents.removeAgent,
    args: [rawAssetId, rawAgent],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.externalAgents.RemoveAgent],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeExternalAgent = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveExternalAgent, getAuthorization);
