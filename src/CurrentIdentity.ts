import {
  Context,
  createSecurityToken,
  CreateSecurityTokenWithTickerParams,
  createVenue,
  CreateVenueParams,
  reserveTicker,
  ReserveTickerParams,
  SecurityToken,
  TickerReservation,
  Venue,
} from '~/internal';
import { ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles functionality related to the Current Identity
 */
export class CurrentIdentity {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.createVenue = createProcedureMethod(
      { getProcedureAndArgs: args => [createVenue, args] },
      context
    );
    this.reserveTicker = createProcedureMethod(
      {
        getProcedureAndArgs: args => [reserveTicker, args],
      },
      context
    );
    this.createToken = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createSecurityToken, { reservationRequired: false, ...args }],
      },
      context
    );
  }

  /**
   * Create a Venue under the ownership of the Current Identity
   */
  public createVenue: ProcedureMethod<CreateVenueParams, Venue>;

  /**
   * Reserve a ticker symbol under the ownership of the Current Identity to later use in the creation of a Security Token.
   *   The ticker will expire after a set amount of time, after which other users can reserve it
   */
  public reserveTicker: ProcedureMethod<ReserveTickerParams, TickerReservation>;

  /**
   * Create a Security Token
   *
   * @note if ticker is already reserved, then required role:
   *   - Ticker Owner
   */
  public createToken: ProcedureMethod<CreateSecurityTokenWithTickerParams, SecurityToken>;
}
