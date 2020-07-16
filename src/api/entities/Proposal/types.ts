import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';

export interface Proposal {
  call: Call;
  metadata: Metadata;
  state: ProposalState;
}

export interface Call {
  args: CallArguments[];
  functionalCall: string;
  extrinsic: string;
  module: string;
}

export interface CallArguments {
  name: string;
  value: string;
}

export interface Metadata {
  proposer: Identity;
  createdAt: Date;
  endBlock: number;
  description: string;
  url: string;
  coolOff: number;
  lastStateUpdated: number;
  ayesBonded: BigNumber;
  naysBonded: BigNumber;
  totalVotes: number;
}

export enum ProposalState {
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  Killed = 'Killed',
  Rejected = 'Rejected',
  Referendum = 'Referendum',
}
