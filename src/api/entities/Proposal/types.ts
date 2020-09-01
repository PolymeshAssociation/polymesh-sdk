import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';
import { ProposalState } from '~/middleware/types';
import { TxTag } from '~/polkadot';

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

export interface ProposalDetails {
  proposerAddress: string;
  createdAt: number;
  discussionUrl: string;
  description: string;
  coolOffEndBlock: number;
  endBlock: number;
  transaction?: TxTag;
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
