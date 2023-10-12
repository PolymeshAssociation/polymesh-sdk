import BigNumber from 'bignumber.js';

import { Account, FungibleAsset, Nft } from '~/internal';
import { SettlementResultEnum as SettlementResult } from '~/middleware/enums';
import { SettlementDirectionEnum as SettlementDirection } from '~/middleware/typesV1';
import { Balance, Leg, NftCollection } from '~/types';

export interface PortfolioBalance extends Balance {
  asset: FungibleAsset;
}

export interface PortfolioCollection {
  collection: NftCollection;
  /**
   * NFTs available for transferring
   */
  free: Nft[];
  /**
   * NFTs that are locked, such as being involved in a pending instruction
   */
  locked: Nft[];
  /**
   * Total number of NFTs held for a collection
   */
  total: BigNumber;
}

export type SettlementLeg = Leg & {
  direction: SettlementDirection;
};

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
