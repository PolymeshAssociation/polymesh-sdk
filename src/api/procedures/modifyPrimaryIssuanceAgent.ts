import { Asset, KnownPermissionGroup, PolymeshError, Procedure } from '~/internal';
import {
  AuthorizationType,
  ErrorCode,
  ModifyPrimaryIssuanceAgentParams,
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
export type Params = ModifyPrimaryIssuanceAgentParams & {
  ticker: string;
};

/**
 * @hidden
 *
 * @deprecated in favor of `inviteAgent`
 */
export async function prepareModifyPrimaryIssuanceAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const { target, ticker, requestExpiry } = args;

  const asset = new Asset({ ticker }, context);

  const [invalidDids, { primaryIssuanceAgents }] = await Promise.all([
    context.getInvalidDids([target]),
    asset.details(),
  ]);

  if (primaryIssuanceAgents.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Primary Issuance Agents must be undefined to perform this procedure',
    });
  }

  if (invalidDids.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The supplied Identity does not exist',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.BecomeAgent,
      value: new KnownPermissionGroup({ type: PermissionGroupType.PolymeshV1Pia, ticker }, context),
    },
    context
  );

  let rawExpiry;
  if (requestExpiry) {
    if (requestExpiry <= new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The request expiry must be a future date',
      });
    } else {
      rawExpiry = dateToMoment(requestExpiry, context);
    }
  } else {
    rawExpiry = null;
  }

  this.addTransaction({
    transaction: identity.addAuthorization,
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
export const modifyPrimaryIssuanceAgent = (): Procedure<Params, void> =>
  new Procedure(prepareModifyPrimaryIssuanceAgent, getAuthorization);
