import { TxTags } from 'polymesh-types/types';

import { AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { authTargetToAuthIdentifier, batchArguments, numberToU64 } from '~/utils';

export interface ConsumeParams {
  accept: boolean;
}

/**
 * @hidden
 */
export type ConsumeAuthorizationRequestsParams = ConsumeParams & {
  authRequests: AuthorizationRequest[];
};

/**
 * @hidden
 */
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
    batchArguments(requestIds, TxTags.identity.BatchAcceptAuthorization).forEach(idBatch => {
      this.addTransaction(
        tx.identity.batchAcceptAuthorization,
        { batchSize: idBatch.length },
        idBatch
      );
    });
  } else {
    const authIdentifiers = liveRequests.map(({ authId, targetIdentity }) =>
      authTargetToAuthIdentifier({ authId, did: targetIdentity.did }, context)
    );
    batchArguments(authIdentifiers, TxTags.identity.BatchRemoveAuthorization).forEach(
      identifierBatch => {
        this.addTransaction(
          tx.identity.batchRemoveAuthorization,
          { batchSize: identifierBatch.length },
          identifierBatch
        );
      }
    );
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

  return authRequests.filter(isLive).every(({ targetIdentity, issuerIdentity }) => {
    let condition = did === targetIdentity.did;
    if (!accept) {
      condition = condition || did === issuerIdentity.did;
    }

    return condition;
  });
}

/**
 * @hidden
 */
export const consumeAuthorizationRequests = new Procedure(
  prepareConsumeAuthorizationRequests,
  isAuthorized
);
