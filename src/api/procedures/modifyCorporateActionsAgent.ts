import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { AuthorizationType, ErrorCode, KnownPermissionGroup, SignerType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ModifyCorporateActionsAgentParams {
  /**
   * identity to be set as Corporate Actions Agent
   */
  target: string | Identity;
  /**
   * date at which the authorization request to modify the Corporate Actions Agent expires (optional, never expires if a date is not provided)
   */
  requestExpiry?: Date;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & ModifyCorporateActionsAgentParams;

/**
 * @hidden
 *
 * @deprecated in favor of `inviteAgent`
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

  const securityToken = new SecurityToken({ ticker }, context);

  const [invalidDids, agents] = await Promise.all([
    context.getInvalidDids([target]),
    securityToken.corporateActions.getAgents(),
  ]);

  if (invalidDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied Identity does not exist',
    });
  }

  if (agents.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Corporate Actions Agent must be undefined to perform this procedure',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.BecomeAgent, value: ticker, permissionGroup: KnownPermissionGroup.PolymeshV1Caa },
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

  this.addTransaction(
    tx.identity.addAuthorization,
    {},
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );
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
      tokens: [new SecurityToken({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyCorporateActionsAgent = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCorporateActionsAgent, getAuthorization);
