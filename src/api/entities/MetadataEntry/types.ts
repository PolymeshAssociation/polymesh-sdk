import BigNumber from 'bignumber.js';

export enum MetadataType {
  Local = 'Local',
  Global = 'Global',
}

export enum MetadataLockStatus {
  Unlocked = 'Unlocked',
  Locked = 'Locked',
  LockedUntil = 'LockedUntil',
}

export interface MetadataSpec {
  url?: string;
  description?: string;
  typeDef?: string;
}

export interface MetadataDetails {
  name: string;
  specs: MetadataSpec;
}

export interface MetadataValue {
  value: string;
  lockStatus: MetadataLockStatus;
  expiry?: Date;
}

export type GlobalMetadataKey = MetadataDetails & {
  id: BigNumber;
};
