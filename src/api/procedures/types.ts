import { Identity } from '~/internal';
import { ConfidentialAccount, ConfidentialAsset } from '~/types';
export interface ConfidentialTransactionLeg {
  /**
   * The assets (or their IDs) for this leg of the transaction. Amounts are specified in the later proof generation steps
   */
  assets: (ConfidentialAsset | string)[];
  /**
   * The account from which the assets will be withdrawn from
   */
  sender: ConfidentialAccount | string;
  /**
   * The account to which the assets will be deposited in
   */
  receiver: ConfidentialAccount | string;
  /**
   * Auditors for the transaction leg
   */
  auditors: (ConfidentialAccount | string)[];
  /**
   * Mediators for the transaction leg
   */
  mediators: (Identity | string)[];
}

export interface AddConfidentialTransactionParams {
  /**
   * array of Confidential Asset movements
   */
  legs: ConfidentialTransactionLeg[];
  /**
   * an optional note to help differentiate transactions
   */
  memo?: string;
}

export interface AddConfidentialTransactionsParams {
  transactions: AddConfidentialTransactionParams[];
}

export interface FreezeConfidentialAccountAssetParams {
  confidentialAccount: ConfidentialAccount | string;
}
