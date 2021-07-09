import { Identity, PolymeshError, Procedure, TickerReservation } from '~/internal';
import { AuthorizationType, ErrorCode, RoleType, TickerReservationStatus, TxTags } from '~/types';
import { ProcedureAuthorization, SignerType } from '~/types/internal';
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
  this: Procedure<Params, TickerReservation>,
  args: Params
): Promise<TickerReservation> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, expiry } = args;

  const tickerReservation = new TickerReservation({ ticker }, context);

  const { status } = await tickerReservation.details();

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A Security Token with this ticker has already been created',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );
  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.TransferTicker, value: ticker },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(
    tx.identity.addAuthorization,
    {},
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );

  return tickerReservation;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, TickerReservation>,
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
export const transferTickerOwnership = (): Procedure<Params, TickerReservation> =>
  new Procedure(prepareTransferTickerOwnership, getAuthorization);
