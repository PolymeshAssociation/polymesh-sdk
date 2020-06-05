import { chunk } from 'lodash';

import { AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { TxTags } from '~/polkadot';
import { authTargetToAuthIdentifier, numberToU64 } from '~/utils';
import { MAX_BATCH_ELEMENTS } from '~/utils/constants';

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
    chunk(requestIds, MAX_BATCH_ELEMENTS[TxTags.identity.BatchAcceptAuthorization]).forEach(
      idChunk => {
        this.addTransaction(
          tx.identity.batchAcceptAuthorization,
          { batchSize: idChunk.length },
          idChunk
        );
      }
    );
  } else {
    const authIdentifiers = liveRequests.map(({ authId, targetIdentity }) =>
      authTargetToAuthIdentifier({ authId, did: targetIdentity.did }, context)
    );
    chunk(authIdentifiers, MAX_BATCH_ELEMENTS[TxTags.identity.BatchRemoveAuthorization]).forEach(
      identifierChunk => {
        this.addTransaction(
          tx.identity.batchRemoveAuthorization,
          { batchSize: identifierChunk.length },
          identifierChunk
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

export const consumeAuthorizationRequests = new Procedure(
  prepareConsumeAuthorizationRequests,
  isAuthorized
);
