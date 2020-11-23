import P from 'bluebird';

import { Account, AuthorizationRequest, Procedure } from '~/internal';
import { tuple } from '~/types/utils';
import { numberToU64, signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';
import { getDid } from '~/utils/internal';

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
    const requestIds = liveRequests.map(({ authId }) => tuple(numberToU64(authId, context)));
    this.addBatchTransaction(tx.identity.acceptAuthorization, {}, requestIds);
  } else {
    const authIdentifiers = liveRequests.map(({ authId, target }) =>
      tuple(
        signerValueToSignatory(signerToSignerValue(target), context),
        numberToU64(authId, context)
      )
    );
    this.addBatchTransaction(tx.identity.removeAuthorization, {}, authIdentifiers);
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

  const fetchDid = async (): Promise<string> => getDid(did, context);

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
