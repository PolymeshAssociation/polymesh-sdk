import { u64 } from '@polkadot/types';
import P from 'bluebird';

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
    const addMultisigSignerIds: [u64][] = [];
    const attestPrimaryKeyRotationIds: [u64][] = [];
    const becomeAgentIds: [u64][] = [];
    const joinIdentityIds: [u64][] = [];
    const addRelayerPayingKeyIds: [u64][] = [];
    const portfolioCustodyIds: [u64][] = [];
    const rotatePrimaryKeyIds: [u64][] = [];
    const transferAssetOwnershpIds: [u64][] = [];
    const transferTickerIds: [u64][] = [];

    liveRequests.forEach(({ authId, data: { type } }) => {
      const id = tuple(numberToU64(authId, context));
      switch (type) {
        case AuthorizationType.AddMultiSigSigner: {
          addMultisigSignerIds.push(id);
          break;
        }
        case AuthorizationType.AttestPrimaryKeyRotation: {
          attestPrimaryKeyRotationIds.push(id);
          break;
        }
        case AuthorizationType.BecomeAgent: {
          becomeAgentIds.push(id);
          break;
        }
        case AuthorizationType.JoinIdentity: {
          joinIdentityIds.push(id);
          break;
        }
        case AuthorizationType.AddRelayerPayingKey: {
          addRelayerPayingKeyIds.push(id);
          break;
        }
        case AuthorizationType.PortfolioCustody: {
          portfolioCustodyIds.push(id);
          break;
        }
        case AuthorizationType.RotatePrimaryKey: {
          rotatePrimaryKeyIds.push(id);
          break;
        }
        case AuthorizationType.TransferAssetOwnership: {
          transferAssetOwnershpIds.push(id);
          break;
        }
        case AuthorizationType.TransferTicker: {
          transferTickerIds.push(id);
          break;
        }
        default: {
          throw new PolymeshError({
            code: ErrorCode.ValidationError,
            message: 'Attempting to accept a deprecated Authorization type',
            data: {
              type,
            },
          });
        }
      }
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
