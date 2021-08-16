import { u64 } from '@polkadot/types';
import P from 'bluebird';
import { mapValues } from 'lodash';

import { PolymeshError } from '~/base/PolymeshError';
import { Account, AuthorizationRequest, Procedure } from '~/internal';
import { AuthorizationType, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  booleanToBool,
  numberToU64,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';
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
    const idsPerType: Record<AuthorizationType, [u64][]> = mapValues(AuthorizationType, () => []);

    // const typesToExtrinsics = {
    //   [AuthorizationType.AddMultiSigSigner]: tx.
    // }

    const deprecatedTypes = [
      AuthorizationType.Custom,
      AuthorizationType.NoData,
      AuthorizationType.TransferCorporateActionAgent,
      AuthorizationType.TransferPrimaryIssuanceAgent,
    ];

    liveRequests.forEach(({ authId, data: { type } }) => {
      if (deprecatedTypes.includes(type)) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Cannot accept a deprecated Authorization type',
          data: {
            type,
          },
        });
      }

      const id = tuple(numberToU64(authId, context));

      idsPerType[type].push(id);
    });

    const requestIds = liveRequests.map(({ authId }) => tuple(numberToU64(authId, context)));
    this.addBatchTransaction(tx.identity.acceptAuthorization, {}, requestIds);
  } else {
    const falseBool = booleanToBool(false, context);
    const authIdentifiers = liveRequests.map(({ authId, target }) =>
      tuple(
        signerValueToSignatory(signerToSignerValue(target), context),
        numberToU64(authId, context),
        falseBool
      )
    );
    this.addBatchTransaction(tx.identity.removeAuthorization, {}, authIdentifiers);
  }
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ConsumeAuthorizationRequestsParams>,
  { authRequests, accept }: ConsumeAuthorizationRequestsParams
): Promise<ProcedureAuthorization> {
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

  const transactions = [
    accept ? TxTags.identity.AcceptAuthorization : TxTags.identity.RemoveAuthorization,
  ];

  return {
    roles: authorized.every(res => res),
    permissions: {
      transactions,
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const consumeAuthorizationRequests = (): Procedure<ConsumeAuthorizationRequestsParams> =>
  new Procedure(prepareConsumeAuthorizationRequests, getAuthorization);
