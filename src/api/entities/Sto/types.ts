import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, Venue } from '~/internal';

export enum StoTimingStatus {
  /**
   * Start date not reached yet
   */
  NotStarted = 'NotStarted',
  /**
   * Between start and end date
   */
  Started = 'Started',
  /**
   * End date reached
   */
  Expired = 'Expired',
}

export enum StoBalanceStatus {
  /**
   * There still are Asset tokens available for purchase
   */
  Available = 'Available',
  /**
   * All Assets in the offering have been sold
   */
  SoldOut = 'SoldOut',
  /**
   * There are remaining Assets, but their added value is lower than the Offering's
   *   minimum investment, so they cannot be purchased. The offering should be manually closed
   *   to retrieve them
   */
  Residual = 'Residual',
}

export enum StoSaleStatus {
  /**
   * Sale temporarily paused, can be resumed (unfrozen)
   */
  Frozen = 'Frozen',
  /**
   * Investments can be made
   */
  Live = 'Live',
  /**
   * Sale was manually closed before the end date was reached
   */
  ClosedEarly = 'ClosedEarly',
  /**
   * Sale was manually closed after the end date was reached
   */
  Closed = 'Closed',
}

export interface StoStatus {
  timing: StoTimingStatus;
  balance: StoBalanceStatus;
  sale: StoSaleStatus;
}

export interface StoTier {
  amount: BigNumber;
  price: BigNumber;
}

export interface Tier extends StoTier {
  remaining: BigNumber;
}

export interface StoDetails {
  creator: Identity;
  name: string;
  offeringPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingCurrency: string;
  tiers: Tier[];
  venue: Venue;
  start: Date;
  end: Date | null;
  status: StoStatus;
  minInvestment: BigNumber;
  totalAmount: BigNumber;
  totalRemaining: BigNumber;
}

export interface Investment {
  investor: Identity;
  soldAmount: BigNumber;
  investedAmount: BigNumber;
}
