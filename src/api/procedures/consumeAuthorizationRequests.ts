import P from 'bluebird';
import { TxTags } from 'polymesh-types/types';

import { Account, AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { authTargetToAuthIdentifier, numberToU64, signerToSignerValue } from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

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

  const liveRequests = authRequests.filter(request => !request.isExpired());

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
    const authIdentifiers = liveRequests.map(({ authId, target }) =>
      authTargetToAuthIdentifier({ authId, target: signerToSignerValue(target) }, context)
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
export async function isAuthorized(
  this: Procedure<ConsumeAuthorizationRequestsParams>,
  { authRequests, accept }: ConsumeAuthorizationRequestsParams
): Promise<boolean> {
  const { context } = this;

  let did: string;

  const unexpiredRequests = authRequests.filter(request => !request.isExpired());

  const fetchDid = async (): Promise<string> => did || (await context.getCurrentIdentity()).did;

  const authorized = await P.mapSeries(unexpiredRequests, async ({ target, issuer }) => {
    let condition;

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

    return condition;
  });

  return authorized.every(res => res);
}

/**
 * @hidden
 */
export const consumeAuthorizationRequests = new Procedure(
  prepareConsumeAuthorizationRequests,
  isAuthorized
);
