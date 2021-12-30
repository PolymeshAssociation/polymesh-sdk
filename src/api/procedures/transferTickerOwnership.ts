import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  Identity,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  TickerReservation,
} from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  RoleType,
  SignerType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface TransferTickerOwnershipParams {
  target: string | Identity;
  /**
   * date at which the authorization request for transfer expires (optional)
   */
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & TransferTickerOwnershipParams;

/**
 * @hidden
 */
export async function prepareTransferTickerOwnership(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, expiry } = args;
  const issuer = await context.getCurrentIdentity();
  let targetIdentity;
  if (typeof target === 'string') {
    targetIdentity = new Identity({ did: target }, context);
  } else {
    targetIdentity = target;
  }

  const tickerReservation = new TickerReservation({ ticker }, context);

  const { status } = await tickerReservation.details();

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'A Security Token with this ticker has already been created',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );
  const authReq: Authorization = {
    type: AuthorizationType.TransferTicker,
    value: ticker,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authReq, context);
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  const [auth] = this.addTransaction(
    tx.identity.addAuthorization,
    {
      resolvers: [
        createAuthorizationResolver(authReq, issuer, targetIdentity, expiry || null, context),
      ],
    },
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );

  return auth;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.TickerOwner, ticker }],
    permissions: {
      tokens: [],
      transactions: [TxTags.identity.AddAuthorization],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const transferTickerOwnership = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareTransferTickerOwnership, getAuthorization);
