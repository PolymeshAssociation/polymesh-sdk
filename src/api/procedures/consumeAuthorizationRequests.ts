import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { forEach, mapValues } from 'lodash';

import { PolymeshError } from '~/base/PolymeshError';
import { Account, AuthorizationRequest, Procedure } from '~/internal';
import { AuthorizationType, ErrorCode, TxTag, TxTags } from '~/types';
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
    // auth types not present in this object should not be possible in this procedure
    const typesToExtrinsics = {
      [AuthorizationType.AddRelayerPayingKey]: tx.relayer.acceptPayingKey,
      [AuthorizationType.BecomeAgent]: tx.externalAgents.acceptBecomeAgent,
      [AuthorizationType.PortfolioCustody]: tx.portfolio.acceptPortfolioCustody,
      [AuthorizationType.RotatePrimaryKey]: tx.identity.acceptPrimaryKey,
      [AuthorizationType.TransferAssetOwnership]: tx.asset.acceptAssetOwnershipTransfer,
      [AuthorizationType.TransferTicker]: tx.asset.acceptTickerTransfer,
    } as const;

    type AllowedAuthType = keyof typeof typesToExtrinsics;

    const idsPerType: Record<AllowedAuthType, [u64][]> = mapValues(typesToExtrinsics, () => []);

    const deprecatedTypes = [
      AuthorizationType.Custom,
      AuthorizationType.NoData,
      AuthorizationType.TransferCorporateActionAgent,
      AuthorizationType.TransferPrimaryIssuanceAgent,
    ];

    const deprecatedRequests: { authId: BigNumber; type: AuthorizationType }[] = [];
    liveRequests.forEach(({ authId, data: { type } }) => {
      if (deprecatedTypes.includes(type)) {
        deprecatedRequests.push({ authId, type });

        return;
      }

      const id = tuple(numberToU64(authId, context));

      idsPerType[type as AllowedAuthType].push(id);
    });

    if (deprecatedRequests.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Cannot accept Authorization Requests with a deprecated type',
        data: {
          deprecatedRequests,
          deprecatedTypes,
        },
      });
    }

    forEach(idsPerType, (ids, key) => {
      const type = key as AllowedAuthType;

      // TODO @monitz87: include the attestation auth in the mix (should probably be a different procedure)
      if (type === AuthorizationType.RotatePrimaryKey) {
        this.addBatchTransaction(
          typesToExtrinsics[type],
          {},
          ids.map(([id]) => tuple(id, null))
        );
      } else {
        this.addBatchTransaction(typesToExtrinsics[type], {}, ids);
      }
    });
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

  let transactions: TxTag[] = [TxTags.identity.RemoveAuthorization];

  if (accept) {
    const typesToTags = {
      [AuthorizationType.AddRelayerPayingKey]: TxTags.relayer.AcceptPayingKey,
      [AuthorizationType.BecomeAgent]: TxTags.externalAgents.AcceptBecomeAgent,
      [AuthorizationType.PortfolioCustody]: TxTags.portfolio.AcceptPortfolioCustody,
      [AuthorizationType.RotatePrimaryKey]: TxTags.identity.AcceptPrimaryKey,
      [AuthorizationType.TransferAssetOwnership]: TxTags.asset.AcceptAssetOwnershipTransfer,
      [AuthorizationType.TransferTicker]: TxTags.asset.AcceptTickerTransfer,
    } as const;

    transactions = authRequests.map(
      ({ data: { type } }) => typesToTags[type as keyof typeof typesToTags]
    );
  }

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
