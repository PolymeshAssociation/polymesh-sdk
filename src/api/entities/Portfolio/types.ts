import BigNumber from 'bignumber.js';

import { Leg } from '~/api/entities/Instruction/types';
import { Account, SecurityToken } from '~/internal';
import {
  SettlementDirectionEnum as SettlementDirection,
  SettlementResultEnum as SettlementResult,
} from '~/middleware/types';

export interface PortfolioBalance {
  token: SecurityToken;
  total: BigNumber;
  locked: BigNumber;
}

export interface SettlementLeg extends Leg {
  direction: SettlementDirection;
}

export interface HistoricSettlement {
  blockNumber: BigNumber;
  status: SettlementResult;
  /**
   * Array of accounts that participated by affirming the settlement
   */
  accounts: Account[];
  legs: SettlementLeg[];
}
