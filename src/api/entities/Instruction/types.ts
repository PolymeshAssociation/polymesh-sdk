import BigNumber from 'bignumber.js';

import {
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  Nft,
  NumberedPortfolio,
  Venue,
} from '~/internal';
import { EventIdentifier, NftCollection } from '~/types';

export enum InstructionStatus {
  Pending = 'Pending',
  Failed = 'Failed',
  Success = 'Success',
  Rejected = 'Rejected',
}

export enum InstructionType {
  SettleOnAffirmation = 'SettleOnAffirmation',
  SettleOnBlock = 'SettleOnBlock',
  SettleManual = 'SettleManual',
}

export type InstructionEndCondition =
  | {
      type: InstructionType.SettleOnAffirmation;
    }
  | {
      type: InstructionType.SettleOnBlock;
      endBlock: BigNumber;
    }
  | {
      type: InstructionType.SettleManual;
      endAfterBlock: BigNumber;
    };

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
  memo: string | null;
} & InstructionEndCondition;

export interface FungibleLeg {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  amount: BigNumber;
  asset: FungibleAsset;
}

export interface NftLeg {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  nfts: Nft[];
  asset: NftCollection;
}

export type Leg = FungibleLeg | NftLeg;

export enum AffirmationStatus {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Affirmed = 'Affirmed',
}

export interface InstructionAffirmation {
  identity: Identity;
  status: AffirmationStatus;
}

export type InstructionStatusResult =
  | {
      status: InstructionStatus.Pending;
    }
  | {
      status: Exclude<InstructionStatus, InstructionStatus.Pending>;
      eventIdentifier: EventIdentifier;
    };
