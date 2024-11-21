import { Scalars } from '~/middleware/types';

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  Asset = 'Asset',
  Custom = 'Custom',
}

export type MiddlewareScope = Scalars['JSON']['input'];

export enum SettlementDirectionEnum {
  None = 'None',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}

export enum MultiSigProposalStatusEnum {
  Active = 'Active',
  Approved = 'Approved',
  Success = 'Success',
  Failed = 'Failed',
  Rejected = 'Rejected',
  Deleted = 'Deleted',
}
