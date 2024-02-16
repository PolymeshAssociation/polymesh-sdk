import BigNumber from 'bignumber.js';

import { ConfidentialVenue } from '~/internal';
import { EventIdEnum } from '~/middleware/types';
import { ConfidentialAccount, Identity } from '~/types';

export interface ConfidentialAssetDetails {
  owner: Identity;
  totalSupply: BigNumber;
  data: string;
  /**
   * optional ticker value if provided while creating the confidential Asset
   */
  ticker?: string;
}

export interface GroupedAuditors {
  auditors: ConfidentialAccount[];
  mediators: Identity[];
}

export interface CreateConfidentialAssetParams {
  /**
   * custom data to be associated with the Confidential Asset
   */
  data: string;
  /**
   * optional ticker to be assigned to the Confidential Asset
   */
  ticker?: string;
  /**
   * list of auditors for the Confidential Asset
   */
  auditors: (ConfidentialAccount | string)[];
  /**
   * optional list of mediators for the Confidential Asset
   */
  mediators?: (Identity | string)[];
}

export interface CreateConfidentialAccountParams {
  publicKey: string;
}

export interface IssueConfidentialAssetParams {
  /**
   * number of confidential Assets to be minted
   */
  amount: BigNumber;
  /**
   * the asset issuer's Confidential Account to receive the minted Assets
   */
  account: ConfidentialAccount | string;
}

export type ConfidentialVenueFilteringDetails =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      allowedConfidentialVenues: ConfidentialVenue[];
    };

export type ConfidentialAssetTransactionHistory = {
  id: string;
  assetId: string;
  amount: string;
  fromId?: string;
  toId?: string;
  memo?: string;
  eventId: EventIdEnum;
  datetime: Date;
  createdBlockId: BigNumber;
};
