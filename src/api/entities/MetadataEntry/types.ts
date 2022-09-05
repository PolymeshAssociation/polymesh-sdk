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

export type MetadataValueDetails = {
  expiry: Date | null;
} & (
  | {
      lockStatus: Exclude<MetadataLockStatus, MetadataLockStatus.LockedUntil>;
    }
  | {
      lockStatus: MetadataLockStatus.LockedUntil;
      lockedUntil: Date;
    }
);

export type MetadataValue = {
  value: string;
} & MetadataValueDetails;

export type GlobalMetadataKey = MetadataDetails & {
  id: BigNumber;
};
