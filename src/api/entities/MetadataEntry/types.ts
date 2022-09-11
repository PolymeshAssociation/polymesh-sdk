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
  /**
   * Date at which the Metadata value expires, null if it never expires
   */
  expiry: Date | null;
} & (
  | {
      /**
       * Lock status of the Metadata value
       */
      lockStatus: Exclude<MetadataLockStatus, MetadataLockStatus.LockedUntil>;
    }
  | {
      /**
       * Lock status of the Metadata value
       */
      lockStatus: MetadataLockStatus.LockedUntil;
      /**
       * Date till which the Metadata value will be locked
       */
      lockedUntil: Date;
    }
);

export type MetadataValue = {
  value: string;
} & MetadataValueDetails;

export type GlobalMetadataKey = MetadataDetails & {
  id: BigNumber;
};
