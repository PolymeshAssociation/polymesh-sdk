import BigNumber from 'bignumber.js';
import { coerce } from 'semver';

/**
 * The Polymesh RPC node version range that is compatible with this version of the SDK
 */
export const SUPPORTED_NODE_VERSION_RANGE = '1.0';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SUPPORTED_NODE_SEMVER = coerce(SUPPORTED_NODE_VERSION_RANGE)!.version;

/**
 * The Polymesh chain spec version range that is compatible with this version of the SDK
 */
export const SUPPORTED_SPEC_VERSION_RANGE = '1.0';

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
 * Biggest possible number for on-chain balances
 */
export const MAX_BALANCE = new BigNumber(Math.pow(10, 12));

/**
 * Maximum amount of legs allowed in a single instruction
 */
export const MAX_LEGS_LENGTH = 10;

/**
 * Minimum version of Middleware V2 GraphQL Service (SubQuery) that is compatible with this version of the SDK
 */
export const MINIMUM_SQ_VERSION = '12.2.0-alpha.2';

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
