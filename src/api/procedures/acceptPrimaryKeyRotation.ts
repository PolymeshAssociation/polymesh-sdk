import BigNumber from 'bignumber.js';

import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { AuthorizationRequest, PolymeshError, Procedure } from '~/internal';
import { AcceptPrimaryKeyRotationParams, AuthorizationType, ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64 } from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export interface Storage {
  calledByTarget: boolean;
  ownerAuthRequest: AuthorizationRequest;
  cddAuthRequest: AuthorizationRequest | undefined;
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
    storage: { ownerAuthRequest, cddAuthRequest },
    context,
  } = this;

  const validationPromises = [assertAuthorizationRequestValid(ownerAuthRequest, context)];
  if (cddAuthRequest) {
    validationPromises.push(assertAuthorizationRequestValid(cddAuthRequest, context));
  }

  await Promise.all(validationPromises);

  const { authId: ownerAuthId, issuer } = ownerAuthRequest;

  if (context.isV7) {
    return {
      transaction: identity.acceptPrimaryKey,
      paidForBy: issuer,
      args: [
        bigNumberToU64(ownerAuthId, context),
        optionize(bigNumberToU64)(cddAuthRequest?.authId, context),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      resolver: undefined,
    };
  }

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
  { ownerAuth, cddAuth }: AcceptPrimaryKeyRotationParams
): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  if (!context.isV7 && cddAuth) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'CDD is discontinued since v8',
    });
  }

  const getAuthRequest = (
    auth: BigNumber | AuthorizationRequest
  ): Promise<AuthorizationRequest> => {
    if (auth && auth instanceof BigNumber) {
      return actingAccount.authorizations.getOne({ id: auth });
    }
    return Promise.resolve(auth);
  };

  const ownerAuthRequest = await getAuthRequest(ownerAuth);

  let calledByTarget = actingAccount.isEqual(ownerAuthRequest.target);

  let cddAuthRequest;
  if (cddAuth) {
    cddAuthRequest = await getAuthRequest(cddAuth);
    calledByTarget = calledByTarget && actingAccount.isEqual(cddAuthRequest.target);
  }

  return {
    calledByTarget,
    ownerAuthRequest,
    cddAuthRequest,
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
