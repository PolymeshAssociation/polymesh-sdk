import BigNumber from 'bignumber.js';

import {
  Asset,
  CustomPermissionGroup,
  DefaultPortfolio,
  Identity,
  KnownPermissionGroup,
  NumberedPortfolio,
} from '~/internal';
import { EventIdEnum } from '~/middleware/enumsV2';
import { Compliance, EventIdentifier, TransferError, TransferRestriction } from '~/types';

export interface AssetDetails {
  assetType: string;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  fullAgents: Identity[];
  /**
   * @deprecated This attribute will be removed in the future
   */
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

export interface HistoricAssetTransaction extends EventIdentifier {
  asset: Asset;
  amount: BigNumber;
  from: DefaultPortfolio | NumberedPortfolio | null;
  to: DefaultPortfolio | NumberedPortfolio | null;
  event: EventIdEnum;
  extrinsicIndex: BigNumber;
}

export * from './Checkpoints/types';
export * from './CorporateActions/types';
