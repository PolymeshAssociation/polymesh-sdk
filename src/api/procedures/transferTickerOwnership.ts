import { Identity, Procedure, TickerReservation } from '~/internal';
import { AuthorizationType, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization, SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface TransferTickerOwnershipParams {
  target: string | Identity;
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

  return new TickerReservation({ ticker }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, TickerReservation>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TickerOwner, ticker }],
    signerPermissions: {
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
