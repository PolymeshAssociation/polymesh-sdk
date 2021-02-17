import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, SecurityToken, Venue } from '~/internal';

export enum InstructionStatus {
  Pending = 'Pending',
  Unknown = 'Unknown',
}

export enum InstructionType {
  SettleOnAffirmation = 'SettleOnAffirmation',
  SettleOnBlock = 'SettleOnBlock',
}

export type InstructionDetails = {
  status: InstructionStatus;
  createdAt: Date;
  /**
   * Date at which the trade was agreed upon (optional, for offchain trades)
   */
  tradeDate: Date | null;
  /**
   * Date at which the trade was executed (optional, for offchain trades)
   */
  valueDate: Date | null;
  venue: Venue;
} & (
  | {
      type: InstructionType.SettleOnAffirmation;
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

export enum AffirmationStatus {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Affirmed = 'Affirmed',
  Rejected = 'Rejected',
}

export interface InstructionAffirmation {
  identity: Identity;
  status: AffirmationStatus;
}
