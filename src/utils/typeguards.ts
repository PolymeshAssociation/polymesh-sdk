/* istanbul ignore file */

import {
  Account,
  Asset,
  AuthorizationRequest,
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  CustomPermissionGroup,
  DefaultPortfolio,
  DefaultTrustedClaimIssuer,
  DividendDistribution,
  Entity,
  Identity,
  Instruction,
  KnownPermissionGroup,
  NumberedPortfolio,
  PolymeshError,
  Sto,
  TickerReservation,
  Venue,
} from '~/internal';

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
 * Return whether value is an Asset
 */
export function isAsset(value: unknown): value is Asset {
  return value instanceof Asset;
}

/**
 * Return whether value is an Sto
 */
export function isSto(value: unknown): value is Sto {
  return value instanceof Sto;
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
