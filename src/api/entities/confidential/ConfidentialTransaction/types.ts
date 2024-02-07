import BigNumber from 'bignumber.js';

import { ConfidentialTransaction } from '~/internal';
import { ConfidentialAccount, ConfidentialAsset, Identity } from '~/types';

export interface GroupedTransactions {
  pending: ConfidentialTransaction[];
  executed: ConfidentialTransaction[];
  rejected: ConfidentialTransaction[];
}

export interface ConfidentialLeg {
  id: BigNumber;
  sender: ConfidentialAccount;
  receiver: ConfidentialAccount;
  /**
   * The auditors for the leg, grouped by asset they are auditors for. Note: the same auditor may appear for multiple assets
   */
  assetAuditors: { asset: ConfidentialAsset; auditors: ConfidentialAccount[] }[];
  mediators: Identity[];
}

export interface ConfidentialLegStateBalances {
  senderInitBalance: string;
  senderAmount: string;
  receiverAmount: string;
}

/**
 * The confidential state for the leg. When the sender provides proof of funds, this will contain the encrypted balances for the leg
 */
export type ConfidentialLegState =
  | {
      proved: true;
      assetState: { asset: ConfidentialAsset; balances: ConfidentialLegStateBalances }[];
    }
  | { proved: false };

export type ConfidentialLegStateWithId = { legId: BigNumber } & ConfidentialLegState;

/**
 * Status of a confidential transaction
 */
export enum ConfidentialTransactionStatus {
  Pending = 'Pending',
  Executed = 'Executed',
  Rejected = 'Rejected',
}

/**
 * Details for a confidential transaction
 */
export interface ConfidentialTransactionDetails {
  venueId: BigNumber;
  createdAt: BigNumber;
  status: ConfidentialTransactionStatus;
  memo?: string;
}

export enum ConfidentialAffirmParty {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Mediator = 'Mediator',
}

export enum ConfidentialLegParty {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Mediator = 'Mediator',
  Auditor = 'Auditor',
}

export type ConfidentialAffirmation = {
  transaction: ConfidentialTransaction;
  legId: BigNumber;
  role: ConfidentialLegParty;
  affirmed: boolean;
};

export enum TransactionAffirmParty {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Mediator = 'Mediator',
}

export interface ConfidentialLegProof {
  asset: string | ConfidentialAsset;
  proof: string;
}

export interface ConfidentialAffirmTransaction {
  transactionId: BigNumber;
  legId: BigNumber;
  party: ConfidentialAffirmParty;
  proofs?: ConfidentialLegProof[];
}

export interface SenderAffirm {
  party: ConfidentialAffirmParty.Sender;
  proofs: ConfidentialLegProof[];
}

export interface ObserverAffirm {
  party: ConfidentialAffirmParty.Mediator | ConfidentialAffirmParty.Receiver;
}

export type AffirmConfidentialTransactionParams = { legId: BigNumber } & (
  | SenderAffirm
  | ObserverAffirm
);
