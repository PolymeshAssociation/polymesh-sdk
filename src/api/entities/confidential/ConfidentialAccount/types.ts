import { ConfidentialAccount, ConfidentialAsset, ConfidentialTransaction } from '~/internal';
import { EventIdEnum } from '~/types';

export interface ConfidentialAssetBalance {
  asset: ConfidentialAsset;
  balance: string;
}

export interface ApplyIncomingBalanceParams {
  /**
   * Confidential Account to which the incoming balance is to be applied
   */
  account: string | ConfidentialAccount;
  /**
   * Confidential Asset whose balance is to be applied
   */
  asset: string | ConfidentialAsset;
}

export type ConfidentialAssetHistoryEntry = {
  id: string;
  asset: ConfidentialAsset;
  transaction?: ConfidentialTransaction;
  eventId: EventIdEnum;
  amount: string;
};
