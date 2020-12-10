import { Account, AuthorizationRequest, Procedure } from '~/internal';
import {
  booleanToBool,
  numberToU64,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { getDid } from '~/utils/internal';

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
    const { address } = context.getCurrentAccount();
    const paidByThirdParty = address === signerToString(target);

    this.addTransaction(
      identity.removeAuthorization,
      { paidByThirdParty },
      signerValueToSignatory(signerToSignerValue(target), context),
      rawAuthId,
      booleanToBool(paidByThirdParty, context)
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
  let did: string | undefined;
  const fetchDid = async (): Promise<string> => getDid(did, context);

  if (target instanceof Account) {
    const { address } = context.getCurrentAccount();
    condition = address === target.address;
  } else {
    did = await fetchDid();
    condition = did === target.did;
  }

  if (!accept) {
    try {
      did = await fetchDid();
    } catch (err) {
      // do nothing
    }
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
