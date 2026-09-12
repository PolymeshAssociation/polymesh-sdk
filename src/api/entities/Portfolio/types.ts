import BigNumber from 'bignumber.js';

import { Account, FungibleAsset, Instruction, Nft } from '~/internal';
import { SettlementDirectionEnum as SettlementDirection } from '~/middleware/typesV1';
import { Balance, Leg, NftCollection, SettlementResultEnum } from '~/types';

/**
 * A holder's balance of a fungible Asset
 *
 * @note `free` is what the holder can send, i.e. `total - locked - frozen` (never below zero).
 *   Transfers by the holder can move neither locked nor frozen tokens, but a controller transfer
 *   ignores frozen tokens, so it can move `free + frozen`
 * @note a holder can also be frozen outright, which stops it sending anything whatever `free`
 *   reports. Read that with
 *   {@link api/entities/Asset/Fungible/AssetHolders!AssetHolders.getFreezeStatus | asset.assetHolders.getFreezeStatus}
 */
export interface PortfolioBalance extends Balance {
  asset: FungibleAsset;
  /**
   * tokens an Asset agent has frozen, which the holder cannot send. Always zero before
   *   Polymesh 8.1.1
   *
   * @note the frozen amount can be set above the holder's balance, in which case `free` is zero
   *   and `frozen` may exceed `total`
   */
  frozen: BigNumber;
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
  status: SettlementResultEnum;
  /**
   * Array of Accounts that participated by affirming the settlement
   */
  accounts: Account[];
  legs: SettlementLeg[];
  /**
   * This value is null when depicting portfolio movements
   */
  instruction?: Instruction;
}
