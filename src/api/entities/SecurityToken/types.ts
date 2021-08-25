import { BigNumber } from 'bignumber.js';

import { Agent, CustomPermissionGroup, Identity, KnownPermissionGroup } from '~/internal';
import { Compliance, TransferError, TransferRestriction } from '~/types';

export interface SecurityTokenDetails {
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
 * Represents the balance of a token holder
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
 * Object containing every reason why a specific Security Token transfer would fail
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
  agent: Agent;
  group: KnownPermissionGroup | CustomPermissionGroup;
}

export * from './CorporateActions/types';
