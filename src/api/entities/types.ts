import { Identity as PublicIdentityClass } from '@polymeshassociation/polymesh-sdk/internal';

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

export * from './ConfidentialAsset/types';
export * from './ConfidentialTransaction/types';
export * from './ConfidentialAccount/types';
