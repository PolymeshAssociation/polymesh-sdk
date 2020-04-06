import { AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { authTargetToAuthIdentifier, numberToU64 } from '~/utils';

export interface ConsumeParams {
  accept: boolean;
}

export type ConsumeAuthorizationRequestsParams = ConsumeParams & {
  authRequests: AuthorizationRequest[];
};

const isLive = ({ expiry }: AuthorizationRequest): boolean =>
  expiry === null || expiry > new Date();

/**
 * @hidden
 */
export async function prepareConsumeAuthorizationRequests(
  this: Procedure<ConsumeAuthorizationRequestsParams>,
  args: ConsumeAuthorizationRequestsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { accept, authRequests } = args;

  const liveRequests = authRequests.filter(isLive);

  if (accept) {
    const requestIds = liveRequests.map(({ authId }) => numberToU64(authId, context));
    this.addTransaction(tx.identity.batchAcceptAuthorization, {}, requestIds);
  } else {
    const authIdentifiers = liveRequests.map(({ authId, targetDid }) =>
      authTargetToAuthIdentifier({ authId, did: targetDid }, context)
    );
    this.addTransaction(tx.identity.batchRemoveAuthorization, {}, authIdentifiers);
  }
}

/**
 * @hidden
 */
export function isAuthorized(
  this: Procedure<ConsumeAuthorizationRequestsParams>,
  { authRequests, accept }: ConsumeAuthorizationRequestsParams
): boolean {
  const { did } = this.context.getCurrentIdentity();

  return authRequests.filter(isLive).every(({ targetDid, issuerDid }) => {
    let condition = did === targetDid;
    if (!accept) {
      condition = condition || did === issuerDid;
    }

    return condition;
  });
}

export const consumeAuthorizationRequests = new Procedure(
  prepareConsumeAuthorizationRequests,
  isAuthorized
);
