import { EventIdentifier } from '@polymeshassociation/polymesh-sdk/types';
import BigNumber from 'bignumber.js';

import { ConfidentialAccount, ConfidentialAsset } from '~/internal';
import { EventIdEnum } from '~/types';

export interface CreateConfidentialAccountParams {
  /**
   * Public key of the ElGamal key pair
   */
  publicKey: string;
}

export interface ConfidentialAssetBalance {
  confidentialAsset: ConfidentialAsset;
  /**
   * encrypted balance
   */
  balance: string;
}

export interface ApplyIncomingBalanceParams {
  /**
   * Confidential Account (or the public key of the ElGamal key pair) to which the incoming balance is to be applied
   */
  confidentialAccount: string | ConfidentialAccount;
  /**
   * Confidential Asset whose balance is to be applied
   */
  confidentialAsset: string | ConfidentialAsset;
}

export type ConfidentialAssetHistoryEntry = {
  asset: ConfidentialAsset;
  eventId: EventIdEnum;
  amount: string;
  createdAt: EventIdentifier | null;
};

export interface ApplyIncomingConfidentialAssetBalancesParams {
  /**
   * Confidential Account (or the public key of the ElGamal key pair) to which any incoming balance is to be applied
   */
  confidentialAccount: string | ConfidentialAccount;

  /**
   * The maximum number of incoming balances to apply. Applies all incoming balances if no value is passed
   */
  maxUpdates?: BigNumber;
}

export interface IncomingConfidentialAssetBalance {
  /**
   * Confidential Asset whose balance has been applied
   */
  asset: ConfidentialAsset;
  /**
   * Encrypted amount that was applied
   */
  amount: string;
  /**
   * Encrypted balance after the `amount` was applied
   */
  balance: string;
}
