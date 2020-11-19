import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, SecurityToken, Venue } from '~/internal';

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
  /**
   * If null, the instruction is valid immediately
   */
  validFrom: Date | null;
  venue: Venue;
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
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  amount: BigNumber;
  token: SecurityToken;
}

export enum AuthorizationStatus {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Authorized = 'Authorized',
  Rejected = 'Rejected',
}

export interface InstructionAuthorization {
  identity: Identity;
  authorizationStatus: AuthorizationStatus;
}
