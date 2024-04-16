/* istanbul ignore file */

import { ConfidentialAssetOwnerRole, ConfidentialVenueOwnerRole, Role, RoleType } from '~/types';

/**
 * Return whether Role is VenueOwnerRole
 */
export function isConfidentialVenueOwnerRole(role: Role): role is ConfidentialVenueOwnerRole {
  return role.type === RoleType.ConfidentialVenueOwner;
}

/**
 * Return whether Role is ConfidentialAssetOwnerRole
 */
export function isConfidentialAssetOwnerRole(role: Role): role is ConfidentialAssetOwnerRole {
  return role.type === RoleType.ConfidentialAssetOwner;
}
