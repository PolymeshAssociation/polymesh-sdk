import { Scalars } from '~/middleware/types';

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  Ticker = 'Ticker',
  Custom = 'Custom',
}

export type MiddlewareScope = Scalars['JSON'];

export enum SettlementDirectionEnum {
  None = 'None',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}

export enum TransactionOrderFields {
  BlockId = 'block_id',
  Address = 'address',
  ModuleId = 'module_id',
  CallId = 'call_id',
}

export type TransactionOrderByInput = {
  field: TransactionOrderFields;
  order: Order;
};
