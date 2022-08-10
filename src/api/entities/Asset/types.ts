import BigNumber from 'bignumber.js';

import { CustomPermissionGroup, Identity, KnownPermissionGroup } from '~/internal';
import { Compliance, TransferError, TransferRestriction } from '~/types';

export interface AssetDetails {
  assetType: string;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  /**
   * @deprecated
   */
  primaryIssuanceAgents: Identity[];
  fullAgents: Identity[];
  requiresInvestorUniqueness: boolean;
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

export interface AssetMetadataSpec {
  url?: string;
  description?: string;
  typeDef?: string;
}
export interface AssetGlobalMetadata {
  id: BigNumber;
  name: string;
  specs?: AssetMetadataSpec;
}

export * from './Checkpoints/types';
export * from './CorporateActions/types';
