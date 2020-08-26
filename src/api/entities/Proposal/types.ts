import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';
import { ProposalState } from '~/middleware/types';

export interface ProposalVote {
  identity: Identity;
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

export interface Call {
  method: string;
  module: string;
}

export interface ProposalDetails {
  pipId: number;
  proposer: string;
  createdAt: number;
  url: string;
  description: string;
  coolOffEndBlock: number;
  endBlock: number;
  call?: Call;
  lastState: ProposalState;
  lastStateUpdatedAt: number;
  totalVotes: number;
  totalAyesWeight: BigNumber;
  totalNaysWeight: BigNumber;
}

export {
  ProposalOrderByInput,
  ProposalState,
  ProposalOrderFields,
  ProposalVotesOrderByInput,
} from '~/middleware/types';
