import BigNumber from 'bignumber.js';

import { Account, Asset } from '~/internal';
import { SettlementResultEnum as SettlementResult } from '~/middleware/enums';
import { SettlementDirectionEnum as SettlementDirection } from '~/middleware/typesV1';
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
   * Array of Accounts that participated by affirming the settlement
   */
  accounts: Account[];
  legs: SettlementLeg[];
}
