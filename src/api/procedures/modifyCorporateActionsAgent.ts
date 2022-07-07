import { Asset, KnownPermissionGroup, PolymeshError, Procedure } from '~/internal';
import {
  AuthorizationType,
  ErrorCode,
  ModifyCorporateActionsAgentParams,
  PermissionGroupType,
  SignerType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = { ticker: string } & ModifyCorporateActionsAgentParams;

/**
 * @hidden
 */
export async function prepareModifyCorporateActionsAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, requestExpiry } = args;

  const asset = new Asset({ ticker }, context);

  const [invalidDids, agents] = await Promise.all([
    context.getInvalidDids([target]),
    asset.corporateActions.getAgents(),
  ]);

  if (invalidDids.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The supplied Identity does not exist',
    });
  }

  if (agents.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Corporate Actions Agent must be undefined to perform this procedure',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.BecomeAgent,
      value: new KnownPermissionGroup({ type: PermissionGroupType.PolymeshV1Caa, ticker }, context),
    },
    context
  );

  let rawExpiry;
  if (!requestExpiry) {
    rawExpiry = null;
  } else if (requestExpiry <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The request expiry must be a future date',
    });
  } else {
    rawExpiry = dateToMoment(requestExpiry, context);
  }

  this.addTransaction({
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      portfolios: [],
      assets: [new Asset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyCorporateActionsAgent = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCorporateActionsAgent, getAuthorization);
