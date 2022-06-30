import { isFullGroupType } from '~/api/procedures/utils';
import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveExternalAgentParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToIdentityId, stringToTicker } from '~/utils/conversion';
import { getIdentity } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RemoveExternalAgentParams & {
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
export async function prepareRemoveExternalAgent(
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
    storage: { asset },
  } = this;

  const { ticker, target } = args;

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

  const rawTicker = stringToTicker(ticker, context);
  const rawAgent = stringToIdentityId(targetIdentity.did, context);

  this.addTransaction({
    transaction: externalAgents.removeAgent,
    args: [rawTicker, rawAgent],
  });
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
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
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
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
export const removeExternalAgent = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRemoveExternalAgent, getAuthorization, prepareStorage);
