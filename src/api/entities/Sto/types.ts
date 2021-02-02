import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, SecurityToken, Venue } from '~/internal';

export enum StoStatus {
  Live = 'Live',
  Frozen = 'Frozen',
  Closed = 'Closed',
}

export interface Tier {
  amount: BigNumber;
  price: BigNumber;
  remaining: BigNumber;
}

export interface StoDetails {
  creator: Identity;
  offeringPortfolio: NumberedPortfolio | DefaultPortfolio;
  offeringAsset: SecurityToken;
  raisingPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingCurrency: SecurityToken;
  tiers: Tier[];
  venue: Venue;
  start: Date;
  end: Date | null;
  status: StoStatus;
  minimumInvestment: BigNumber;
}
