import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';

/**
 * Represents a DART confidential account's details
 */
export interface ConfidentialAccountDetails {
  /**
   * Identity that owns this confidential account
   */
  identity: Identity;
  /**
   * The encryption public key associated with this account
   */
  encryptionKey: string;
}

/**
 * Represents the registration status of a confidential account for a specific asset
 */
export interface ConfidentialAccountAssetRegistration {
  /**
   * The confidential asset ID
   */
  assetId: BigNumber;
  /**
   * Whether the account is registered for this asset
   */
  isRegistered: boolean;
}
