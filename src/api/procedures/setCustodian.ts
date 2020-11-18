import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationType, ErrorCode, Role, RoleType } from '~/types';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface SetCustodianParams {
  targetIdentity: string | Identity;
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = { did: string; id?: BigNumber } & SetCustodianParams;

/**
 * @hidden
 */
export async function prepareSetCustodian(
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

  const { targetIdentity, expiry, did, id } = args;

  const portfolio = id
    ? new NumberedPortfolio({ did, id }, context)
    : new DefaultPortfolio({ did }, context);

  const currentIdentity = await context.getCurrentIdentity();

  const targetDid = signerToString(targetIdentity);
  const target = new Identity({ did: targetDid }, context);

  const authorizationRequests = await target.authorizations.getReceived({
    type: AuthorizationType.PortfolioCustody,
    includeExpired: false,
  });

  const hasPendingAuth = authorizationRequests.find(authorizationRequest => {
    const { issuer, data } = authorizationRequest;
    const authorizationData = data as { value: NumberedPortfolio | DefaultPortfolio };
    return currentIdentity.did === issuer.did && authorizationData.value.uuid === portfolio.uuid;
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        "The target Identity already has a pending invitation to be the Portfolio's custodian",
    });
  }

  const rawSignatory = signerValueToSignatory(signerToSignerValue(target), context);

  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.PortfolioCustody, value: portfolio },
    context
  );

  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
export function getRequiredRoles({ did, id }: Params): Role[] {
  const portfolioId = { did, id };
  return [{ type: RoleType.PortfolioCustodian, portfolioId }];
}

/**
 * @hidden
 */
export const setCustodian = new Procedure(prepareSetCustodian);
