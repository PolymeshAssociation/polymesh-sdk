import {
  AuthorizationRequest as AuthorizationRequestClass,
  Identity as IdentityClass,
  SecurityToken as SecurityTokenClass,
  TickerReservation as TickerReservationClass,
} from './';

export type SecurityToken = InstanceType<typeof SecurityTokenClass>;
export type TickerReservation = InstanceType<typeof TickerReservationClass>;
export type AuthorizationRequest = InstanceType<typeof AuthorizationRequestClass>;
export type Identity = InstanceType<typeof IdentityClass>;

export * from './TickerReservation/types';
export * from './SecurityToken/types';
