import BigNumber from 'bignumber.js';

import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { AuthorizationRequest, Procedure } from '~/internal';
import { AcceptPrimaryKeyRotationParams, AuthorizationType } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Storage {
  calledByTarget: boolean;
  ownerAuthRequest: AuthorizationRequest;
}

/**
 * @hidden
 */
export async function prepareAcceptPrimaryKeyRotation(
  this: Procedure<AcceptPrimaryKeyRotationParams, void, Storage>
): Promise<TransactionSpec<void, ExtrinsicParams<'identity', 'acceptPrimaryKey'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    storage: { ownerAuthRequest },
    context,
  } = this;

  await assertAuthorizationRequestValid(ownerAuthRequest, context);

  const { authId: ownerAuthId, issuer } = ownerAuthRequest;

  return {
    transaction: identity.acceptPrimaryKey,
    paidForBy: issuer,
    args: [bigNumberToU64(ownerAuthId, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AcceptPrimaryKeyRotationParams, void, Storage>
): ProcedureAuthorization {
  const {
    storage: { calledByTarget },
  } = this;

  return {
    roles:
      calledByTarget ||
      `"${AuthorizationType.RotatePrimaryKey}" Authorization Requests must be accepted by the target Account`,
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<AcceptPrimaryKeyRotationParams, void, Storage>,
  { ownerAuth }: AcceptPrimaryKeyRotationParams
): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const getAuthRequest = (
    auth: BigNumber | AuthorizationRequest
  ): Promise<AuthorizationRequest> => {
    if (auth && auth instanceof BigNumber) {
      return actingAccount.authorizations.getOne({ id: auth });
    }
    return Promise.resolve(auth);
  };

  const ownerAuthRequest = await getAuthRequest(ownerAuth);

  const calledByTarget = actingAccount.isEqual(ownerAuthRequest.target);

  return {
    calledByTarget,
    ownerAuthRequest,
  };
}

/**
 * @hidden
 */
export const acceptPrimaryKeyRotation = (): Procedure<
  AcceptPrimaryKeyRotationParams,
  void,
  Storage
> => new Procedure(prepareAcceptPrimaryKeyRotation, getAuthorization, prepareStorage);
