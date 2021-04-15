import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

import { TransactionArgumentType } from '~/types';

export const MAX_DECIMALS = 6;
export const MAX_TICKER_LENGTH = 12;
export const MAX_MODULE_LENGTH = 32;
export const MAX_BALANCE = new BigNumber(Math.pow(10, 12));
export const DUMMY_ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
export const MAX_BATCH_ELEMENTS: Record<string, number> = {
  [TxTags.asset.BatchAddDocument]: 20,
  [TxTags.asset.BatchRemoveDocument]: 20,
  [TxTags.identity.AcceptAuthorization]: 100,
  [TxTags.identity.RemoveAuthorization]: 100,
  [TxTags.identity.AddClaim]: 200,
  [TxTags.identity.RevokeClaim]: 200,
  [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer]: 200,
  [TxTags.complianceManager.AddDefaultTrustedClaimIssuer]: 200,
  [TxTags.capitalDistribution.PushBenefit]: 1000,
};
export const DEFAULT_MAX_BATCH_ELEMENTS = 20;
export const IGNORE_CHECKSUM = true;
export const DEFAULT_SS58_FORMAT = 42;
export const MAX_CONCURRENT_REQUESTS = 200;
export const TREASURY_MODULE_ADDRESS = 'modlpm/trsry';
export const DEFAULT_GQL_PAGE_SIZE = 25;

const didTypes = ['IdentityId'];

const addressTypes = [
  'AccountId',
  'AccountIdOf',
  'LookupTarget',
  'Address',
  'AuthorityId',
  'SessionKey',
  'ValidatorId',
  'AuthorityId',
  'KeyType',
  'SessionKey',
];

const balanceTypes = ['Amount', 'AssetOf', 'Balance', 'BalanceOf'];

const numberTypes = ['u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'U256', 'BlockNumber'];

const textTypes = ['String', 'Text', 'Ticker'];

const booleanTypes = ['bool'];

const dateTypes = ['Moment'];

const rootTypes: Record<
  string,
  | TransactionArgumentType.Did
  | TransactionArgumentType.Address
  | TransactionArgumentType.Balance
  | TransactionArgumentType.Number
  | TransactionArgumentType.Text
  | TransactionArgumentType.Boolean
  | TransactionArgumentType.Date
> = {};

didTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Did;
});
addressTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Address;
});
balanceTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Balance;
});
numberTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Number;
});
textTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Text;
});
booleanTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Boolean;
});
dateTypes.forEach(type => {
  rootTypes[type] = TransactionArgumentType.Date;
});

export const ROOT_TYPES = rootTypes;
