import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, Venue } from '~/internal';

export enum OfferingTimingStatus {
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

export enum OfferingBalanceStatus {
  /**
   * There still are Asset tokens available for purchase
   */
  Available = 'Available',
  /**
   * All Asset tokens in the Offering have been sold
   */
  SoldOut = 'SoldOut',
  /**
   * There are remaining Asset tokens, but their added value is lower than the Offering's
   *   minimum investment, so they cannot be purchased. The Offering should be manually closed
   *   to retrieve them
   */
  Residual = 'Residual',
}

export enum OfferingSaleStatus {
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

export interface OfferingStatus {
  timing: OfferingTimingStatus;
  balance: OfferingBalanceStatus;
  sale: OfferingSaleStatus;
}

export interface OfferingTier {
  amount: BigNumber;
  price: BigNumber;
}

export interface Tier extends OfferingTier {
  remaining: BigNumber;
}

export interface OfferingDetails {
  creator: Identity;
  name: string;
  offeringPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingCurrency: string;
  tiers: Tier[];
  venue: Venue;
  start: Date;
  end: Date | null;
  status: OfferingStatus;
  minInvestment: BigNumber;
  totalAmount: BigNumber;
  totalRemaining: BigNumber;
}

export interface Investment {
  investor: Identity;
  soldAmount: BigNumber;
  investedAmount: BigNumber;
}

export type OffChainFundingDetails =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      offChainTicker: string;
    };
