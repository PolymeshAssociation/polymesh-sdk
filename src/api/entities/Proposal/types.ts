import BigNumber from 'bignumber.js';
import { TxTag } from 'polymesh-types/types';

import { Account } from '~/internal';
// import { ProposalState } from '~/middleware/types';

export interface ProposalVote {
  account: Account;
  vote: boolean;
  weight: BigNumber;
}

export interface ProposalTimeFrames {
  duration: number;
  coolOff: number;
}

export enum ProposalStage {
  CoolOff = 'CoolOff',
  Open = 'Open',
  Ended = 'Ended',
}

export interface ProposalDetails {
  proposerAddress: string;
  createdAt: BigNumber;
  discussionUrl: string;
  description: string;
  coolOffEndBlock: BigNumber;
  endBlock: BigNumber;
  transaction: TxTag | null;
  // lastState: ProposalState;
  lastStateUpdatedAt: BigNumber;
  totalVotes: BigNumber;
  totalAyesWeight: BigNumber;
  totalNaysWeight: BigNumber;
}

export {
  ProposalOrderByInput,
  ProposalState,
  ProposalOrderFields,
  ProposalVotesOrderByInput,
} from '~/middleware/types';
