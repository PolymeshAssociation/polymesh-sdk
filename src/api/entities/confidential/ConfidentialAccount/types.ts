import { ConfidentialAccount, ConfidentialAsset } from '~/internal';

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
