import BigNumber from 'bignumber.js';
import { coerce } from 'semver';

import { ModuleName, TransactionArgumentType, TxTags } from '~/types';

/**
 * Maximum amount of decimals for on-chain values
 */
export const MAX_DECIMALS = 6;
export const MAX_TICKER_LENGTH = 12;
export const MAX_MODULE_LENGTH = 32;
export const MAX_MEMO_LENGTH = 32;
export const MAX_OFF_CHAIN_METADATA_LENGTH = 32;
export const MAX_BATCH_SIZE_SUPPORTING_SUBSIDY = 7;
export const MAX_META_LENGTH = 2048;
/**
 * Maximum amount of required mediators. See MESH-2156 to see if this is queryable instead
 */
export const MAX_ASSET_MEDIATORS = 4;
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

/**
 * The number of blocks a transaction is valid for by default
 */
export const DEFAULT_LIFETIME_PERIOD = 64;

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
 * The Polymesh chain spec version range that is compatible with this version of the SDK
 */
export const SUPPORTED_SPEC_VERSION_RANGE = '7.0 || 7.1 || 7.2';

/**
 * The Polymesh private chain spec version range that is compatible with this version of the SDK
 */
export const PRIVATE_SUPPORTED_SPEC_VERSION_RANGE = '1.0 || 1.1 || 2.0';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SUPPORTED_SPEC_SEMVER = coerce(SUPPORTED_SPEC_VERSION_RANGE)!.version;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const PRIVATE_SUPPORTED_SPEC_SEMVER = coerce(PRIVATE_SUPPORTED_SPEC_VERSION_RANGE)!.version;

export const STATE_RUNTIME_VERSION_CALL = {
  jsonrpc: '2.0',
  method: 'state_getRuntimeVersion',
  params: [],
  id: 'specVersion',
};

export const CONFIDENTIAL_ASSETS_SUPPORTED_CALL = {
  jsonrpc: '2.0',
  method: 'state_getStorage',
  params: ['0xf6afad37710306d11e7d6ebd45ca59f8751e9d00f07967cf7f57d464b264066c'],
  id: 'confidentialAssetsSupported',
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
export const MINIMUM_SQ_VERSION = '18.0.2';

/**
 * The first version of Subquery that pads IDs for proper lexical order
 */
export const MINIMUM_SQ_PADDED_ID_VERSION = '19.0.0';

/**
 * Global metadata key used to conventionally register an NFT image
 */
export const GLOBAL_IMAGE_URI_NAME = 'imageUri';

/**
 * Global metadata key used to conventionally register an NFT collection base image
 */
export const GLOBAL_BASE_IMAGE_URI_NAME = 'baseImageUri';

/**
 * Global metadata key used to conventionally register token information
 */
export const GLOBAL_TOKEN_URI_NAME = 'tokenUri';

/**
 * Global metadata key used to conventionally register token information
 */
export const GLOBAL_BASE_TOKEN_URI_NAME = 'baseTokenUri';

export const ASSET_ID_PREFIX = 'modlpy/pallet_asset';

export const TX_TAG_VALUES: string[] = Object.values(TxTags).flatMap(v => Object.values(v));

export const MODULE_NAMES: string[] = Object.values(ModuleName);
