/* istanbul ignore file */

import {
  Account,
  AuthorizationRequest,
  BaseAsset,
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  CustomPermissionGroup,
  DefaultPortfolio,
  DefaultTrustedClaimIssuer,
  DividendDistribution,
  Entity,
  FungibleAsset,
  Identity,
  Instruction,
  KnownPermissionGroup,
  NumberedPortfolio,
  Offering,
  PolymeshError,
  PolymeshTransaction,
  PolymeshTransactionBatch,
  TickerReservation,
  Venue,
} from '~/internal';
import {
  AccreditedClaim,
  AffiliateClaim,
  BlockedClaim,
  BuyLockupClaim,
  CddClaim,
  CddProviderRole,
  Claim,
  ClaimType,
  ConditionType,
  ExemptedClaim,
  IdentityCondition,
  IdentityRole,
  InputCondition,
  InputConditionBase,
  JurisdictionClaim,
  KycClaim,
  MultiClaimCondition,
  NftCollection,
  PortfolioCustodianRole,
  ProposalStatus,
  Role,
  RoleType,
  ScopedClaim,
  SellLockupClaim,
  SingleClaimCondition,
  TickerOwnerRole,
  UnscopedClaim,
  VenueOwnerRole,
} from '~/types';

/**
 * Return whether value is an Entity
 */
export function isEntity<Identifiers = unknown, HumanReadable = unknown>(
  value: unknown
): value is Entity<Identifiers, HumanReadable> {
  return value instanceof Entity;
}

/**
 * Return whether value is an Account
 */
export function isAccount(value: unknown): value is Account {
  return value instanceof Account;
}

/**
 * Return whether value is an AuthorizationRequest
 */
export function isAuthorizationRequest(value: unknown): value is AuthorizationRequest {
  return value instanceof AuthorizationRequest;
}

/**
 * Return whether value is a Checkpoint
 */
export function isCheckpoint(value: unknown): value is Checkpoint {
  return value instanceof Checkpoint;
}

/**
 * Return whether value is a CheckpointSchedule
 */
export function isCheckpointSchedule(value: unknown): value is CheckpointSchedule {
  return value instanceof CheckpointSchedule;
}

/**
 * Return whether value is a CorporateAction
 */
export function isCorporateAction(value: unknown): value is CorporateAction {
  return value instanceof CorporateAction;
}

/**
 * Return whether value is a CustomPermissionGroup
 */
export function isCustomPermissionGroup(value: unknown): value is CustomPermissionGroup {
  return value instanceof CustomPermissionGroup;
}

/**
 * Return whether value is a DefaultPortfolio
 */
export function isDefaultPortfolio(value: unknown): value is DefaultPortfolio {
  return value instanceof DefaultPortfolio;
}

/**
 * Return whether value is a DefaultTrustedClaimIssuer
 */
export function isDefaultTrustedClaimIssuer(value: unknown): value is DefaultTrustedClaimIssuer {
  return value instanceof DefaultTrustedClaimIssuer;
}

/**
 * Return whether value is a DividendDistribution
 */
export function isDividendDistribution(value: unknown): value is DividendDistribution {
  return value instanceof DividendDistribution;
}

/**
 * Return whether value is an Identity
 */
export function isIdentity(value: unknown): value is Identity {
  return value instanceof Identity;
}

/**
 * Return whether value is an Instruction
 */
export function isInstruction(value: unknown): value is Instruction {
  return value instanceof Instruction;
}

/**
 * Return whether value is a KnownPermissionGroup
 */
export function isKnownPermissionGroup(value: unknown): value is KnownPermissionGroup {
  return value instanceof KnownPermissionGroup;
}

/**
 * Return whether value is a NumberedPortfolio
 */
export function isNumberedPortfolio(value: unknown): value is NumberedPortfolio {
  return value instanceof NumberedPortfolio;
}

/**
 * Return whether value is an Offering
 */
export function isOffering(value: unknown): value is Offering {
  return value instanceof Offering;
}

/**
 * Return whether value is a TickerReservation
 */
export function isTickerReservation(value: unknown): value is TickerReservation {
  return value instanceof TickerReservation;
}

/**
 * Return whether value is a Venue
 */
export function isVenue(value: unknown): value is Venue {
  return value instanceof Venue;
}

/**
 * Return whether value is a PolymeshError
 */
export function isPolymeshError(value: unknown): value is PolymeshError {
  return value instanceof PolymeshError;
}

/**
 * Return whether a Claim is an UnscopedClaim
 */
export function isUnscopedClaim(claim: Claim): claim is UnscopedClaim {
  return [ClaimType.CustomerDueDiligence].includes(claim.type);
}

/**
 * Return whether a Claim is a ScopedClaim
 */
export function isScopedClaim(claim: Claim): claim is ScopedClaim {
  return !isUnscopedClaim(claim);
}

/**
 * Return whether Claim is an AccreditedClaim
 */
export function isAccreditedClaim(claim: Claim): claim is AccreditedClaim {
  return claim.type === ClaimType.Accredited;
}

/**
 * Return whether Claim is an AffiliateClaim
 */
export function isAffiliateClaim(claim: Claim): claim is AffiliateClaim {
  return claim.type === ClaimType.Affiliate;
}

/**
 * Return whether Claim is a BuyLockupClaim
 */
export function isBuyLockupClaim(claim: Claim): claim is BuyLockupClaim {
  return claim.type === ClaimType.BuyLockup;
}

/**
 * Return whether Claim is a SellLockupClaim
 */
export function isSellLockupClaim(claim: Claim): claim is SellLockupClaim {
  return claim.type === ClaimType.SellLockup;
}

/**
 * Return whether Claim is a CddClaim
 */
export function isCddClaim(claim: Claim): claim is CddClaim {
  return claim.type === ClaimType.CustomerDueDiligence;
}

/**
 * Return whether Claim is a KycClaim
 */
export function isKycClaim(claim: Claim): claim is KycClaim {
  return claim.type === ClaimType.KnowYourCustomer;
}

/**
 * Return whether Claim is a JurisdictionClaim
 */
export function isJurisdictionClaim(claim: Claim): claim is JurisdictionClaim {
  return claim.type === ClaimType.Jurisdiction;
}

/**
 * Return whether Claim is an ExemptedClaim
 */
export function isExemptedClaim(claim: Claim): claim is ExemptedClaim {
  return claim.type === ClaimType.Exempted;
}

/**
 * Return whether Claim is a BlockedClaim
 */
export function isBlockedClaim(claim: Claim): claim is BlockedClaim {
  return claim.type === ClaimType.Blocked;
}

/**
 * Return whether Condition has a single Claim
 */
export function isSingleClaimCondition(
  condition: InputCondition
): condition is InputConditionBase & SingleClaimCondition {
  return [ConditionType.IsPresent, ConditionType.IsAbsent].includes(condition.type);
}

/**
 * Return whether Condition has multiple Claims
 */
export function isMultiClaimCondition(
  condition: InputCondition
): condition is InputConditionBase & MultiClaimCondition {
  return [ConditionType.IsAnyOf, ConditionType.IsNoneOf].includes(condition.type);
}

/**
 * Return whether Condition has multiple Claims
 */
export function isIdentityCondition(
  condition: InputCondition
): condition is InputConditionBase & IdentityCondition {
  return condition.type === ConditionType.IsIdentity;
}

/**
 * Return whether Role is PortfolioCustodianRole
 */
export function isPortfolioCustodianRole(role: Role): role is PortfolioCustodianRole {
  return role.type === RoleType.PortfolioCustodian;
}

/**
 * Return whether Role is VenueOwnerRole
 */
export function isVenueOwnerRole(role: Role): role is VenueOwnerRole {
  return role.type === RoleType.VenueOwner;
}

/**
 * Return whether Role is CddProviderRole
 */
export function isCddProviderRole(role: Role): role is CddProviderRole {
  return role.type === RoleType.CddProvider;
}

/**
 * Return whether Role is TickerOwnerRole
 */
export function isTickerOwnerRole(role: Role): role is TickerOwnerRole {
  return role.type === RoleType.TickerOwner;
}

/**
 * Return whether Role is IdentityRole
 */
export function isIdentityRole(role: Role): role is IdentityRole {
  return role.type === RoleType.Identity;
}
/**
 * Return whether value is a PolymeshTransaction
 */
export function isPolymeshTransaction<
  ReturnValue,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[] = unknown[]
>(value: unknown): value is PolymeshTransaction<ReturnValue, TransformedReturnValue, Args> {
  return value instanceof PolymeshTransaction;
}

/**
 * Return whether value is a PolymeshTransactionBatch
 */
export function isPolymeshTransactionBatch<
  ReturnValue,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[][] = unknown[][]
>(value: unknown): value is PolymeshTransactionBatch<ReturnValue, TransformedReturnValue, Args> {
  return value instanceof PolymeshTransactionBatch;
}

/**
 * @hidden
 */
export function isProposalStatus(status: string): status is ProposalStatus {
  return status in ProposalStatus;
}

/**
 * Return whether an asset is a FungibleAsset
 */
export function isFungibleAsset(asset: BaseAsset): asset is FungibleAsset {
  return asset instanceof FungibleAsset;
}

/**
 * Return whether an asset is a NftCollection
 */
export function isNftCollection(asset: BaseAsset): asset is NftCollection {
  return asset instanceof FungibleAsset;
}
