import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { AuthorizationType, ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization, SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ModifyCorporateActionsAgentParams {
  target: string | Identity;
  requestExpiry?: Date;
}

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

  const securityToken = new SecurityToken({ ticker }, context);

  const [invalidDids, agent] = await Promise.all([
    context.getInvalidDids([target]),
    securityToken.corporateActions.getAgent(),
  ]);

  if (invalidDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied Identity does not exist',
    });
  }

  if (agent.did === signerToString(target)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied Identity is already the Corporate Actions Agent',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.TransferCorporateActionAgent, value: ticker },
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
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
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
