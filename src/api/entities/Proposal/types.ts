import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';
import { ProposalState } from '~/middleware/types';

export interface CallArguments {
  name: string;
  value: string;
}

export interface Call {
  args: CallArguments[];
  functionalCall: string;
  extrinsic: string;
  module: string;
}

export interface Metadata {
  proposer: Identity;
  createdAt: Date;
  endBlock: number;
  description?: string;
  url?: string;
  coolOff: number;
  lastStateUpdated: number;
  ayesBonded: BigNumber;
  naysBonded: BigNumber;
  totalVotes: number;
}

export interface Proposal {
  call: Call;
  metadata: Metadata;
  state: ProposalState;
}

export interface ProposalVote {
  identity: Identity;
  vote: boolean;
  weight: BigNumber;
}

export interface ProposalTimeFrames {
  duration: number;
  coolOff: number;
}

export { ProposalOrderByInput, ProposalState } from '~/middleware/types';
