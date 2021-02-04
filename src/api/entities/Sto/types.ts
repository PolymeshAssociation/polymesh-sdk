import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, SecurityToken, Venue } from '~/internal';

export enum StoStatus {
  Live = 'Live',
  Frozen = 'Frozen',
  Closed = 'Closed',
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
  offeringPortfolio: NumberedPortfolio | DefaultPortfolio;
  offeringAsset: SecurityToken;
  raisingPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingCurrency: string;
  tiers: Tier[];
  venue: Venue;
  start: Date;
  end: Date | null;
  status: StoStatus;
  minimumInvestment: BigNumber;
}

export interface Investor {
  investor: Identity;
  offeringToken: SecurityToken;
  raiseCurrency: string;
  offeringTokenAmount: BigNumber;
  raiseTokenAmount: BigNumber;
}
