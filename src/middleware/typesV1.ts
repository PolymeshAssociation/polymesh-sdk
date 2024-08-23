import { Scalars } from '~/middleware/types';

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  Ticker = 'Ticker',
  Custom = 'Custom',
  Asset = 'Asset',
}

export type MiddlewareScope = Scalars['JSON']['input'];

export enum SettlementDirectionEnum {
  None = 'None',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}
