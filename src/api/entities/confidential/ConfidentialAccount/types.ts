import { ConfidentialAccount, ConfidentialAsset } from '~/internal';

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
