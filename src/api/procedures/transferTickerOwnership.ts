import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, PolymeshError, Procedure, TickerReservation } from '~/internal';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  RoleType,
  SignerType,
  TickerReservationStatus,
  TransferTickerOwnershipParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

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
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, expiry = null } = args;
  const issuer = await context.getSigningIdentity();
  const targetIdentity = await context.getIdentity(target);

  const tickerReservation = new TickerReservation({ ticker }, context);

  const { status } = await tickerReservation.details();

  if (status === TickerReservationStatus.AssetCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'An Asset with this ticker has already been created',
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
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(authReq, issuer, targetIdentity, expiry, context),
  };
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
      assets: [],
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
