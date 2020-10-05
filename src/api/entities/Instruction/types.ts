import BigNumber from 'bignumber.js';

import { Identity, SecurityToken } from '~/api/entities';

export enum InstructionStatus {
  Pending = 'Pending',
  Unknown = 'Unknown',
}

export enum InstructionType {
  SettleOnAuthorization = 'SettleOnAuthorization',
  SettleOnBlock = 'SettleOnBlock',
}

export type InstructionDetails = {
  status: InstructionStatus;
  createdAt: Date;
  validFrom: Date;
} & (
  | {
      type: InstructionType.SettleOnAuthorization;
    }
  | {
      type: InstructionType.SettleOnBlock;
      endBlock: BigNumber;
    }
);

export interface Leg {
  from: Identity; // NOTE @monitz87: change these identities to portfolios when the entity exists
  to: Identity;
  amount: BigNumber;
  token: SecurityToken;
}
