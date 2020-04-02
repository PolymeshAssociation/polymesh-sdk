import { SecurityToken } from '~/api/entities';
import { Procedure } from '~/base';
import { AuthorizationType, Role, RoleType } from '~/types';
import { SignerType } from '~/types/internal';
import { authorizationToAuthorizationData, dateToMoment, signerToSignatory } from '~/utils';

export interface TransferTokenOwnershipParams {
  did: string;
  expiry?: Date;
}

export type Params = { ticker: string } & TransferTokenOwnershipParams;

/**
 * @hidden
 */
export async function prepareTransferTokenOwnership(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, did, expiry } = args;

  const rawSignatory = signerToSignatory({ type: SignerType.Identity, value: did }, context);
  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.TransferTokenOwnership, value: ticker },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(
    tx.identity.addAuthorization,
    {},
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const transferTokenOwnership = new Procedure(
  prepareTransferTokenOwnership,
  getRequiredRoles
);
