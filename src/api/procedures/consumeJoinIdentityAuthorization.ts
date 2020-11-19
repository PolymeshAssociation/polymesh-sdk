import { Account, AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { numberToU64, signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

/**
 * @hidden
 */
export type ConsumeJoinIdentityAuthorizationParams = {
  authRequest: AuthorizationRequest;
  accept: boolean;
};

/**
 * @hidden
 */
export async function prepareConsumeJoinIdentityAuthorization(
  this: Procedure<ConsumeJoinIdentityAuthorizationParams>,
  args: ConsumeJoinIdentityAuthorizationParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const {
    authRequest: { target, authId },
    accept,
  } = args;

  let transaction;

  const rawAuthId = numberToU64(authId, context);

  if (!accept) {
    this.addTransaction(
      identity.removeAuthorization,
      { paidByThirdParty: true },
      signerValueToSignatory(signerToSignerValue(target), context),
      rawAuthId
    );

    return;
  }

  if (target instanceof Account) {
    transaction = identity.joinIdentityAsKey;
  } else {
    transaction = identity.joinIdentityAsIdentity;
  }

  this.addTransaction(transaction, { paidByThirdParty: true }, rawAuthId);
}

/**
 * @hidden
 */
export async function isAuthorized(
  this: Procedure<ConsumeJoinIdentityAuthorizationParams>,
  { authRequest, accept }: ConsumeJoinIdentityAuthorizationParams
): Promise<boolean> {
  const { target, issuer } = authRequest;
  const { context } = this;

  let condition;
  let did: string;
  const fetchDid = async (): Promise<string> => did || (await context.getCurrentIdentity()).did;

  if (target instanceof Account) {
    const { address } = context.getCurrentAccount();
    condition = address === target.address;
  } else {
    did = await fetchDid();
    condition = did === target.did;
  }

  if (!accept) {
    did = await fetchDid();
    condition = condition || did === issuer.did;
  }

  return condition && !authRequest.isExpired();
}

/**
 * @hidden
 */
export const consumeJoinIdentityAuthorization = new Procedure(
  prepareConsumeJoinIdentityAuthorization,
  isAuthorized
);
