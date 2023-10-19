import BigNumber from 'bignumber.js';

import { TxTag } from '~/types';

export enum ProposalStatus {
  Invalid = 'Invalid',
  Active = 'Active',
  Expired = 'Expired',
  Successful = 'ExecutionSuccessful',
  Failed = 'ExecutionFailed',
  Rejected = 'Rejected',
}

export interface MultiSigProposalDetails {
  /**
   * The number of approvals this proposal has received
   */
  approvalAmount: BigNumber;
  /**
   * The number of rejections this proposal has received
   */
  rejectionAmount: BigNumber;
  /**
   * The current status of the proposal
   */
  status: ProposalStatus;
  /**
   * An optional time in which this proposal will expire if a decision isn't reached by then
   */
  expiry: Date | null;
  /**
   * Determines if the proposal will automatically be closed once a threshold of reject votes has been reached
   */
  autoClose: boolean;
  /**
   * The tag for the transaction being proposed for the MultiSig to execute
   */
  txTag: TxTag;
  /**
   * The arguments to be passed to the transaction for this proposal
   */
  args: string[];
}

export enum MultiSigProposalAction {
  Approve = 'approve',
  Reject = 'reject',
}
