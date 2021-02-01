import BigNumber from 'bignumber.js';

import { DefaultPortfolio, Identity, NumberedPortfolio, SecurityToken, Venue } from '~/internal';
export interface Placeholder {
  foo: number;
}

export interface Tier {
  total: BigNumber;
  price: BigNumber;
  remaining: BigNumber;
}

export enum FundraiserStatus {
  Live = 'Live',
  Frozen = 'Frozen',
  Closed = 'Closed',
}

export interface StoDetails {
  creator: Identity;
  offeringPortfolio: NumberedPortfolio | DefaultPortfolio;
  offeringAsset: SecurityToken;
  raisingPortfolio: NumberedPortfolio | DefaultPortfolio;
  raisingAsset: SecurityToken;
  tiers: Tier[];
  venue: Venue;
  start: Date;
  end: Date | undefined;
  status: FundraiserStatus;
  minimumInvestment: BigNumber;
}
