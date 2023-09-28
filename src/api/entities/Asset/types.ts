import BigNumber from 'bignumber.js';

import {
  CustomPermissionGroup,
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  KnownPermissionGroup,
  NumberedPortfolio,
} from '~/internal';
import { EventIdEnum } from '~/middleware/enums';
import {
  Compliance,
  EventIdentifier,
  MetadataType,
  TransferError,
  TransferRestriction,
} from '~/types';

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the Asset
   */
  ticker: string;
}

export interface AssetDetails {
  assetType: string;
  nonFungible: boolean;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  fullAgents: Identity[];
}

/**
 * Represents the balance of an Asset Holder
 */
export interface IdentityBalance {
  identity: Identity;
  balance: BigNumber;
}

export interface TransferRestrictionResult {
  restriction: TransferRestriction;
  result: boolean;
}

/**
 * Object containing every reason why a specific Asset transfer would fail
 */
export interface TransferBreakdown {
  /**
   * list of general transfer errors
   */
  general: TransferError[];
  /**
   * how the transfer adheres to the asset's compliance rules
   */
  compliance: Compliance;
  /**
   * list of transfer restrictions and whether the transfer satisfies each one
   */
  restrictions: TransferRestrictionResult[];
  /**
   * true if the transfer is possible
   */
  result: boolean;
}

export interface AgentWithGroup {
  agent: Identity;
  group: KnownPermissionGroup | CustomPermissionGroup;
}

export interface HistoricAssetTransaction extends EventIdentifier {
  asset: FungibleAsset;
  amount: BigNumber;
  from: DefaultPortfolio | NumberedPortfolio | null;
  to: DefaultPortfolio | NumberedPortfolio | null;
  event: EventIdEnum;
  extrinsicIndex: BigNumber;
}

export type MetadataKeyId =
  | {
      type: MetadataType.Global;
      id: BigNumber;
    }
  | {
      type: MetadataType.Local;
      id: BigNumber;
      ticker: string;
    };

export interface NftMetadata {
  key: MetadataKeyId;
  value: string;
}

export * from './Fungible/Checkpoints/types';
export * from './Fungible/CorporateActions/types';
