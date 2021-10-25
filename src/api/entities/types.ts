import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  Checkpoint as CheckpointClass,
  CheckpointSchedule as CheckpointScheduleClass,
  CorporateAction as CorporateActionClass,
  CustomPermissionGroup as CustomPermissionGroupClass,
  DefaultPortfolio as DefaultPortfolioClass,
  DefaultTrustedClaimIssuer as DefaultTrustedClaimIssuerClass,
  DividendDistribution as DividendDistributionClass,
  Identity as IdentityClass,
  Instruction as InstructionClass,
  KnownPermissionGroup as KnownPermissionGroupClass,
  NumberedPortfolio as NumberedPortfolioClass,
  // Proposal as ProposalClass,
  SecurityToken as SecurityTokenClass,
  Sto as StoClass,
  TickerReservation as TickerReservationClass,
  Venue as VenueClass,
} from '~/internal';

export type Account = AccountClass;
export type AuthorizationRequest = AuthorizationRequestClass;
export type Checkpoint = CheckpointClass;
export type CheckpointSchedule = CheckpointScheduleClass;
export type CorporateAction = CorporateActionClass;
export type CustomPermissionGroup = CustomPermissionGroupClass;
export type DefaultPortfolio = DefaultPortfolioClass;
export type DefaultTrustedClaimIssuer = DefaultTrustedClaimIssuerClass;
export type DividendDistribution = DividendDistributionClass;
export type Identity = IdentityClass;
export type Instruction = InstructionClass;
export type KnownPermissionGroup = KnownPermissionGroupClass;
export type NumberedPortfolio = NumberedPortfolioClass;
export type SecurityToken = SecurityTokenClass;
export type Sto = StoClass;
export type TickerReservation = TickerReservationClass;
export type Venue = VenueClass;
// export type Proposal = InstanceType<typeof ProposalClass>;

export * from './CheckpointSchedule/types';
export * from './CorporateActionBase/types';
export * from './DividendDistribution/types';
export * from './Instruction/types';
export * from './Portfolio/types';
export * from './SecurityToken/types';
export * from './Sto/types';
export * from './TickerReservation/types';
export * from './Venue/types';
// export * from './Proposal/types';
