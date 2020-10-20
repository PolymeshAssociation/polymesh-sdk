// NOTE uncomment in Governance v2 upgrade

import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  CurrentAccount as CurrentAccountClass,
  CurrentIdentity as CurrentIdentityClass,
  DefaultPortfolio as DefaultPortfolioClass,
  Identity as IdentityClass,
  Instruction as InstructionClass,
  NumberedPortfolio as NumberedPortfolioClass,
  Portfolio as PortfolioClass,
  // Proposal as ProposalClass,
  SecurityToken as SecurityTokenClass,
  TickerReservation as TickerReservationClass,
  Venue as VenueClass,
} from './';

export type SecurityToken = InstanceType<typeof SecurityTokenClass>;
export type TickerReservation = InstanceType<typeof TickerReservationClass>;
export type AuthorizationRequest = InstanceType<typeof AuthorizationRequestClass>;
export type Identity = InstanceType<typeof IdentityClass>;
export type CurrentIdentity = InstanceType<typeof CurrentIdentityClass>;
export type Account = InstanceType<typeof AccountClass>;
export type CurrentAccount = InstanceType<typeof CurrentAccountClass>;
export type Venue = InstanceType<typeof VenueClass>;
export type Instruction = InstanceType<typeof InstructionClass>;
export type Portfolio = InstanceType<typeof PortfolioClass>;
export type DefaultPortfolio = InstanceType<typeof DefaultPortfolioClass>;
export type NumberedPortfolio = InstanceType<typeof NumberedPortfolioClass>;
// export type Proposal = InstanceType<typeof ProposalClass>;

export * from './TickerReservation/types';
export * from './SecurityToken/types';
export * from './Venue/types';
export * from './Instruction/types';
export * from './Portfolio/types';
// export * from './Proposal/types';
