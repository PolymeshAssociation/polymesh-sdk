// NOTE uncomment in Governance v2 upgrade

import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  CheckpointSchedule as CheckpointScheduleClass,
  CorporateAction as CorporateActionClass,
  CurrentAccount as CurrentAccountClass,
  CurrentIdentity as CurrentIdentityClass,
  DefaultPortfolio as DefaultPortfolioClass,
  DefaultTrustedClaimIssuer as DefaultTrustedClaimIssuerClass,
  Identity as IdentityClass,
  Instruction as InstructionClass,
  NumberedPortfolio as NumberedPortfolioClass,
  Portfolio as PortfolioClass,
  // Proposal as ProposalClass,
  SecurityToken as SecurityTokenClass,
  Sto as StoClass,
  TickerReservation as TickerReservationClass,
  Venue as VenueClass,
} from '~/internal';

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
export type DefaultTrustedClaimIssuer = InstanceType<typeof DefaultTrustedClaimIssuerClass>;
export type Sto = InstanceType<typeof StoClass>;
export type CheckpointSchedule = InstanceType<typeof CheckpointScheduleClass>;
export type CorporateAction = InstanceType<typeof CorporateActionClass>;
// export type Proposal = InstanceType<typeof ProposalClass>;

export * from './TickerReservation/types';
export * from './SecurityToken/types';
export * from './Venue/types';
export * from './Instruction/types';
export * from './Portfolio/types';
export * from './Sto/types';
export * from './CorporateAction/types';
// export * from './Proposal/types';
