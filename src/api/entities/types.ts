import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  CheckpointSchedule as CheckpointScheduleClass,
  CorporateAction as CorporateActionClass,
  DefaultPortfolio as DefaultPortfolioClass,
  DefaultTrustedClaimIssuer as DefaultTrustedClaimIssuerClass,
  DividendDistribution as DividendDistributionClass,
  Entity as EntityClass,
  Identity as IdentityClass,
  Instruction as InstructionClass,
  NumberedPortfolio as NumberedPortfolioClass,
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
export type Account = InstanceType<typeof AccountClass>;
export type Venue = InstanceType<typeof VenueClass>;
export type Instruction = InstanceType<typeof InstructionClass>;
export type DefaultPortfolio = InstanceType<typeof DefaultPortfolioClass>;
export type NumberedPortfolio = InstanceType<typeof NumberedPortfolioClass>;
export type DefaultTrustedClaimIssuer = InstanceType<typeof DefaultTrustedClaimIssuerClass>;
export type Sto = InstanceType<typeof StoClass>;
export type CheckpointSchedule = InstanceType<typeof CheckpointScheduleClass>;
export type CorporateAction = InstanceType<typeof CorporateActionClass>;
export type DividendDistribution = InstanceType<typeof DividendDistributionClass>;
// export type Proposal = InstanceType<typeof ProposalClass>;

export * from './TickerReservation/types';
export * from './SecurityToken/types';
export * from './Venue/types';
export * from './Instruction/types';
export * from './Portfolio/types';
export * from './Sto/types';
export * from './CheckpointSchedule/types';
export * from './CorporateAction/types';
export * from './DividendDistribution/types';
// export * from './Proposal/types';

/**
 * Return if value is an Entity
 */
export function isEntity<Identifiers = unknown, HumanReadable = unknown>(
  value: unknown
): value is EntityClass<Identifiers, HumanReadable> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!value && typeof (value as any).uuid === 'string';
}
