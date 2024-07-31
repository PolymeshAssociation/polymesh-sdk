import { Identity } from '~/internal';
import { ConfidentialAccount, ConfidentialAsset, ConfidentialLegProof } from '~/types';

export * from '@polymeshassociation/polymesh-sdk/api/procedures/types';
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

export interface MoveFundsParams {
  from: string | ConfidentialAccount;
  to: string | ConfidentialAccount;
  proofs: ConfidentialLegProof[];
}

export interface MoveFundsArgs extends Array<MoveFundsParams> {}
