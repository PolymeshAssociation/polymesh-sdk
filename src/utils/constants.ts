import BigNumber from 'bignumber.js';
import { coerce } from 'semver';

import { TransactionArgumentType } from '~/types';

/**
 * Maximum amount of decimals for on-chain values
 */
export const MAX_DECIMALS = 6;
export const MAX_TICKER_LENGTH = 12;
export const MAX_MODULE_LENGTH = 32;
export const MAX_MEMO_LENGTH = 32;
/**
 * Biggest possible number for on-chain balances
 */
export const MAX_BALANCE = new BigNumber(Math.pow(10, 12));
/**
 * Account ID used for certain calls that require it when the SDK is instanced without one
 */
export const DUMMY_ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
/**
 * Whether or not to ignore the checksum when encoding/decoding polkadot addresses
 */
export const IGNORE_CHECKSUM = true;
/**
 * Default SS58 format for encoding addresses (used when the chain doesn't specify one)
 */
export const DEFAULT_SS58_FORMAT = 42;
export const MAX_CONCURRENT_REQUESTS = 200;
export const TREASURY_MODULE_ADDRESS = 'modlpm/trsry';
export const DEFAULT_GQL_PAGE_SIZE = 25;
/**
 * Limit to the page size used when fetching large amounts of data from the chain (same goes for `.multi` calls)
 */
export const MAX_PAGE_SIZE = new BigNumber(1000);

const didTypes = ['PolymeshPrimitivesIdentityId'];

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

/**
 * Maps chain types to more human-readable `TransactionArgumentType`s
 */
export const ROOT_TYPES = rootTypes;

/**
 * The Polymesh RPC node version range that is compatible with this version of the SDK
 */
export const SUPPORTED_NODE_VERSION_RANGE = '6.0';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SUPPORTED_NODE_SEMVER = coerce(SUPPORTED_NODE_VERSION_RANGE)!.version;

/**
 * The Polymesh chain spec version range that is compatible with this version of the SDK
 */
export const SUPPORTED_SPEC_VERSION_RANGE = '6.0';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SUPPORTED_SPEC_SEMVER = coerce(SUPPORTED_SPEC_VERSION_RANGE)!.version;

export const SYSTEM_VERSION_RPC_CALL = {
  jsonrpc: '2.0',
  method: 'system_version',
  params: [],
  id: 'systemVersion',
};

export const STATE_RUNTIME_VERSION_CALL = {
  jsonrpc: '2.0',
  method: 'state_getRuntimeVersion',
  params: [],
  id: 'specVersion',
};

/**
 * Maximum amount of legs allowed in a single instruction
 */
export const MAX_LEGS_LENGTH = 10;

/**
 * Default CDD ID associated with an Identity on chain. Used for Identities onboarded without PUIS
 */
export const DEFAULT_CDD_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Minimum version of Middleware V2 GraphQL Service (SubQuery) that is compatible with this version of the SDK
 */
export const MINIMUM_SQ_VERSION = '9.7.0-alpha.6';
