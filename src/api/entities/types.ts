import {
  BaseAsset,
  Identity as PublicIdentityClass,
} from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  SignerType,
} from '@polymeshassociation/polymesh-sdk/types';

import { TxTag } from '~/generated/types';
import {
  ConfidentialAccount as ConfidentialAccountClass,
  ConfidentialAsset as ConfidentialAssetClass,
  ConfidentialTransaction as ConfidentialTransactionClass,
  ConfidentialVenue as ConfidentialVenueClass,
  Identity as IdentityClass,
} from '~/internal';

export * from '@polymeshassociation/polymesh-sdk/api/entities/types';

export type Identity = IdentityClass;
export type PublicIdentity = PublicIdentityClass;
export type ConfidentialAccount = ConfidentialAccountClass;
export type ConfidentialAsset = ConfidentialAssetClass;
export type ConfidentialVenue = ConfidentialVenueClass;
export type ConfidentialTransaction = ConfidentialTransactionClass;

export * from './ConfidentialAccount/types';
export * from './ConfidentialAsset/types';
export * from './ConfidentialTransaction/types';

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an Account has certain
 *   permissions. Null values represent full permissions in that category
 */
export interface SimplePermissions {
  /**
   * list of required Asset permissions
   */
  assets?: BaseAsset[] | null;
  /**
   * list of required Transaction permissions
   */
  transactions?: TxTag[] | null;
  portfolios?: (DefaultPortfolio | NumberedPortfolio)[] | null;
}

/**
 * Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
 *   has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
 *   Identity has all the necessary external agent Permissions
 */
export interface CheckPermissionsResult<Type extends SignerType> {
  /**
   * required permissions which the signer *DOESN'T* have. Only present if `result` is `false`
   */
  missingPermissions?: Type extends SignerType.Account ? SimplePermissions : TxTag[] | null;
  /**
   * whether the signer complies with the required permissions or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}
