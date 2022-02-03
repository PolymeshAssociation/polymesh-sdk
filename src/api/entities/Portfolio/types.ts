import BigNumber from 'bignumber.js';

import { Account, Asset } from '~/internal';
import {
  SettlementDirectionEnum as SettlementDirection,
  SettlementResultEnum as SettlementResult,
} from '~/middleware/types';
import { Balance, Leg } from '~/types';

export interface PortfolioBalance extends Balance {
  asset: Asset;
}

export interface SettlementLeg extends Leg {
  direction: SettlementDirection;
}

export interface HistoricSettlement {
  blockNumber: BigNumber;
  blockHash: string;
  status: SettlementResult;
  /**
   * Array of accounts that participated by affirming the settlement
   */
  accounts: Account[];
  legs: SettlementLeg[];
}
