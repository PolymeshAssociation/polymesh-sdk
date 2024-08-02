import { Scalars } from '~/middleware/types';

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  /**
   * @deprecated in favour of 'Asset'
   */
  Ticker = 'Ticker',
  Asset = 'Asset',
  Custom = 'Custom',
  Asset = 'Asset',
}

export type MiddlewareScope = Scalars['JSON']['input'];

export enum SettlementDirectionEnum {
  None = 'None',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}
