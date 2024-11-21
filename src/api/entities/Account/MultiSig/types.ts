import BigNumber from 'bignumber.js';

import { Account, MultiSig, MultiSigProposal } from '~/internal';
import { AnyJson, ProposalStatus, TxTag } from '~/types';

export interface MultiSigDetails {
  signers: Account[];
  requiredSignatures: BigNumber;
}

export interface MultiSigSigners {
  signerFor: MultiSig;
  signers: Account[];
  isAdmin: boolean;
  isPayer: boolean;
}

export interface HistoricalMultiSigProposal {
  proposal: MultiSigProposal;
  status: ProposalStatus;
  approvalAmount: BigNumber;
  rejectionAmount: BigNumber;
  expiry: Date | null;
  txTag: TxTag;
  args: AnyJson;
}
