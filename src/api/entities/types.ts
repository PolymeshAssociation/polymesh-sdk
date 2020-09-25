// NOTE uncomment in Governance v2 upgrade

import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  CurrentAccount as CurrentAccountClass,
  CurrentIdentity as CurrentIdentityClass,
  Identity as IdentityClass,
  // Proposal as ProposalClass,
  SecurityToken as SecurityTokenClass,
  TickerReservation as TickerReservationClass,
} from './';

export type SecurityToken = InstanceType<typeof SecurityTokenClass>;
export type TickerReservation = InstanceType<typeof TickerReservationClass>;
export type AuthorizationRequest = InstanceType<typeof AuthorizationRequestClass>;
export type Identity = InstanceType<typeof IdentityClass>;
export type CurrentIdentity = InstanceType<typeof CurrentIdentityClass>;
export type Account = InstanceType<typeof AccountClass>;
export type CurrentAccount = InstanceType<typeof CurrentAccountClass>;
// export type Proposal = InstanceType<typeof ProposalClass>;

export * from './TickerReservation/types';
export * from './SecurityToken/types';
