import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

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
 * Map of transaction tags to the theoretical limit of transactions that a batch of that type supports.
 *   This takes block size into account
 */
export const MAX_BATCH_ELEMENTS: Record<string, number> = {
  [TxTags.asset.AddDocuments]: 20,
  [TxTags.asset.RemoveDocuments]: 20,
  [TxTags.identity.RemoveAuthorization]: 100,
  [TxTags.identity.AddClaim]: 200,
  [TxTags.identity.RevokeClaim]: 200,
  [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer]: 200,
  [TxTags.complianceManager.AddDefaultTrustedClaimIssuer]: 200,
  [TxTags.settlement.AddInstruction]: 50,
  [TxTags.settlement.AddAndAffirmInstruction]: 50,
  [TxTags.capitalDistribution.PushBenefit]: 1000,
};
export const DEFAULT_MAX_BATCH_ELEMENTS = 20;
/**
 * Whether or not to ingnore the checksum when encoding/decoding polkadot addresses
 */
export const IGNORE_CHECKSUM = true;
/**
 * Default format for Keyrings (used when the chain doesn't specify one)
 */
export const DEFAULT_SS58_FORMAT = 42;
export const MAX_CONCURRENT_REQUESTS = 200;
export const TREASURY_MODULE_ADDRESS = 'modlpm/trsry';
export const DEFAULT_GQL_PAGE_SIZE = 25;
/**
 * Limit to the page size used when fetching large amounts of data from the chain (same goes for `.multi` calls)
 */
export const MAX_PAGE_SIZE = 1000;
/**
 * Prefix for the data that must be signed in Ethereum by a classic Ticker owner in order
 *   to claim their Ticker
 */
export const CLASSIC_CLAIM_SIGNATURE_PREFIX = 'classic_claim';
/**
 * "Systematic DID" that owns all classic Tickers until they are claimed by their real owners
 */
export const CLASSIC_TICKER_OWNER_DID =
  '0x73797374656d3a706f6c796d6174685f636c61737369635f6d69670000000000';

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

/**
 * Maps chain types to more human-readable `TransactionArgumentType`s
 */
export const ROOT_TYPES = rootTypes;

/**
 * The Polymesh version range that is compatible with this version of the SDK
 */
export const SUPPORTED_VERSION_RANGE = '4.1.x';

export const SYSTEM_VERSION_RPC_CALL = {
  jsonrpc: '2.0',
  method: 'system_version',
  params: [],
};

/**
 * Default cdd_id associated with an Identity on chain
 */
export const DEFAULT_CDD_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';
