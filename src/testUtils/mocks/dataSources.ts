/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise } from '@polkadot/api';
import { DecoratedRpc } from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types';
import {
  bool,
  BTreeSet,
  Bytes,
  Compact,
  Enum,
  Option,
  Text,
  u8,
  U8aFixed,
  u16,
  u32,
  u64,
  u128,
  UInt,
  Vec,
} from '@polkadot/types';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import {
  AccountData,
  AccountId,
  AccountInfo,
  Balance,
  Block,
  BlockHash,
  Call,
  DispatchError,
  DispatchErrorModule,
  EventRecord,
  ExtrinsicStatus,
  Hash,
  Header,
  Index,
  Permill,
  RefCount,
  RuntimeDispatchInfo,
  RuntimeVersion,
  SignedBlock,
} from '@polkadot/types/interfaces';
import {
  ConfidentialIdentityV2ClaimProofsScopeClaimProof,
  ConfidentialIdentityV2ClaimProofsZkProofData,
  ConfidentialIdentityV2SignSignature,
  PalletAssetAssetOwnershipRelation,
  PalletAssetCheckpointScheduleSpec,
  PalletAssetSecurityToken,
  PalletAssetTickerRegistration,
  PalletAssetTickerRegistrationConfig,
  PalletContractsStorageContractInfo,
  PalletCorporateActionsCaCheckpoint,
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PalletCorporateActionsRecordDate,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletCorporateActionsTargetTreatment,
  PalletIdentityClaim1stKey,
  PalletMultisigProposalDetails,
  PalletMultisigProposalStatus,
  PalletPortfolioMovePortfolioItem,
  PalletRelayerSubsidy,
  PalletSettlementAffirmationStatus,
  PalletSettlementInstruction,
  PalletSettlementInstructionMemo,
  PalletSettlementInstructionStatus,
  PalletSettlementSettlementType,
  PalletSettlementVenue,
  PalletSettlementVenueType,
  PalletStoFundraiser,
  PalletStoFundraiserStatus,
  PalletStoFundraiserTier,
  PalletStoPriceTier,
  PolymeshCommonUtilitiesCheckpointStoredSchedule,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesAuthorization,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesCalendarCalendarPeriod,
  PolymeshPrimitivesCalendarCalendarUnit,
  PolymeshPrimitivesCalendarCheckpointSchedule,
  PolymeshPrimitivesCddId,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesConditionConditionType,
  PolymeshPrimitivesConditionTargetIdentity,
  PolymeshPrimitivesConditionTrustedFor,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesDocumentHash,
  PolymeshPrimitivesEthereumEcdsaSignature,
  PolymeshPrimitivesEthereumEthereumAddress,
  PolymeshPrimitivesIdentityClaim,
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityClaimScope,
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesIdentityIdPortfolioKind,
  PolymeshPrimitivesJurisdictionCountryCode,
  PolymeshPrimitivesPosRatio,
  PolymeshPrimitivesSecondaryKey,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesSecondaryKeyPalletPermissions,
  PolymeshPrimitivesSecondaryKeyPermissions,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatClaim,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName,
  PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
  PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId,
  PolymeshPrimitivesSubsetSubsetRestrictionTicker,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import {
  Codec,
  IEvent,
  INumber,
  ISubmittableResult,
  ITuple,
  IU8a,
  Registry,
  Signer as PolkadotSigner,
} from '@polkadot/types/types';
import { hexToU8a, stringToU8a } from '@polkadot/util';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { when } from 'jest-when';
import { cloneDeep, map, merge, upperFirst } from 'lodash';

import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
import {
  AssetComplianceResult,
  AuthorizationType as MeshAuthorizationType,
  CanTransferResult,
  CddStatus,
  ComplianceRequirementResult,
  ConditionResult,
  GranularCanTransferResult,
  Moment,
  PortfolioValidityResult,
  TransferConditionResult,
} from '~/polkadot/polymesh';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  CheckPermissionsResult,
  CheckRolesResult,
  ClaimData,
  ClaimType,
  CountryCode as CountryCodeEnum,
  DistributionWithDetails,
  ExtrinsicData,
  PermissionedAccount,
  ProtocolFees,
  ResultSet,
  SignerType,
  StatType,
  SubsidyWithAllowance,
  TxTags,
  UnsubCallback,
} from '~/types';
import { Consts, Extrinsics, GraphqlQuery, PolymeshTx, Queries, Rpcs } from '~/types/internal';
import { ArgsType, Mutable, tuple } from '~/types/utils';
import { STATE_RUNTIME_VERSION_CALL, SYSTEM_VERSION_RPC_CALL } from '~/utils/constants';

let apiEmitter: EventEmitter;

/**
 * Create a mock instance of the Polkadot API
 */
function createApi(): Mutable<ApiPromise> & EventEmitter {
  apiEmitter = new EventEmitter();
  apiEmitter.on('error', () => undefined);
  return {
    emit: (event: string) => apiEmitter.emit(event),
    on: (event: string, listener: (...args: unknown[]) => unknown) =>
      apiEmitter.on(event, listener),
    off: (event: string, listener: (...args: unknown[]) => unknown) =>
      apiEmitter.off(event, listener),
    disconnect: jest.fn() as () => Promise<void>,
    setSigner: jest.fn() as (signer: PolkadotSigner) => void,
  } as Mutable<ApiPromise> & EventEmitter;
}

/**
 * Create a mock instance of the Apollo client
 */
function createApolloClient(): Mocked<Mutable<ApolloClient<NormalizedCacheObject>>> {
  return {
    stop: jest.fn(),
    query: jest.fn(),
  } as unknown as Mocked<Mutable<ApolloClient<NormalizedCacheObject>>>;
}

let apolloConstructorMock: jest.Mock;

/**
 * Creates mock websocket class. Contains additional methods for tests to control it
 */
export class MockWebSocket {
  /**
   * @hidden
   */
  onopen(): void {
    // mock for onopen
  }

  /**
   * @hidden
   */
  onclose(): void {
    // mock for onclose
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * @hidden
   */
  onerror(_err: Error): void {
    // mock for onerror
  }

  /**
   * @hidden
   */
  onmessage(_msg: Record<string, unknown>): void {
    // mock for onmessage
  }

  /**
   * @hidden
   */
  close(): void {
    // mock for close
  }

  /**
   * @hidden
   */
  send(msg: string): void {
    let response;
    const nodeVersionId = SYSTEM_VERSION_RPC_CALL.id;

    if (msg.indexOf(nodeVersionId) >= 0) {
      response = { data: `{ "result": "5.0.0", "id": "${nodeVersionId}" }` };
    } else {
      response = {
        data: `{ "result": { "specVersion": "5000000"}, "id": "${STATE_RUNTIME_VERSION_CALL.id}" }`,
      };
    }

    this.onmessage(response);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * @hidden
   * Calls the onerror handler with the given error
   */
  triggerError(err: Error): void {
    this.onerror(err);
  }

  /**
   * @hidden
   * Calls onmessage with the given version
   */
  sendRpcVersion(version: string): void {
    const response = { data: `{ "result": "${version}", "id": "${SYSTEM_VERSION_RPC_CALL.id}" }` };
    this.onmessage(response);
  }

  /**
   * @hidden
   * Calls onmessage with the given version
   */
  sendSpecVersion(version: string): void {
    const response = {
      data: `{ "result": { "specVersion": "${version}" }, "id": "${STATE_RUNTIME_VERSION_CALL.id}" }`,
    };
    this.onmessage(response);
  }
}

/**
 * Create a mock instance of the WebSocket lib
 */
function createWebSocket(): MockWebSocket {
  return new MockWebSocket();
}

let webSocketConstructorMock: jest.Mock;

export type MockContext = Mocked<Context>;

export enum MockTxStatus {
  Ready = 'Ready',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Aborted = 'Aborted',
  Rejected = 'Rejected',
  Intermediate = 'Intermediate',
  InBlock = 'InBlock',
  BatchFailed = 'BatchFailed',
  FinalizedFailed = 'FinalizedFailed',
  FailedToUnsubscribe = 'FailedToUnsubscribe',
}

const MockApolloClientClass = class {
  /**
   * @hidden
   */
  public constructor() {
    return apolloConstructorMock();
  }
};

const mockInstanceContainer = {
  contextInstance: {} as MockContext,
  apiInstance: createApi(),
  signingManagerInstance: {} as Mutable<SigningManager>,
  apolloInstance: createApolloClient(),
  apolloInstanceV2: createApolloClient(),
  webSocketInstance: createWebSocket(),
};

const MockWebSocketClass = class {
  /**
   * @hidden
   */
  public constructor() {
    return webSocketConstructorMock();
  }
};

let apiPromiseCreateMock: jest.Mock;

const MockApiPromiseClass = class {
  /**
   * @hidden
   */
  public static create = apiPromiseCreateMock;
};

const MockWsProviderClass = class {};

let contextCreateMock: jest.Mock;

const MockContextClass = class {
  /**
   * @hidden
   */
  public static create = contextCreateMock;
};

let errorMock: jest.Mock;

type StatusCallback = (receipt: ISubmittableResult) => void;

interface TxMockData {
  statusCallback: StatusCallback;
  unsubCallback: UnsubCallback;
  status: MockTxStatus;
  resolved: boolean;
}
interface ContextOptions {
  did?: string;
  withSigningManager?: boolean;
  balance?: AccountBalance;
  subsidy?: SubsidyWithAllowance;
  hasRoles?: boolean;
  checkRoles?: CheckRolesResult;
  hasPermissions?: boolean;
  checkPermissions?: CheckPermissionsResult<SignerType.Account>;
  hasAssetPermissions?: boolean;
  checkAssetPermissions?: CheckPermissionsResult<SignerType.Identity>;
  validCdd?: boolean;
  assetBalance?: BigNumber;
  invalidDids?: string[];
  transactionFees?: ProtocolFees[];
  signingAddress?: string;
  nonce?: BigNumber;
  issuedClaims?: ResultSet<ClaimData>;
  getIdentity?: Identity;
  getIdentityClaimsFromChain?: ClaimData[];
  getIdentityClaimsFromMiddleware?: ResultSet<ClaimData>;
  getIdentityClaimsFromMiddlewareV2?: ResultSet<ClaimData>;
  getExternalSigner?: PolkadotSigner;
  primaryAccount?: string;
  secondaryAccounts?: ResultSet<PermissionedAccount>;
  transactionHistory?: ResultSet<ExtrinsicData>;
  latestBlock?: BigNumber;
  middlewareEnabled?: boolean;
  middlewareV2Enabled?: boolean;
  middlewareAvailable?: boolean;
  middlewareV2Available?: boolean;
  sentAuthorizations?: ResultSet<AuthorizationRequest>;
  isArchiveNode?: boolean;
  ss58Format?: BigNumber;
  areSecondaryAccountsFrozen?: boolean;
  getDividendDistributionsForAssets?: DistributionWithDetails[];
  isFrozen?: boolean;
  getSigningAccounts?: Account[];
  signingIdentityIsEqual?: boolean;
  signingAccountIsEqual?: boolean;
  networkVersion?: string;
  supportsSubsidy?: boolean;
}

interface SigningManagerOptions {
  getAccounts?: string[];
  getExternalSigner?: PolkadotSigner | null;
}

export interface MockQuery {
  entries: jest.Mock;
  entriesAt: jest.Mock;
  entriesPaged: jest.Mock;
  at: jest.Mock;
  multi: jest.Mock;
  size: jest.Mock;
}

export interface MockRpc {
  raw: jest.Mock;
}

export enum TxFailReason {
  BadOrigin = 'BadOrigin',
  CannotLookup = 'CannotLookup',
  Module = 'Module',
  Other = 'Other',
}

const defaultReceipt: ISubmittableResult = {
  status: { isReady: true } as ExtrinsicStatus,
  findRecord: () => undefined,
  filterRecords: () => [],
  isCompleted: false,
  isError: false,
  isFinalized: false,
  isInBlock: false,
  isWarning: false,
  events: [],
  txHash: '0x123' as unknown as Hash,
  txIndex: 1,
  toHuman: () => ({}),
};

const intermediateReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: false },
  isCompleted: true,
  isInBlock: false,
});

const inBlockReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: true, asInBlock: 'blockHash' },
  isCompleted: true,
  isInBlock: true,
});

const successReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isFinalized: true, asFinalized: 'blockHash' },
  isCompleted: true,
  isFinalized: true,
});

const batchFailedReceipt: ISubmittableResult = merge({}, successReceipt, {
  findRecord: (mod: string, event: string) =>
    mod === 'utility' && event === 'BatchInterrupted'
      ? { event: { data: [[], [{ toString: (): string => '1' }, 'Some Error']] } }
      : undefined,
  filterRecords: (mod: string, event: string) =>
    mod === 'utility' && event === 'BatchInterrupted'
      ? [{ event: { data: [[], [{ toString: (): string => '1' }, 'Some Error']] } }]
      : [],
});

/**
 * @hidden
 */
const createFailReceipt = (
  err: Partial<DispatchError>,
  baseReceipt: ISubmittableResult = inBlockReceipt
): ISubmittableResult =>
  merge({}, baseReceipt, {
    findRecord: () => ({ event: { data: [err] } }),
    filterRecords: () => [{ event: { data: [err] } }],
  });

const badOriginFailReceipt = createFailReceipt({ isBadOrigin: true });

const cannotLookupFailReceipt = createFailReceipt({ isCannotLookup: true });

const otherFailReceipt = createFailReceipt({ isOther: true });

const moduleFailReceipt = createFailReceipt({
  isModule: true,
  asModule: {
    error: { toNumber: (): number => 1 },
    index: { toNumber: (): number => 1 },
    registry: {
      findMetaError: (): { section: string; name: string; docs: string[] } => ({
        section: 'someModule',
        name: 'SomeError',
        docs: ['This is very bad'],
      }),
    },
  } as unknown as DispatchErrorModule,
});

const abortReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isInvalid: true, isReady: false },
  isError: true,
  isCompleted: true,
});

const finalizedErrorReceipt = createFailReceipt({}, successReceipt);

/**
 * @hidden
 */
const failReasonToReceipt = (failReason?: TxFailReason): ISubmittableResult => {
  if (!failReason || failReason === TxFailReason.Module) {
    return moduleFailReceipt;
  }

  if (failReason === TxFailReason.BadOrigin) {
    return badOriginFailReceipt;
  }

  if (failReason === TxFailReason.CannotLookup) {
    return cannotLookupFailReceipt;
  }

  return otherFailReceipt;
};

/**
 * @hidden
 */
const statusToReceipt = (status: MockTxStatus, failReason?: TxFailReason): ISubmittableResult => {
  if (status === MockTxStatus.Aborted) {
    return abortReceipt;
  }
  if (status === MockTxStatus.Failed) {
    return failReasonToReceipt(failReason);
  }
  if ([MockTxStatus.Succeeded, MockTxStatus.FailedToUnsubscribe].includes(status)) {
    return successReceipt;
  }
  if (status === MockTxStatus.Ready) {
    return defaultReceipt;
  }
  if (status === MockTxStatus.Intermediate) {
    return intermediateReceipt;
  }
  if (status === MockTxStatus.InBlock) {
    return inBlockReceipt;
  }
  if (status === MockTxStatus.BatchFailed) {
    return batchFailedReceipt;
  }
  if (status === MockTxStatus.FinalizedFailed) {
    return finalizedErrorReceipt;
  }

  throw new Error(`There is no receipt associated with status ${status}`);
};

export const mockPolkadotModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ApiPromise: MockApiPromiseClass,
  WsProvider: MockWsProviderClass,
});

export const mockContextModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Context: MockContextClass,
});

export const mockApolloModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ApolloClient: MockApolloClientClass,
});

export const mockWebSocketModule = () => (): unknown => ({ w3cwebsocket: MockWebSocketClass });

const txMocksData = new Map<unknown, TxMockData>();
let txModule = {} as Extrinsics;
let queryModule = {} as Queries;
let constsModule = {} as Consts;

let rpcModule = {} as DecoratedRpc<'promise', RpcInterface>;

let queryMultiMock = jest.fn();

const defaultContextOptions: ContextOptions = {
  did: 'someDid',
  withSigningManager: true,
  balance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  hasRoles: true,
  checkRoles: {
    result: true,
  },
  hasPermissions: true,
  checkPermissions: {
    result: true,
  },
  hasAssetPermissions: true,
  checkAssetPermissions: {
    result: true,
  },
  getExternalSigner: 'signer' as PolkadotSigner,
  validCdd: true,
  assetBalance: new BigNumber(1000),
  invalidDids: [],
  transactionFees: [
    {
      tag: TxTags.asset.CreateAsset,
      fees: new BigNumber(200),
    },
  ],
  signingAddress: '0xdummy',
  issuedClaims: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        lastUpdatedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  getIdentityClaimsFromChain: [
    {
      target: 'targetIdentity' as unknown as Identity,
      issuer: 'issuerIdentity' as unknown as Identity,
      issuedAt: new Date(),
      lastUpdatedAt: new Date(),
      expiry: null,
      claim: { type: ClaimType.NoData },
    },
  ],
  getIdentityClaimsFromMiddleware: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        lastUpdatedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  getIdentityClaimsFromMiddlewareV2: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        lastUpdatedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  primaryAccount: 'primaryAccount',
  secondaryAccounts: { data: [], next: null },
  transactionHistory: {
    data: [],
    next: null,
    count: new BigNumber(1),
  },
  latestBlock: new BigNumber(100),
  middlewareEnabled: true,
  middlewareV2Enabled: true,
  middlewareAvailable: true,
  middlewareV2Available: true,
  sentAuthorizations: {
    data: [{} as AuthorizationRequest],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  isArchiveNode: true,
  ss58Format: new BigNumber(42),
  getDividendDistributionsForAssets: [],
  areSecondaryAccountsFrozen: false,
  isFrozen: false,
  getSigningAccounts: [],
  signingIdentityIsEqual: true,
  signingAccountIsEqual: true,
  networkVersion: '1.0.0',
  supportsSubsidy: true,
};
let contextOptions: ContextOptions = defaultContextOptions;
const defaultSigningManagerOptions: SigningManagerOptions = {
  getAccounts: ['someAccount', 'otherAccount'],
  getExternalSigner: 'signer' as PolkadotSigner,
};
let signingManagerOptions = defaultSigningManagerOptions;

/**
 * @hidden
 */
function configureContext(opts: ContextOptions): void {
  const getSigningIdentity = jest.fn();
  const identity = {
    did: opts.did,
    hasRoles: jest.fn().mockResolvedValue(opts.hasRoles),
    checkRoles: jest.fn().mockResolvedValue(opts.checkRoles),
    hasValidCdd: jest.fn().mockResolvedValue(opts.validCdd),
    getAssetBalance: jest.fn().mockResolvedValue(opts.assetBalance),
    getPrimaryAccount: jest.fn().mockResolvedValue({
      account: {
        address: opts.primaryAccount,
      },
      permissions: {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      },
    }),
    getSecondaryAccounts: jest.fn().mockResolvedValue(opts.secondaryAccounts),
    authorizations: {
      getSent: jest.fn().mockResolvedValue(opts.sentAuthorizations),
    },
    assetPermissions: {
      hasPermissions: jest.fn().mockResolvedValue(opts.hasAssetPermissions),
      checkPermissions: jest.fn().mockResolvedValue(opts.checkAssetPermissions),
    },
    areSecondaryAccountsFrozen: jest.fn().mockResolvedValue(opts.areSecondaryAccountsFrozen),
    isEqual: jest.fn().mockReturnValue(opts.signingIdentityIsEqual),
  };
  opts.withSigningManager
    ? getSigningIdentity.mockResolvedValue(identity)
    : getSigningIdentity.mockImplementation(() => {
        throw new Error('The signing Account does not have an associated Identity');
      });
  const getSigningAccount = jest.fn();
  opts.withSigningManager
    ? getSigningAccount.mockReturnValue({
        address: opts.signingAddress,
        getBalance: jest.fn().mockResolvedValue(opts.balance),
        getSubsidy: jest.fn().mockResolvedValue(opts.subsidy),
        getIdentity: jest.fn().mockResolvedValue(identity),
        getTransactionHistory: jest.fn().mockResolvedValue(opts.transactionHistory),
        hasPermissions: jest.fn().mockResolvedValue(opts.hasPermissions),
        checkPermissions: jest.fn().mockResolvedValue(opts.checkPermissions),
        isFrozen: jest.fn().mockResolvedValue(opts.isFrozen),
        isEqual: jest.fn().mockReturnValue(opts.signingAccountIsEqual),
      })
    : getSigningAccount.mockImplementation(() => {
        throw new Error('There is no Account associated with the SDK');
      });
  const signingAddress = opts.withSigningManager ? opts.signingAddress : undefined;
  const getSigningAddress = jest.fn();
  opts.withSigningManager
    ? getSigningAddress.mockReturnValue(signingAddress)
    : getSigningAddress.mockImplementation(() => {
        throw new Error('There is no Account associated with the current SDK instance');
      });
  const nonce = new BigNumber(opts.nonce ?? -1);
  const getNonce = jest.fn();
  getNonce.mockReturnValue(nonce);

  const queryMock = mockInstanceContainer.apolloInstance.query;
  const queryMockV2 = mockInstanceContainer.apolloInstanceV2.query;
  const contextInstance = {
    signingAddress,
    nonce,
    getSigningIdentity,
    getSigningAccount,
    getSigningAddress,
    accountBalance: jest.fn().mockResolvedValue(opts.balance),
    accountSubsidy: jest.fn().mockResolvedValue(opts.subsidy),
    getSigningAccounts: jest.fn().mockResolvedValue(opts.getSigningAccounts),
    setSigningAddress: jest.fn().mockImplementation(address => {
      (contextInstance as any).signingAddress = address;
    }),
    setNonce: jest.fn().mockImplementation(txNonce => {
      (contextInstance as any).nonce = new BigNumber(txNonce ?? -1);
    }),
    getNonce,
    setSigningManager: jest.fn(),
    getExternalSigner: jest.fn().mockReturnValue(opts.getExternalSigner),
    polymeshApi: mockInstanceContainer.apiInstance,
    middlewareApi: mockInstanceContainer.apolloInstance,
    queryMiddleware: jest.fn().mockImplementation(query => queryMock(query)),
    queryMiddlewareV2: jest.fn().mockImplementation(query => queryMockV2(query)),
    middlewareApiV2: mockInstanceContainer.apolloInstanceV2,
    getInvalidDids: jest.fn().mockResolvedValue(opts.invalidDids),
    getProtocolFees: jest.fn().mockResolvedValue(opts.transactionFees),
    getTransactionArguments: jest.fn().mockReturnValue([]),
    getSecondaryAccounts: jest.fn().mockReturnValue({ data: opts.secondaryAccounts, next: null }),
    issuedClaims: jest.fn().mockResolvedValue(opts.issuedClaims),
    getIdentity: jest.fn().mockResolvedValue(opts.getIdentity),
    getIdentityClaimsFromChain: jest.fn().mockResolvedValue(opts.getIdentityClaimsFromChain),
    getIdentityClaimsFromMiddleware: jest
      .fn()
      .mockResolvedValue(opts.getIdentityClaimsFromMiddleware),
    getIdentityClaimsFromMiddlewareV2: jest
      .fn()
      .mockResolvedValue(opts.getIdentityClaimsFromMiddlewareV2),
    getLatestBlock: jest.fn().mockResolvedValue(opts.latestBlock),
    isMiddlewareEnabled: jest.fn().mockReturnValue(opts.middlewareEnabled),
    isMiddlewareV2Enabled: jest.fn().mockReturnValue(opts.middlewareV2Enabled),
    isAnyMiddlewareEnabled: jest
      .fn()
      .mockReturnValue(opts.middlewareEnabled || opts.middlewareV2Enabled),
    isMiddlewareAvailable: jest.fn().mockResolvedValue(opts.middlewareAvailable),
    isMiddlewareV2Available: jest.fn().mockResolvedValue(opts.middlewareV2Available),
    isArchiveNode: opts.isArchiveNode,
    ss58Format: opts.ss58Format,
    disconnect: jest.fn(),
    getDividendDistributionsForAssets: jest
      .fn()
      .mockResolvedValue(opts.getDividendDistributionsForAssets),
    getNetworkVersion: jest.fn().mockResolvedValue(opts.networkVersion),
    supportsSubsidy: jest.fn().mockReturnValue(opts.supportsSubsidy),
    createType: jest.fn() as jest.Mock<unknown, [unknown]>,
  } as unknown as MockContext;

  contextInstance.clone = jest.fn().mockReturnValue(contextInstance);

  Object.assign(mockInstanceContainer.contextInstance, contextInstance);

  MockContextClass.create = contextCreateMock.mockResolvedValue(contextInstance);
}

/**
 * @hidden
 */
function initContext(opts?: ContextOptions): void {
  contextCreateMock = jest.fn();

  contextOptions = { ...defaultContextOptions, ...opts };

  configureContext(contextOptions);
}

/**
 * @hidden
 */
function updateQuery(mod?: Queries): void {
  const updateTo = mod ?? queryModule;

  queryModule = updateTo;

  mockInstanceContainer.apiInstance.query = queryModule;
}

/**
 * @hidden
 *
 * Mock the query module
 */
function initQuery(): void {
  const mod = {} as Queries;

  updateQuery(mod);
}

/**
 * @hidden
 */
function updateTx(mod?: Extrinsics): void {
  const updateTo = mod ?? txModule;

  txModule = updateTo;

  mockInstanceContainer.apiInstance.tx = txModule;
}

/**
 * @hidden
 */
function updateRpc(mod?: any): void {
  const updateTo = mod ?? rpcModule;

  rpcModule = updateTo;

  mockInstanceContainer.apiInstance.rpc = rpcModule;
}

/**
 * @hidden
 */
function updateConsts(mod?: Consts): void {
  const updateTo = mod ?? constsModule;

  constsModule = updateTo;

  mockInstanceContainer.apiInstance.consts = constsModule;
}

/**
 * @hidden
 */
function updateQueryMulti(mock?: jest.Mock): void {
  const updateTo = mock ?? queryMultiMock;

  queryMultiMock = updateTo;

  mockInstanceContainer.apiInstance.queryMulti = queryMultiMock;
}

/**
 * @hidden
 *
 * Mock the tx module
 */
function initTx(): void {
  const mod = {} as Extrinsics;

  updateTx(mod);
}

/**
 * @hidden
 *
 * Mock the rpc module
 */
function initRpc(): void {
  const mod = {} as any;

  updateRpc(mod);
}

/**
 * @hidden
 *
 * Mock the consts module
 */
function initConsts(): void {
  const mod = {} as Consts;

  updateConsts(mod);
}

/**
 * @hidden
 *
 * Mock queryMulti
 */
function initQueryMulti(): void {
  const mock = jest.fn();

  updateQueryMulti(mock);
}

/**
 * @hidden
 */
function initApi(): void {
  mockInstanceContainer.apiInstance.registry = 'registry' as unknown as Registry;
  mockInstanceContainer.apiInstance.createType = jest.fn();
  mockInstanceContainer.apiInstance.runtimeVersion = {} as RuntimeVersion;

  initTx();
  initQuery();
  initRpc();
  initConsts();
  initQueryMulti();

  mockInstanceContainer.apiInstance.at = jest
    .fn()
    .mockResolvedValue(mockInstanceContainer.apiInstance);
  apiPromiseCreateMock = jest.fn();
  MockApiPromiseClass.create = apiPromiseCreateMock.mockResolvedValue(
    mockInstanceContainer.apiInstance
  );
}

/**
 * Create a mock instance of a Signing Manager
 */
function configureSigningManager(opts: SigningManagerOptions): void {
  const signingManagerInstance = {
    getAccounts: jest.fn().mockResolvedValue(opts.getAccounts),
    getExternalSigner: jest.fn().mockReturnValue(opts.getExternalSigner),
    setSs58Format: jest.fn(),
  };

  Object.assign(
    mockInstanceContainer.signingManagerInstance,
    signingManagerInstance as unknown as SigningManager
  );
}

/**
 * @hidden
 */
function initSigningManager(opts?: SigningManagerOptions): void {
  signingManagerOptions = { ...defaultSigningManagerOptions, ...opts };

  configureSigningManager(signingManagerOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: {
  contextOptions?: ContextOptions;
  signingManagerOptions?: SigningManagerOptions;
}): void {
  const tempContextOptions = { ...defaultContextOptions, ...opts?.contextOptions };

  configureContext(tempContextOptions);

  const tempSigningManagerOptions = {
    ...defaultSigningManagerOptions,
    ...opts?.signingManagerOptions,
  };

  configureSigningManager(tempSigningManagerOptions);
}

/**
 * @hidden
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 *
 * @param opts.mockContext - if defined, the internal {@link Context} class will also be mocked with custom properties
 */
export function initMocks(opts?: {
  contextOptions?: ContextOptions;
  signingManagerOptions?: SigningManagerOptions;
}): void {
  /*
    NOTE: the idea is to expand this function to mock things as we need them
    and use the methods in the class to fetch/manipulate different parts of the API as required
   */

  // Context
  initContext(opts?.contextOptions);

  // Api
  initApi();

  // Signing Manager
  initSigningManager(opts?.signingManagerOptions);

  // Apollo
  apolloConstructorMock = jest.fn().mockReturnValue(mockInstanceContainer.apolloInstance);

  webSocketConstructorMock = jest.fn().mockReturnValue(mockInstanceContainer.webSocketInstance);

  txMocksData.clear();
  errorMock = jest.fn().mockImplementation(() => {
    throw new Error('Error');
  });
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.apiInstance = createApi();
  mockInstanceContainer.contextInstance = {} as MockContext;
  mockInstanceContainer.signingManagerInstance = {} as Mutable<SigningManager>;
  mockInstanceContainer.apolloInstance = createApolloClient();
  mockInstanceContainer.webSocketInstance = createWebSocket();
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();

  initMocks({ contextOptions, signingManagerOptions });
}

/**
 * @hidden
 * Create and returns a mocked transaction. Each call will create a new version of the mock
 *
 * @param mod - name of the module
 * @param tx - name of the transaction function
 * @param autoResolve - if set to a status, the transaction will resolve immediately with that status.
 *  If set to false, the transaction lifecycle will be controlled by {@link updateTxStatus}
 */
export function createTxMock<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
>(
  mod: ModuleName,
  tx: TransactionName,
  opts: {
    autoResolve?: MockTxStatus | false;
    gas?: Balance;
    meta?: { args: Array<{ name: string; type: string }> };
  } = {}
): PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>> & jest.Mock {
  let runtimeModule = txModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Extrinsics[ModuleName];
    txModule[mod] = runtimeModule;
  }

  const {
    autoResolve = MockTxStatus.Succeeded,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    gas = createMockBalance(new BigNumber(1)),
    meta = { args: [] },
  } = opts;

  const transaction = jest.fn().mockReturnValue({
    method: tx, // should be a `Call` object, but this is enough for testing
    hash: tx,
    signAndSend: jest.fn().mockImplementation((_, __, cb: StatusCallback) => {
      if (autoResolve === MockTxStatus.Rejected) {
        return Promise.reject(new Error('Cancelled'));
      }

      const unsubCallback = jest.fn();

      txMocksData.set(runtimeModule[tx], {
        statusCallback: cb,
        unsubCallback,
        resolved: !!autoResolve,
        status: null as unknown as MockTxStatus,
      });

      if (autoResolve) {
        process.nextTick(() => cb(statusToReceipt(autoResolve)));
      }

      return new Promise(resolve => setImmediate(() => resolve(unsubCallback)));
    }),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paymentInfo: jest.fn().mockResolvedValue({ partialFee: gas }),
  }) as unknown as Extrinsics[ModuleName][TransactionName];

  (transaction as any).section = mod;
  (transaction as any).method = tx;
  (transaction as any).meta = meta;

  runtimeModule[tx] = transaction;

  updateTx();

  const instance = mockInstanceContainer.apiInstance;

  return instance.tx[mod][tx] as unknown as PolymeshTx<
    ArgsType<Extrinsics[ModuleName][TransactionName]>
  > &
    jest.Mock;
}

/**
 * @hidden
 * Create and return an apollo query mock
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloQueryMock(query: GraphqlQuery<any>, returnData: unknown): jest.Mock {
  const { query: mock } = mockInstanceContainer.apolloInstance;

  when(mock)
    .calledWith(query)
    .mockResolvedValue({
      data: returnData,
    } as any);

  return mock;
}

/**
 * @hidden
 * Create and return an apollo query mock
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloV2QueryMock(query: GraphqlQuery<any>, returnData: unknown): jest.Mock {
  const { query: mock } = mockInstanceContainer.apolloInstanceV2;

  when(mock)
    .calledWith(query)
    .mockResolvedValue({
      data: returnData,
    } as any);

  return mock;
}

/**
 *
 * @hidden
 */
function mockQueries(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[],
  instance: Mocked<Mutable<ApolloClient<NormalizedCacheObject>>>
): jest.Mock {
  const { query: mock } = instance;

  queries.forEach(({ query, returnData: data }) => {
    when(mock)
      .calledWith(query)
      .mockResolvedValue({
        data,
      } as any);
  });

  return mock;
}

/**
 * @hidden
 * Create and return an apollo mock for multiple queries
 *
 * @param queries - query and returnData for each mocked query
 */
export function createApolloMultipleQueriesMock(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): jest.Mock {
  const instance = mockInstanceContainer.apolloInstance;

  return mockQueries(queries, instance);
}

/**
 * @hidden
 * Create and return an apollo mock for multiple V2 queries
 *
 * @param queries - query and returnData for each mocked query
 */
export function createApolloMultipleV2QueriesMock(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): jest.Mock {
  const instance = mockInstanceContainer.apolloInstanceV2;

  return mockQueries(queries, instance);
}

/**
 * @hidden
 * Create and return a query mock
 *
 * @param mod - name of the module
 * @param query - name of the query function
 */
export function createQueryMock<
  ModuleName extends keyof Queries,
  QueryName extends keyof Queries[ModuleName]
>(
  mod: ModuleName,
  query: QueryName,
  opts?: {
    returnValue?: unknown;
    entries?: [unknown[], unknown][]; // [Keys, Codec]
    multi?: unknown;
    size?: BigNumber;
  }
): Queries[ModuleName][QueryName] & jest.Mock & MockQuery {
  let runtimeModule = queryModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Queries[ModuleName];
    queryModule[mod] = runtimeModule;
  }

  type QueryMock = Queries[ModuleName][QueryName] & jest.Mock & MockQuery;

  let mock: QueryMock;

  if (!runtimeModule[query]) {
    mock = jest.fn() as unknown as QueryMock;
    mock.entries = jest.fn();
    mock.entriesPaged = jest.fn();
    mock.at = jest.fn();
    mock.multi = jest.fn();
    mock.size = jest.fn();
    runtimeModule[query] = mock;

    updateQuery();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    mock = instance.query[mod][query] as QueryMock;
  }

  const entries = opts?.entries ?? [];

  const entryResults = entries.map(([keys, value], index) => [
    { args: keys, toHex: (): string => `key${index}` },
    value,
  ]);
  mock.entries.mockResolvedValue(entryResults);
  mock.entriesPaged.mockResolvedValue(entryResults);

  if (opts?.multi) {
    mock.multi.mockResolvedValue(opts.multi);
  }
  if (typeof opts?.size !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    mock.size.mockResolvedValue(createMockU64(new BigNumber(opts.size)));
  }
  if (opts?.returnValue) {
    mock.mockResolvedValue(opts.returnValue);
    mock.at.mockResolvedValue(opts.returnValue);
  }

  return mock;
}

let count = 0;

/**
 * @hidden
 * Create and return a rpc mock
 *
 * @param mod - name of the module
 * @param rpc - name of the rpc function
 */
export function createRpcMock<
  ModuleName extends keyof Rpcs,
  RpcName extends keyof Rpcs[ModuleName]
>(
  mod: ModuleName,
  rpc: RpcName,
  opts?: {
    returnValue?: unknown;
  }
): Rpcs[ModuleName][RpcName] & jest.Mock {
  let runtimeModule: any = rpcModule[mod];

  if (!runtimeModule) {
    runtimeModule = rpcModule[mod] = {} as any;
  }

  type RpcMock = Rpcs[ModuleName][RpcName] & jest.Mock & MockRpc;

  let mock: RpcMock;

  if (!runtimeModule[rpc]) {
    mock = jest.fn() as unknown as RpcMock;
    mock.raw = jest.fn();
    runtimeModule[rpc] = mock;
    updateRpc();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    mock = instance.rpc[mod][rpc] as RpcMock;
  }

  if (opts?.returnValue) {
    mock.mockResolvedValue(opts.returnValue);
  }

  (mock as any).count = count++;

  return mock;
}

/**
 * @hidden
 * Set a consts mock
 *
 * @param mod - name of the module
 * @param constName - name of the constant
 */
export function setConstMock<
  ModuleName extends keyof Consts,
  ConstName extends keyof Consts[ModuleName]
>(
  mod: ModuleName,
  constName: ConstName,
  opts: {
    returnValue: unknown;
  }
): void {
  let runtimeModule = constsModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Consts[ModuleName];
    constsModule[mod] = runtimeModule;
  }

  const returnValue = opts.returnValue as Consts[ModuleName][ConstName];
  if (!runtimeModule[constName]) {
    runtimeModule[constName] = returnValue;

    updateConsts();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    instance.consts[mod][constName] = returnValue;
  }
}

/**
 * @hidden
 */
export function getQueryMultiMock(): jest.Mock {
  return queryMultiMock;
}

/**
 * @hidden
 * Update the status of an existing mock transaction. Will throw an error if the transaction has already been resolved
 *
 * @param tx - transaction to update
 * @param status - new status
 */
export function updateTxStatus<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
>(
  tx: PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>>,
  status: MockTxStatus,
  failReason?: TxFailReason
): void {
  const txMockData = txMocksData.get(tx);

  if (!txMockData) {
    throw new Error('Invalid tx object');
  }

  if (txMockData.resolved) {
    throw new Error('Cannot update status on an already resolved tx');
  }

  if (status === txMockData.status) {
    throw new Error(`Status is already ${status}`);
  }

  if (
    [
      MockTxStatus.Aborted,
      MockTxStatus.Failed,
      MockTxStatus.Succeeded,
      MockTxStatus.FailedToUnsubscribe,
    ].includes(status)
  ) {
    txMocksData.set(tx, {
      ...txMockData,
      status,
      resolved: true,
    });
  }

  if (status === MockTxStatus.FailedToUnsubscribe) {
    (txMockData.unsubCallback as jest.Mock).mockImplementation(() => {
      throw new Error('Unsub error');
    });
  }

  txMockData.statusCallback(statusToReceipt(status, failReason));
}

/**
 * @hidden
 * Make calls to `Middleware.query` throw an error
 */
export function throwOnMiddlewareQuery(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstance;

  instance.query.mockImplementation(() => {
    throw err ?? new Error('Something went wrong');
  });
}

/**
 * @hidden
 * Make calls to `MiddlewareV2.query` throw an error
 */
export function throwOnMiddlewareV2Query(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstanceV2;

  instance.query.mockImplementation(() => {
    throw err ?? new Error('Something went wrong');
  });
}

/**
 * @hidden
 * Make calls to `Context.create` throw an error
 */
export function throwOnContextCreation(): void {
  MockContextClass.create = errorMock;
}

/**
 * @hidden
 * Make calls to `ApiPromise.create` throw an error
 */
export function throwOnApiCreation(error?: unknown): void {
  MockApiPromiseClass.create = error
    ? jest.fn().mockImplementation(() => {
        throw error;
      })
    : errorMock;
}

/**
 * @hidden
 * Sets the `accountBalance` function in the mocked Context to return the specified amount
 *
 * @param balance - new account balance
 */
export function setContextAccountBalance(balance: AccountBalance): void {
  mockInstanceContainer.contextInstance.accountBalance.mockResolvedValue(balance as any);
}

/**
 * @hidden
 * Retrieve an instance of the mocked Polkadot API
 */
export function getApiInstance(): ApiPromise & jest.Mocked<ApiPromise> & EventEmitter {
  return mockInstanceContainer.apiInstance as unknown as ApiPromise &
    jest.Mocked<ApiPromise> &
    EventEmitter;
}

/**
 * @hidden
 * Retrieve an instance of the mocked WebSocket
 */
export function getWebSocketInstance(): MockWebSocket {
  return mockInstanceContainer.webSocketInstance;
}

/**
 * @hidden
 * Retrieve an instance of the mocked Apollo Client
 */
export function getMiddlewareApi(): ApolloClient<NormalizedCacheObject> &
  jest.Mocked<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstance as unknown as ApolloClient<NormalizedCacheObject> &
    jest.Mocked<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve an instance of the mocked v2 Apollo Client
 */
export function getMiddlewareApiV2(): ApolloClient<NormalizedCacheObject> &
  jest.Mocked<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstanceV2 as unknown as ApolloClient<NormalizedCacheObject> &
    jest.Mocked<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve the mock of the createType method
 */
export function getCreateTypeMock(): jest.Mock {
  return mockInstanceContainer.apiInstance.createType as jest.Mock;
}

/**
 * @hidden
 * Retrieve the mock of the at method
 */
export function getAtMock(): jest.Mock {
  return mockInstanceContainer.apiInstance.at as jest.Mock;
}

/**
 * @hidden
 * Retrieve an instance of the mocked Context
 */
export function getContextInstance(opts?: ContextOptions): MockContext {
  if (opts) {
    configureContext({ ...defaultContextOptions, ...opts });
  }
  return mockInstanceContainer.contextInstance;
}

/**
 * @hidden
 * Retrieve the mock of the `Context.create` method
 */
export function getContextCreateMock(): jest.Mock {
  return contextCreateMock;
}

/**
 * @hidden
 * Retrieve an instance of the mocked SigningManager
 */
export function getSigningManagerInstance(opts?: SigningManagerOptions): Mocked<SigningManager> {
  if (opts) {
    configureSigningManager({ ...defaultSigningManagerOptions, ...opts });
  }
  return mockInstanceContainer.signingManagerInstance as Mocked<SigningManager>;
}

/**
 * @hidden
 */
export const setRuntimeVersion = (args: unknown): void => {
  mockInstanceContainer.apiInstance.runtimeVersion = args as RuntimeVersion;
};

/**
 * @hidden
 */
function isCodec<T extends Codec>(codec: any): codec is T {
  return !!codec?._isCodec;
}

/**
 * @hidden
 */
function isOption<T extends Codec>(codec: any): codec is Option<T> {
  return typeof codec?.unwrap === 'function';
}

export type MockCodec<C extends Codec> = C & { eq: jest.Mock };

/**
 * @hidden
 */
const createMockCodec = <T extends Codec>(codec: unknown, isEmpty: boolean): MockCodec<T> => {
  if (isCodec<T>(codec)) {
    return codec as MockCodec<T>;
  }
  const clone = cloneDeep(codec) as MockCodec<Mutable<T>>;

  (clone as any)._isCodec = true;
  clone.isEmpty = isEmpty;
  clone.eq = jest.fn();

  return clone;
};

export const createMockTupleCodec = <T extends [...Codec[]]>(
  tup?: ITuple<T> | Readonly<[...unknown[]]>
): MockCodec<ITuple<T>> => {
  if (isCodec<ITuple<T>>(tup)) {
    return tup as MockCodec<ITuple<T>>;
  }

  return createMockCodec<ITuple<T>>(tup, !tup);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockStringCodec = <T extends Codec>(value?: string | T): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec(
    {
      toString: () => value,
    },
    value === undefined
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockU8aCodec = <T extends IU8a>(value?: string | T, hex?: boolean): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec(hex ? hexToU8a(value) : stringToU8a(value), value === undefined);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockNumberCodec = <T extends UInt>(value?: BigNumber | T): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec<T>(
    {
      toNumber: () => value?.toNumber(),
      toString: () => value?.toString(),
      isZero: () => value?.isZero(),
    },
    value === undefined
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityId = (
  did?: string | PolymeshPrimitivesIdentityId
): MockCodec<PolymeshPrimitivesIdentityId> => {
  if (isCodec<PolymeshPrimitivesIdentityId>(did)) {
    return did as MockCodec<PolymeshPrimitivesIdentityId>;
  }

  return createMockStringCodec<PolymeshPrimitivesIdentityId>(did);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockEnum = <T extends Enum>(
  enumValue?: string | Record<string, Codec | Codec[]> | T,
  index?: number
): MockCodec<T> => {
  if (isCodec<T>(enumValue)) {
    return enumValue as MockCodec<T>;
  }

  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    codec[`is${upperFirst(enumValue)}`] = true;
    codec.type = enumValue;
  } else if (typeof enumValue === 'object') {
    const key = Object.keys(enumValue)[0];

    codec[`is${upperFirst(key)}`] = true;
    codec[`as${upperFirst(key)}`] = enumValue[key];
    codec.type = key;
  }
  codec.index = index;

  return createMockCodec<T>(codec, !enumValue);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAgentGroup = (
  agentGroup?:
    | 'Full'
    | 'ExceptMeta'
    | 'PolymeshV1CAA'
    | 'PolymeshV1PIA'
    | { Custom: u32 }
    | PolymeshPrimitivesAgentAgentGroup
): MockCodec<PolymeshPrimitivesAgentAgentGroup> => {
  if (isCodec<PolymeshPrimitivesAgentAgentGroup>(agentGroup)) {
    return agentGroup as MockCodec<PolymeshPrimitivesAgentAgentGroup>;
  }

  return createMockEnum<PolymeshPrimitivesAgentAgentGroup>(agentGroup);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEcdsaSignature = (
  signature?: string | PolymeshPrimitivesEthereumEcdsaSignature
): MockCodec<PolymeshPrimitivesEthereumEcdsaSignature> => {
  if (isCodec<PolymeshPrimitivesEthereumEcdsaSignature>(signature)) {
    return signature as MockCodec<PolymeshPrimitivesEthereumEcdsaSignature>;
  }

  return createMockStringCodec<PolymeshPrimitivesEthereumEcdsaSignature>(signature);
};

/**
 * @hidden
 */
export const createMockBTreeSet = <T extends Codec>(
  items: BTreeSet<T> | unknown[] = []
): MockCodec<BTreeSet<T>> => {
  if (isCodec<BTreeSet<T>>(items)) {
    return items as MockCodec<BTreeSet<T>>;
  }

  const codecItems = items.map(item => {
    if (isCodec(item)) {
      return item;
    }

    if (typeof item === 'string') {
      return createMockStringCodec(item);
    }

    if (typeof item === 'number' || item instanceof BigNumber) {
      return createMockNumberCodec(new BigNumber(item));
    }

    return createMockCodec(item, !item);
  });

  const res = createMockCodec(new Set(codecItems), !items) as unknown as Mutable<BTreeSet>;

  return res as MockCodec<BTreeSet<T>>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEthereumAddress = (
  address?: string | PolymeshPrimitivesEthereumEthereumAddress
): MockCodec<PolymeshPrimitivesEthereumEthereumAddress> => {
  if (isCodec<PolymeshPrimitivesEthereumEthereumAddress>(address)) {
    return address as MockCodec<PolymeshPrimitivesEthereumEthereumAddress>;
  }

  return createMockU8aCodec<PolymeshPrimitivesEthereumEthereumAddress>(address);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTicker = (
  ticker?: string | PolymeshPrimitivesTicker
): MockCodec<PolymeshPrimitivesTicker> => {
  if (isCodec<PolymeshPrimitivesTicker>(ticker)) {
    return ticker as MockCodec<PolymeshPrimitivesTicker>;
  }

  return createMockU8aCodec<PolymeshPrimitivesTicker>(ticker);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountId = (accountId?: string | AccountId): MockCodec<AccountId> => {
  if (isCodec<AccountId>(accountId)) {
    return accountId as MockCodec<AccountId>;
  }

  return createMockStringCodec<AccountId>(accountId);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBalance = (balance?: BigNumber | Balance): MockCodec<Balance> => {
  if (isCodec<Balance>(balance)) {
    return balance as MockCodec<Balance>;
  }

  return createMockNumberCodec<Balance>(balance);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentHash = (
  hash?:
    | 'None'
    | { H128: U8aFixed }
    | { H160: U8aFixed }
    | { H192: U8aFixed }
    | { H224: U8aFixed }
    | { H256: U8aFixed }
    | { H320: U8aFixed }
    | { H384: U8aFixed }
    | { H512: U8aFixed }
    | PolymeshPrimitivesDocumentHash
): MockCodec<PolymeshPrimitivesDocumentHash> => {
  if (isCodec<PolymeshPrimitivesDocumentHash>(hash)) {
    return hash as MockCodec<PolymeshPrimitivesDocumentHash>;
  }

  return createMockEnum<PolymeshPrimitivesDocumentHash>(hash);
};

type MaybeTuple<T extends Codec | Codec[]> = T extends Codec[] ? ITuple<T> : T;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockOption = <T extends Codec | Codec[]>(
  wrapped: T | null | Option<MaybeTuple<T>> = null
): Option<MaybeTuple<T>> => {
  if (isOption<MaybeTuple<T>>(wrapped)) {
    return wrapped;
  }

  return createMockCodec<Option<MaybeTuple<T>>>(
    {
      unwrap: () => wrapped as T,
      unwrapOr: (val: unknown) => wrapped ?? val,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCompact = <T extends INumber>(
  wrapped: T | null = null
): MockCodec<Compact<T>> =>
  createMockCodec(
    {
      unwrap: () => wrapped as T,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  );

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMoment = (millis?: BigNumber | Moment): MockCodec<Moment> => {
  if (isCodec<Moment>(millis)) {
    return millis as MockCodec<Moment>;
  }

  return createMockNumberCodec<Moment>(millis);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistration = (
  registration?:
    | PalletAssetTickerRegistration
    | {
        owner: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
        expiry: Option<Moment>;
      }
): MockCodec<PalletAssetTickerRegistration> => {
  if (isCodec<PalletAssetTickerRegistration>(registration)) {
    return registration as MockCodec<PalletAssetTickerRegistration>;
  }

  const { owner, expiry } = registration ?? {
    owner: createMockIdentityId(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      owner: createMockIdentityId(owner),
      expiry: createMockOption(expiry),
    },
    !registration
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8 = (value?: BigNumber | u8): u8 => createMockNumberCodec<u8>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU16 = (value?: BigNumber | u16): MockCodec<u16> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU32 = (value?: BigNumber | u32): MockCodec<u32> =>
  createMockNumberCodec<u32>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU64 = (value?: BigNumber | u64): MockCodec<u64> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU128 = (value?: BigNumber | u128): MockCodec<u128> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermill = (value?: BigNumber | Permill): MockCodec<Permill> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBytes = (value?: string | Bytes): MockCodec<Bytes> =>
  createMockU8aCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockHash = (value?: string | Hash): MockCodec<Hash> =>
  createMockStringCodec(value);

/**
 * @hidden
 */
export const createMockPosRatio = (
  numerator: BigNumber,
  denominator: BigNumber
): MockCodec<PolymeshPrimitivesPosRatio> =>
  [
    createMockU32(numerator),
    createMockU32(denominator),
  ] as unknown as MockCodec<PolymeshPrimitivesPosRatio>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBool = (value?: boolean | bool): MockCodec<bool> => {
  if (isCodec<bool>(value)) {
    return value as MockCodec<bool>;
  }

  return createMockCodec(
    {
      isTrue: value,
      isFalse: !value,
      valueOf: () => value,
    },
    !value
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioKind = (
  portfolioKind?: 'Default' | { User: u64 } | PolymeshPrimitivesIdentityIdPortfolioKind
): MockCodec<PolymeshPrimitivesIdentityIdPortfolioKind> => {
  if (isCodec<PolymeshPrimitivesIdentityIdPortfolioKind>(portfolioKind)) {
    return portfolioKind as MockCodec<PolymeshPrimitivesIdentityIdPortfolioKind>;
  }

  return createMockEnum<PolymeshPrimitivesIdentityIdPortfolioKind>(portfolioKind);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioId = (
  portfolioId?:
    | PolymeshPrimitivesIdentityIdPortfolioId
    | {
        did: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
        kind:
          | PolymeshPrimitivesIdentityIdPortfolioKind
          | Parameters<typeof createMockPortfolioKind>[0];
      }
): MockCodec<PolymeshPrimitivesIdentityIdPortfolioId> => {
  const { did, kind } = portfolioId ?? {
    did: createMockIdentityId(),
    kind: createMockPortfolioKind(),
  };
  return createMockCodec<PolymeshPrimitivesIdentityIdPortfolioId>(
    {
      did: createMockIdentityId(did),
      kind: createMockPortfolioKind(kind),
    },
    !portfolioId
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMovePortfolioItem = (movePortfolioItem?: {
  ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
  amount: Balance | Parameters<typeof createMockBalance>[0];
}): MockCodec<PalletPortfolioMovePortfolioItem> => {
  if (isCodec<PalletPortfolioMovePortfolioItem>(movePortfolioItem)) {
    return movePortfolioItem as MockCodec<PalletPortfolioMovePortfolioItem>;
  }

  const { ticker, amount } = movePortfolioItem ?? {
    ticker: createMockTicker(),
    amount: createMockBalance(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      amount: createMockBalance(amount),
    },
    !movePortfolioItem
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetType = (
  assetType?:
    | 'EquityCommon'
    | 'EquityPreferred'
    | 'Commodity'
    | 'FixedIncome'
    | 'Reit'
    | 'Fund'
    | 'RevenueShareAgreement'
    | 'StructuredProduct'
    | 'Derivative'
    | 'StableCoin'
    | { Custom: u32 }
    | PolymeshPrimitivesAssetAssetType
): MockCodec<PolymeshPrimitivesAssetAssetType> => {
  return createMockEnum<PolymeshPrimitivesAssetAssetType>(assetType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistrationConfig = (regConfig?: {
  max_ticker_length: u8;
  registration_length: Option<Moment>;
}): MockCodec<PalletAssetTickerRegistrationConfig> => {
  const config = regConfig ?? {
    max_ticker_length: createMockU8(),
    registration_length: createMockOption(),
  };
  return createMockCodec({ ...config }, !regConfig);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecurityToken = (token?: {
  totalSupply: Balance;
  ownerDid: PolymeshPrimitivesIdentityId;
  divisible: bool;
  assetType: PolymeshPrimitivesAssetAssetType;
}): MockCodec<PalletAssetSecurityToken> => {
  const st = token ?? {
    totalSupply: createMockBalance(),
    ownerDid: createMockIdentityId(),
    divisible: createMockBool(),
    assetType: createMockAssetType(),
  };
  return createMockCodec({ ...st }, !token);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocument = (document?: {
  uri: Bytes;
  contentHash: PolymeshPrimitivesDocumentHash;
  name: Bytes;
  docType: Option<Bytes>;
  filingDate: Option<Moment>;
}): MockCodec<PolymeshPrimitivesDocument> => {
  const doc = document ?? {
    uri: createMockBytes(),
    content_hash: createMockDocumentHash(),
    name: createMockBytes(),
    docType: createMockOption(),
    filingDate: createMockOption(),
  };
  return createMockCodec(
    {
      ...doc,
    },
    !document
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDispatchableNames = (
  dispatchableNames?:
    | 'Whole'
    | { These: Bytes[] }
    | { Except: Bytes[] }
    | PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName
): MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName> => {
  if (isCodec<PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName>(dispatchableNames)) {
    return dispatchableNames as MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName>;
  }

  return createMockEnum<PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName>(
    dispatchableNames
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletPermissions = (permissions?: {
  palletName: string | Parameters<typeof createMockBytes>[0];
  dispatchableNames:
    | PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName
    | Parameters<typeof createMockDispatchableNames>[0];
}): MockCodec<PolymeshPrimitivesSecondaryKeyPalletPermissions> => {
  const { palletName, dispatchableNames } = permissions ?? {
    palletName: undefined,
    dispatchableNames: createMockDispatchableNames(),
  };

  return createMockCodec(
    {
      palletName: createMockBytes(palletName),
      dispatchableNames: createMockDispatchableNames(dispatchableNames),
    },
    !permissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountData = (accountData?: {
  free: Balance | Parameters<typeof createMockBalance>[0];
  reserved: Balance | Parameters<typeof createMockBalance>[0];
  miscFrozen: Balance | Parameters<typeof createMockBalance>[0];
  feeFrozen: Balance | Parameters<typeof createMockBalance>[0];
}): MockCodec<AccountData> => {
  const { free, reserved, miscFrozen, feeFrozen } = accountData ?? {
    free: createMockBalance(),
    reserved: createMockBalance(),
    miscFrozen: createMockBalance(),
    feeFrozen: createMockBalance(),
  };

  return createMockCodec(
    {
      free: createMockBalance(free),
      reserved: createMockBalance(reserved),
      miscFrozen: createMockBalance(miscFrozen),
      feeFrozen: createMockBalance(feeFrozen),
    },
    !accountData
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIndex = (value?: BigNumber): Index => createMockNumberCodec<Index>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRefCount = (value?: BigNumber): RefCount =>
  createMockNumberCodec<RefCount>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountInfo = (accountInfo?: {
  nonce: Index;
  refcount: RefCount;
  data: AccountData;
}): MockCodec<AccountInfo> => {
  const info = accountInfo ?? {
    nonce: createMockIndex(),
    refcount: createMockRefCount(),
    data: createMockAccountData(),
  };

  return createMockCodec(
    {
      ...info,
    },
    !accountInfo
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSubsidy = (subsidy?: {
  payingKey: AccountId;
  remaining: Balance;
}): MockCodec<PalletRelayerSubsidy> => {
  const sub = subsidy ?? {
    payingKey: createMockAccountId(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...sub,
    },
    !subsidy
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatory = (
  signatory?: { Identity: PolymeshPrimitivesIdentityId } | { Account: AccountId }
): MockCodec<PolymeshPrimitivesSecondaryKeySignatory> => {
  return createMockEnum<PolymeshPrimitivesSecondaryKeySignatory>(signatory);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationType = (
  authorizationType?:
    | 'AttestPrimaryKeyRotation'
    | 'RotatePrimaryKey'
    | 'TransferTicker'
    | 'AddMultiSigSigner'
    | 'TransferAssetOwnership'
    | 'JoinIdentity'
    | 'Custom'
    | 'NoData'
    | 'RotatePrimaryKeyToSecondary'
): MockCodec<MeshAuthorizationType> => {
  return createMockEnum<MeshAuthorizationType>(authorizationType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8aFixed = (value?: string, hex?: boolean): MockCodec<U8aFixed> =>
  createMockU8aCodec<U8aFixed>(value, hex);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetIdentifier = (
  identifier?:
    | { Isin: U8aFixed }
    | { Cusip: U8aFixed }
    | { Cins: U8aFixed }
    | { Lei: U8aFixed }
    | { Figi: U8aFixed }
): MockCodec<PolymeshPrimitivesAssetIdentifier> =>
  createMockEnum<PolymeshPrimitivesAssetIdentifier>(identifier);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserName = (name?: string): Bytes => createMockBytes(name);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetPermissions = (
  assetPermissions?:
    | 'Whole'
    | { These: PolymeshPrimitivesTicker[] }
    | { Except: PolymeshPrimitivesTicker[] }
): MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionTicker> => {
  return createMockEnum<PolymeshPrimitivesSubsetSubsetRestrictionTicker>(assetPermissions);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockExtrinsicPermissions = (
  assetPermissions?:
    | 'Whole'
    | { These: PolymeshPrimitivesSecondaryKeyPalletPermissions[] }
    | { Except: PolymeshPrimitivesSecondaryKeyPalletPermissions[] }
): MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions> => {
  return createMockEnum<PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions>(
    assetPermissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioPermissions = (
  assetPermissions?:
    | 'Whole'
    | { These: PolymeshPrimitivesIdentityIdPortfolioId[] }
    | { Except: PolymeshPrimitivesIdentityIdPortfolioId[] }
): MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId> => {
  return createMockEnum<PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId>(assetPermissions);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermissions = (permissions?: {
  asset: PolymeshPrimitivesSubsetSubsetRestrictionTicker;
  extrinsic: PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions;
  portfolio: PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId;
}): MockCodec<PolymeshPrimitivesSecondaryKeyPermissions> => {
  const perms = permissions ?? {
    asset: createMockAssetPermissions(),
    extrinsic: createMockExtrinsicPermissions(),
    portfolio: createMockPortfolioPermissions(),
  };

  return createMockCodec(
    {
      ...perms,
    },
    !permissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationData = (
  authorizationData?:
    | { AttestPrimaryKeyRotation: PolymeshPrimitivesIdentityId }
    | 'RotatePrimaryKey'
    | { RotatePrimaryKeyToSecondary: PolymeshPrimitivesSecondaryKeyPermissions }
    | { TransferTicker: PolymeshPrimitivesTicker }
    | { AddMultiSigSigner: AccountId }
    | { TransferAssetOwnership: PolymeshPrimitivesTicker }
    | { JoinIdentity: PolymeshPrimitivesSecondaryKeyPermissions }
    | { PortfolioCustody: PolymeshPrimitivesIdentityIdPortfolioId }
    | { AddRelayerPayingKey: [AccountId, AccountId, Balance] }
    | { BecomeAgent: [PolymeshPrimitivesTicker, PolymeshPrimitivesAgentAgentGroup] }
    | PolymeshPrimitivesAuthorizationAuthorizationData
): MockCodec<PolymeshPrimitivesAuthorizationAuthorizationData> => {
  if (isCodec<PolymeshPrimitivesAuthorizationAuthorizationData>(authorizationData)) {
    return authorizationData as MockCodec<PolymeshPrimitivesAuthorizationAuthorizationData>;
  }

  return createMockEnum<PolymeshPrimitivesAuthorizationAuthorizationData>(authorizationData);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorization = (authorization?: {
  authorizationData:
    | PolymeshPrimitivesAuthorizationAuthorizationData
    | Parameters<typeof createMockAuthorizationData>[0];
  authorizedBy: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
  expiry: Option<Moment>;
  authId: u64 | Parameters<typeof createMockU64>[0];
}): MockCodec<PolymeshPrimitivesAuthorization> => {
  const { authorizationData, authorizedBy, expiry, authId } = authorization ?? {
    authorizationData: createMockAuthorizationData(),
    authorizedBy: createMockIdentityId(),
    expiry: createMockOption(),
    authId: createMockU64(),
  };

  return createMockCodec(
    {
      authorizationData: createMockAuthorizationData(authorizationData),
      authorizedBy: createMockIdentityId(authorizedBy),
      expiry: createMockOption(expiry),
      authId: createMockU64(authId),
    },
    !authorization
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEventRecord = (data: unknown[]): EventRecord =>
  ({
    event: {
      data,
    },
  } as unknown as EventRecord);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIEvent = <T extends Codec[]>(data: unknown[]): IEvent<T> =>
  ({
    data,
  } as unknown as IEvent<T>);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddStatus = (
  cddStatus?: { Ok: PolymeshPrimitivesIdentityId } | { Err: Bytes }
): MockCodec<CddStatus> => createMockEnum<CddStatus>(cddStatus);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCountryCode = (
  name?: CountryCodeEnum
): MockCodec<PolymeshPrimitivesJurisdictionCountryCode> =>
  createMockEnum<PolymeshPrimitivesJurisdictionCountryCode>(name);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScope = (
  scope?:
    | { Identity: PolymeshPrimitivesIdentityId }
    | { Ticker: PolymeshPrimitivesTicker }
    | { Custom: Bytes }
): MockCodec<PolymeshPrimitivesIdentityClaimScope> =>
  createMockEnum<PolymeshPrimitivesIdentityClaimScope>(scope);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddId = (cddId?: string): MockCodec<PolymeshPrimitivesCddId> =>
  createMockStringCodec<PolymeshPrimitivesCddId>(cddId);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInvestorZKProofData = (
  proof?: string
): ConfidentialIdentityV2ClaimProofsZkProofData =>
  createMockStringCodec<ConfidentialIdentityV2ClaimProofsZkProofData>(proof);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim = (
  claim?:
    | { Accredited: PolymeshPrimitivesIdentityClaimScope }
    | { Affiliate: PolymeshPrimitivesIdentityClaimScope }
    | { BuyLockup: PolymeshPrimitivesIdentityClaimScope }
    | { SellLockup: PolymeshPrimitivesIdentityClaimScope }
    | { CustomerDueDiligence: PolymeshPrimitivesCddId }
    | { KnowYourCustomer: PolymeshPrimitivesIdentityClaimScope }
    | {
        Jurisdiction: [
          PolymeshPrimitivesJurisdictionCountryCode,
          PolymeshPrimitivesIdentityClaimScope
        ];
      }
    | { Exempted: PolymeshPrimitivesIdentityClaimScope }
    | { Blocked: PolymeshPrimitivesIdentityClaimScope }
    | {
        InvestorUniqueness: [
          PolymeshPrimitivesIdentityClaimScope,
          PolymeshPrimitivesIdentityId,
          PolymeshPrimitivesCddId
        ];
      }
    | { InvestorUniquenessV2: PolymeshPrimitivesCddId }
    | 'NoData'
): PolymeshPrimitivesIdentityClaimClaim =>
  createMockEnum<PolymeshPrimitivesIdentityClaimClaim>(claim);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityClaim = (identityClaim?: {
  claim_issuer: PolymeshPrimitivesIdentityId;
  issuance_date: Moment;
  last_update_date: Moment;
  expiry: Option<Moment>;
  claim: PolymeshPrimitivesIdentityClaimClaim;
}): MockCodec<PolymeshPrimitivesIdentityClaim> => {
  const identityClaimMock = identityClaim ?? {
    claim_issuer: createMockIdentityId(),
    issuance_date: createMockMoment(),
    last_update_date: createMockMoment(),
    expiry: createMockOption(),
    claim: createMockClaim(),
  };
  return createMockCodec(
    {
      ...identityClaimMock,
    },
    !identityClaimMock
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentity = (
  targetIdentity?: { Specific: PolymeshPrimitivesIdentityId } | 'ExternalAgent'
): MockCodec<PolymeshPrimitivesConditionTargetIdentity> =>
  createMockEnum<PolymeshPrimitivesConditionTargetIdentity>(targetIdentity);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionType = (
  conditionType?:
    | { IsPresent: PolymeshPrimitivesIdentityClaimClaim }
    | { IsAbsent: PolymeshPrimitivesIdentityClaimClaim }
    | { IsAnyOf: PolymeshPrimitivesIdentityClaimClaim[] }
    | { IsNoneOf: PolymeshPrimitivesIdentityClaimClaim[] }
    | { IsIdentity: PolymeshPrimitivesConditionTargetIdentity }
    | PolymeshPrimitivesConditionConditionType
): MockCodec<PolymeshPrimitivesConditionConditionType> => {
  if (isCodec<PolymeshPrimitivesConditionConditionType>(conditionType)) {
    return conditionType as MockCodec<PolymeshPrimitivesConditionConditionType>;
  }

  return createMockEnum<PolymeshPrimitivesConditionConditionType>(conditionType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaimType = (
  claimType?: ClaimType
): MockCodec<PolymeshPrimitivesIdentityClaimClaimType> => {
  const claimIndexes = {
    Accredited: 1,
    Affiliate: 2,
    BuyLockup: 3,
    SellLockup: 4,
    CustomerDueDiligence: 5,
    KnowYourCustomer: 6,
    Jurisdiction: 7,
    Exempted: 8,
    Blocked: 9,
    InvestorUniqueness: 10,
    NoType: 11,
    NoData: 11,
    InvestorUniquenessV2: 12,
  };
  return createMockEnum<PolymeshPrimitivesIdentityClaimClaimType>(
    claimType,
    claimType ? claimIndexes[claimType] : 0
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim1stKey = (claim1stKey?: {
  target: PolymeshPrimitivesIdentityId;
  claimType: PolymeshPrimitivesIdentityClaimClaimType;
}): MockCodec<PalletIdentityClaim1stKey> => {
  const claimTypeMock = claim1stKey ?? {
    target: createMockIdentityId(),
    claimType: createMockClaimType(),
  };
  return createMockCodec(
    {
      ...claimTypeMock,
    },
    !claimTypeMock
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedFor = (
  trustedFor?: 'Any' | { Specific: PolymeshPrimitivesIdentityClaimClaimType[] }
): MockCodec<PolymeshPrimitivesConditionTrustedFor> =>
  createMockEnum<PolymeshPrimitivesConditionTrustedFor>(trustedFor);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedIssuer = (issuer?: {
  issuer: PolymeshPrimitivesIdentityId;
  trustedFor: PolymeshPrimitivesConditionTrustedFor;
}): MockCodec<PolymeshPrimitivesConditionTrustedIssuer> => {
  const trustedIssuer = issuer ?? {
    issuer: createMockIdentityId(),
    trustedFor: createMockTrustedFor(),
  };

  return createMockCodec(
    {
      ...trustedIssuer,
    },
    !issuer
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCondition = (condition?: {
  conditionType:
    | PolymeshPrimitivesConditionConditionType
    | Parameters<typeof createMockConditionType>[0];
  issuers: (
    | PolymeshPrimitivesConditionTrustedIssuer
    | Parameters<typeof createMockTrustedIssuer>[0]
  )[];
}): MockCodec<PolymeshPrimitivesCondition> => {
  const { conditionType, issuers } = condition ?? {
    conditionType: createMockConditionType(),
    issuers: [],
  };
  return createMockCodec(
    {
      conditionType: createMockConditionType(conditionType),
      issuers: issuers.map(issuer => createMockTrustedIssuer(issuer)),
    },
    !condition
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionResult = (conditionResult?: {
  condition: PolymeshPrimitivesCondition | Parameters<typeof createMockCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<ConditionResult> => {
  const { condition, result } = conditionResult ?? {
    condition: createMockCondition(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      condition: createMockCondition(condition),
      result: createMockBool(result),
    },
    !conditionResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirement = (complianceRequirement?: {
  senderConditions: PolymeshPrimitivesCondition[];
  receiverConditions: PolymeshPrimitivesCondition[];
  id: u32;
}): MockCodec<PolymeshPrimitivesComplianceManagerComplianceRequirement> => {
  const requirement = complianceRequirement ?? {
    senderConditions: [],
    receiverConditions: [],
    id: createMockU32(),
  };

  return createMockCodec(
    {
      ...requirement,
    },
    !complianceRequirement
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirementResult = (complianceRequirementResult?: {
  senderConditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  receiverConditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  id: u32 | Parameters<typeof createMockU32>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): ComplianceRequirementResult => {
  const { senderConditions, receiverConditions, id, result } = complianceRequirementResult ?? {
    senderConditions: [],
    receiverConditions: [],
    id: createMockU32(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      senderConditions: senderConditions.map(condition => createMockConditionResult(condition)),
      receiverConditions: receiverConditions.map(condition => createMockConditionResult(condition)),
      id: createMockU32(id),
      result: createMockBool(result),
    },
    !complianceRequirementResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetComplianceResult = (assetComplianceResult?: {
  paused: bool | Parameters<typeof createMockBool>[0];
  requirements: {
    senderConditions: ConditionResult[];
    receiverConditions: ConditionResult[];
    result: bool;
    id: u32 | Parameters<typeof createMockU32>[0];
  }[];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<AssetComplianceResult> => {
  const { paused, requirements, result } = assetComplianceResult ?? {
    paused: createMockBool(),
    requirements: [],
    result: createMockBool(),
  };

  return createMockCodec(
    {
      paused: createMockBool(paused),
      requirements: requirements.map(requirement =>
        createMockComplianceRequirementResult(requirement)
      ),
      result: createMockBool(result),
    },
    !assetComplianceResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityDidRecord = (identity?: {
  primaryKey: Option<AccountId>;
}): MockCodec<PolymeshPrimitivesIdentityDidRecord> => {
  const record = identity ?? {
    primaryKey: createMockOption(createMockAccountId()),
  };

  return createMockCodec(
    {
      ...record,
    },
    !identity
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockKeyRecord = (
  value?:
    | { PrimaryKey: PolymeshPrimitivesIdentityId }
    | {
        SecondaryKey: [PolymeshPrimitivesIdentityId, PolymeshPrimitivesSecondaryKeyPermissions];
      }
    | { MultiSigSignerKey: AccountId }
): MockCodec<PolymeshPrimitivesSecondaryKeyKeyRecord> => {
  const record = value ?? {
    PrimaryKey: createMockIdentityId(),
  };

  return createMockEnum<PolymeshPrimitivesSecondaryKeyKeyRecord>({
    ...record,
  });
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCanTransferResult = (
  canTransferResult?: { Ok: u8 } | { Err: Bytes }
): MockCodec<CanTransferResult> => createMockEnum<CanTransferResult>(canTransferResult);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockText = (value?: string | Text): MockCodec<Text> => {
  if (isCodec<Text>(value)) {
    return value as MockCodec<Text>;
  }

  return createMockStringCodec<Text>(value);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetOwnershipRelation = (
  assetOwnershipRelation?: 'NotOwned' | 'TickerOwned' | 'AssetOwned'
): MockCodec<PalletAssetAssetOwnershipRelation> =>
  createMockEnum<PalletAssetAssetOwnershipRelation>(assetOwnershipRelation);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalStatus = (
  proposalStatus?:
    | 'Invalid'
    | 'ActiveOrExpired'
    | 'ExecutionSuccessful'
    | 'ExecutionFailed'
    | 'Rejected'
): MockCodec<PalletMultisigProposalStatus> => {
  return createMockEnum(proposalStatus) as MockCodec<PalletMultisigProposalStatus>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecondaryKey = (secondaryKey?: {
  signer: PolymeshPrimitivesSecondaryKeySignatory;
  permissions: PolymeshPrimitivesSecondaryKeyPermissions;
}): MockCodec<PolymeshPrimitivesSecondaryKey> => {
  const key = secondaryKey ?? {
    signer: createMockSignatory(),
    permissions: createMockPermissions(),
  };
  return createMockCodec(
    {
      ...key,
    },
    !secondaryKey
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueType = (
  venueType?: 'Other' | 'Distribution' | 'Sto' | 'Exchange'
): MockCodec<PalletSettlementVenueType> => {
  return createMockEnum<PalletSettlementVenueType>(venueType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenue = (venue?: {
  creator: PolymeshPrimitivesIdentityId;
  venueType: PalletSettlementVenueType;
}): MockCodec<PalletSettlementVenue> => {
  const vn = venue ?? {
    creator: createMockIdentityId(),
    venueType: createMockVenueType(),
  };

  return createMockCodec(
    {
      ...vn,
    },
    !venue
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstructionStatus = (
  instructionStatus?: 'Pending' | 'Unknown' | 'Failed'
): MockCodec<PalletSettlementInstructionStatus> => {
  return createMockEnum<PalletSettlementInstructionStatus>(instructionStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSettlementType = (
  settlementType?: 'SettleOnAffirmation' | { SettleOnBlock: u32 } | { SettleManual: u32 }
): MockCodec<PalletSettlementSettlementType> => {
  return createMockEnum<PalletSettlementSettlementType>(settlementType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAffirmationStatus = (
  authorizationStatus?: 'Unknown' | 'Pending' | 'Affirmed'
): MockCodec<PalletSettlementAffirmationStatus> => {
  return createMockEnum<PalletSettlementAffirmationStatus>(authorizationStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstruction = (instruction?: {
  instructionId: u64;
  venueId: u64;
  status: PalletSettlementInstructionStatus;
  settlementType: PalletSettlementSettlementType;
  createdAt: Option<Moment>;
  tradeDate: Option<Moment>;
  valueDate: Option<Moment>;
}): MockCodec<PalletSettlementInstruction> => {
  const data = instruction ?? {
    instructionId: createMockU64(),
    venueId: createMockU64(),
    status: createMockInstructionStatus(),
    settlementType: createMockSettlementType(),
    createdAt: createMockOption(),
    tradeDate: createMockOption(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !instruction
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferCondition = (
  transferCondition?:
    | { MaxInvestorCount: u64 }
    | { MaxInvestorOwnership: Permill }
    | {
        ClaimCount: [
          PolymeshPrimitivesStatisticsStatClaim,
          PolymeshPrimitivesIdentityId,
          u64,
          Option<u64>
        ];
      }
    | {
        ClaimOwnership: [
          PolymeshPrimitivesStatisticsStatClaim,
          PolymeshPrimitivesIdentityId,
          Permill,
          Permill
        ];
      }
    | PolymeshPrimitivesTransferComplianceTransferCondition
): MockCodec<PolymeshPrimitivesTransferComplianceTransferCondition> => {
  if (isCodec<PolymeshPrimitivesTransferComplianceTransferCondition>(transferCondition)) {
    return transferCondition as MockCodec<PolymeshPrimitivesTransferComplianceTransferCondition>;
  }
  return createMockEnum<PolymeshPrimitivesTransferComplianceTransferCondition>(transferCondition);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserTier = (fundraiserTier?: {
  total: Balance;
  price: Balance;
  remaining: Balance;
}): MockCodec<PalletStoFundraiserTier> => {
  const data = fundraiserTier ?? {
    total: createMockBalance(),
    price: createMockBalance(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiserTier
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserStatus = (
  fundraiserStatus?: 'Live' | 'Frozen' | 'Closed' | 'ClosedEarly'
): MockCodec<PalletStoFundraiserStatus> => {
  return createMockEnum<PalletStoFundraiserStatus>(fundraiserStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiser = (fundraiser?: {
  creator: PolymeshPrimitivesIdentityId;
  offeringPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  offeringAsset: PolymeshPrimitivesTicker;
  raisingPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  raisingAsset: PolymeshPrimitivesTicker;
  tiers: PalletStoFundraiserTier[];
  venueId: u64;
  start: Moment;
  end: Option<Moment>;
  status: PalletStoFundraiserStatus;
  minimumInvestment: Balance;
}): MockCodec<PalletStoFundraiser> => {
  const data = fundraiser ?? {
    creator: createMockIdentityId(),
    offeringPortfolio: createMockPortfolioId(),
    offeringAsset: createMockTicker(),
    raisingPortfolio: createMockPortfolioId(),
    raisingAsset: createMockTicker(),
    tiers: [],
    venueId: createMockU64(),
    start: createMockMoment(),
    end: createMockOption(),
    status: createMockFundraiserStatus(),
    minimumInvestment: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiser
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPriceTier = (priceTier?: {
  total: Balance;
  price: Balance;
}): MockCodec<PalletStoPriceTier> => {
  const data = priceTier ?? {
    total: createMockBalance(),
    price: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !priceTier
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarUnit = (
  calendarUnit?:
    | 'Second'
    | 'Minute'
    | 'Hour'
    | 'Day'
    | 'Week'
    | 'Month'
    | 'Year'
    | PolymeshPrimitivesCalendarCalendarUnit
): MockCodec<PolymeshPrimitivesCalendarCalendarUnit> => {
  if (isCodec<PolymeshPrimitivesCalendarCalendarUnit>(calendarUnit)) {
    return calendarUnit as MockCodec<PolymeshPrimitivesCalendarCalendarUnit>;
  }

  return createMockEnum<PolymeshPrimitivesCalendarCalendarUnit>(calendarUnit);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarPeriod = (
  calendarPeriod?:
    | PolymeshPrimitivesCalendarCalendarPeriod
    | {
        unit: PolymeshPrimitivesCalendarCalendarUnit | Parameters<typeof createMockCalendarUnit>[0];
        amount: u64 | Parameters<typeof createMockU64>[0];
      }
): MockCodec<PolymeshPrimitivesCalendarCalendarPeriod> => {
  const { unit, amount } = calendarPeriod ?? {
    unit: createMockCalendarUnit(),
    amount: createMockU64(),
  };

  return createMockCodec(
    {
      unit: createMockCalendarUnit(unit),
      amount: createMockU64(amount),
    },
    !calendarPeriod
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCheckpointSchedule = (
  checkpointSchedule?:
    | PolymeshPrimitivesCalendarCheckpointSchedule
    | {
        start: Moment | Parameters<typeof createMockMoment>[0];
        period:
          | PolymeshPrimitivesCalendarCalendarPeriod
          | Parameters<typeof createMockCalendarPeriod>[0];
      }
): MockCodec<PolymeshPrimitivesCalendarCheckpointSchedule> => {
  const { start, period } = checkpointSchedule ?? {
    start: createMockMoment(),
    period: createMockCalendarPeriod(),
  };

  return createMockCodec(
    {
      start: createMockMoment(start),
      period: createMockCalendarPeriod(period),
    },
    !checkpointSchedule
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStoredSchedule = (
  storedSchedule?:
    | PolymeshCommonUtilitiesCheckpointStoredSchedule
    | {
        schedule:
          | PolymeshPrimitivesCalendarCheckpointSchedule
          | Parameters<typeof createMockCheckpointSchedule>[0];
        id: u64 | Parameters<typeof createMockU64>[0];
        at: Moment | Parameters<typeof createMockMoment>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<PolymeshCommonUtilitiesCheckpointStoredSchedule> => {
  const { schedule, id, at, remaining } = storedSchedule ?? {
    schedule: createMockCheckpointSchedule(),
    id: createMockU64(),
    at: createMockMoment(),
    remaining: createMockU32(),
  };

  return createMockCodec(
    {
      schedule: createMockCheckpointSchedule(schedule),
      id: createMockU64(id),
      at: createMockMoment(at),
      remaining: createMockU32(remaining),
    },
    !storedSchedule
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScheduleSpec = (
  scheduleSpec?:
    | PalletAssetCheckpointScheduleSpec
    | {
        start: Option<Moment>;
        period:
          | PolymeshPrimitivesCalendarCalendarPeriod
          | Parameters<typeof createMockCalendarPeriod>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<PalletAssetCheckpointScheduleSpec> => {
  const { start, period, remaining } = scheduleSpec ?? {
    start: createMockOption(),
    period: createMockCalendarPeriod(),
    remaining: createMockU32(),
  };

  return createMockCodec(
    {
      start: createMockOption(start),
      period: createMockCalendarPeriod(period),
      remaining: createMockU32(remaining),
    },
    !scheduleSpec
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDateSpec = (
  recordDateSpec?:
    | { Scheduled: Moment }
    | { ExistingSchedule: u64 }
    | { Existing: u64 }
    | PalletCorporateActionsRecordDateSpec
): MockCodec<PalletCorporateActionsRecordDateSpec> => {
  if (isCodec<PalletCorporateActionsRecordDateSpec>(recordDateSpec)) {
    return recordDateSpec as MockCodec<PalletCorporateActionsRecordDateSpec>;
  }

  return createMockEnum<PalletCorporateActionsRecordDateSpec>(recordDateSpec);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCACheckpoint = (
  caCheckpoint?: { Scheduled: [u64, u64] } | { Existing: u64 } | PalletCorporateActionsCaCheckpoint
): MockCodec<PalletCorporateActionsCaCheckpoint> => {
  if (isCodec<PalletCorporateActionsCaCheckpoint>(caCheckpoint)) {
    return caCheckpoint as MockCodec<PalletCorporateActionsCaCheckpoint>;
  }

  return createMockEnum<PalletCorporateActionsCaCheckpoint>(caCheckpoint);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDate = (
  recordDate?:
    | PalletCorporateActionsRecordDate
    | {
        date: Moment | Parameters<typeof createMockMoment>[0];
        checkpoint:
          | PalletCorporateActionsCaCheckpoint
          | Parameters<typeof createMockCACheckpoint>[0];
      }
): MockCodec<PalletCorporateActionsRecordDate> => {
  const { date, checkpoint } = recordDate ?? {
    date: createMockMoment(),
    checkpoint: createMockCACheckpoint(),
  };

  return createMockCodec(
    {
      date: createMockMoment(date),
      checkpoint: createMockCACheckpoint(checkpoint),
    },
    !recordDate
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignature = (
  signature?: string | ConfidentialIdentityV2SignSignature
): MockCodec<ConfidentialIdentityV2SignSignature> => {
  if (!signature || typeof signature === 'string') {
    return createMockStringCodec<ConfidentialIdentityV2SignSignature>(signature);
  } else {
    return signature as MockCodec<ConfidentialIdentityV2SignSignature>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockZkProofData = (
  zkProofData?:
    | ConfidentialIdentityV2ClaimProofsZkProofData
    | {
        challengeResponses: [U8aFixed, U8aFixed] | [string, string];
        subtractExpressionsRes: U8aFixed | string;
        blindedScopeDidHash: U8aFixed | string;
      }
): MockCodec<ConfidentialIdentityV2ClaimProofsZkProofData> => {
  const { challengeResponses, subtractExpressionsRes, blindedScopeDidHash } = zkProofData ?? {
    challengeResponses: [createMockU8aFixed(), createMockU8aFixed()],
    subtractExpressionsRes: createMockU8aFixed(),
    blindedScopeDidHash: createMockU8aFixed(),
  };

  return createMockCodec(
    {
      challengeResponses: [
        createMockU8aFixed(challengeResponses[0] as string),
        createMockU8aFixed(challengeResponses[1] as string),
      ],
      subtractExpressionsRes: createMockU8aFixed(subtractExpressionsRes as string),
      blindedScopeDidHash: createMockU8aFixed(blindedScopeDidHash as string),
    },
    !zkProofData
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetTreatment = (
  targetTreatment?: 'Include' | 'Exclude' | PalletCorporateActionsTargetTreatment
): MockCodec<PalletCorporateActionsTargetTreatment> => {
  if (isCodec<PalletCorporateActionsTargetTreatment>(targetTreatment)) {
    return targetTreatment as MockCodec<PalletCorporateActionsTargetTreatment>;
  }

  return createMockEnum<PalletCorporateActionsTargetTreatment>(targetTreatment);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentities = (
  targetIdentities?:
    | PalletCorporateActionsTargetIdentities
    | {
        identities: (PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0])[];
        treatment:
          | PalletCorporateActionsTargetTreatment
          | Parameters<typeof createMockTargetTreatment>[0];
      }
): MockCodec<PalletCorporateActionsTargetIdentities> => {
  const { identities, treatment } = targetIdentities ?? {
    identities: [],
    treatment: createMockTargetTreatment(),
  };

  return createMockCodec(
    {
      identities: map(identities, identityId => createMockIdentityId(identityId)),
      treatment: createMockTargetTreatment(treatment),
    },
    !targetIdentities
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeClaimProof = (
  scopeClaimProof?:
    | ConfidentialIdentityV2ClaimProofsScopeClaimProof
    | {
        proofScopeIdWellformed: ConfidentialIdentityV2SignSignature | string;
        proofScopeIdCddIdMatch:
          | ConfidentialIdentityV2ClaimProofsZkProofData
          | {
              challengeResponses: [string, string];
              subtractExpressionsRes: string;
              blindedScopeDidHash: string;
            };
        scopeId: U8aFixed | string;
      }
): MockCodec<ConfidentialIdentityV2ClaimProofsScopeClaimProof> => {
  const { proofScopeIdWellformed, proofScopeIdCddIdMatch, scopeId } = scopeClaimProof ?? {
    proofScopeIdWellformed: createMockSignature(),
    proofScopeIdCddIdMatch: createMockZkProofData(),
    scopeId: createMockU8aFixed(),
  };

  return createMockCodec(
    {
      proofScopeIdWellformed: createMockSignature(proofScopeIdWellformed),
      proofScopeIdCddIdMatch: createMockZkProofData(proofScopeIdCddIdMatch),
      scopeId: createMockU8aFixed(scopeId as string),
    },
    !scopeClaimProof
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCAKind = (
  caKind?:
    | 'PredictableBenefit'
    | 'UnpredictableBenefit'
    | 'IssuerNotice'
    | 'Reorganization'
    | 'Other'
    | PalletCorporateActionsCaKind
): MockCodec<PalletCorporateActionsCaKind> => {
  if (isCodec<PalletCorporateActionsCaKind>(caKind)) {
    return caKind as MockCodec<PalletCorporateActionsCaKind>;
  }

  return createMockEnum<PalletCorporateActionsCaKind>(caKind);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCorporateAction = (corporateAction?: {
  kind: PalletCorporateActionsCaKind | Parameters<typeof createMockCAKind>[0];
  decl_date: Moment | Parameters<typeof createMockMoment>[0];
  record_date: Option<PalletCorporateActionsRecordDate> | Parameters<typeof createMockOption>[0];
  targets:
    | PalletCorporateActionsTargetIdentities
    | Parameters<typeof createMockTargetIdentities>[0];
  default_withholding_tax: Permill | Parameters<typeof createMockPermill>[0];
  withholding_tax: [
    PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0],
    Permill | Parameters<typeof createMockPermill>[0]
  ][];
}): MockCodec<PalletCorporateActionsCorporateAction> => {
  const { kind, decl_date, record_date, targets, default_withholding_tax, withholding_tax } =
    corporateAction ?? {
      kind: createMockCAKind(),
      declDate: createMockMoment(),
      recordDate: createMockOption(),
      targets: createMockTargetIdentities(),
      defaultWithholdingTax: createMockPermill(),
      withholding_tax: [],
    };

  return createMockCodec(
    {
      kind: createMockCAKind(kind),
      declDate: createMockMoment(decl_date),
      recordDate: createMockOption(record_date),
      targets: createMockTargetIdentities(targets),
      defaultWithholdingTax: createMockPermill(default_withholding_tax),
      withholdingTax: withholding_tax.map(([identityId, tax]) =>
        tuple(createMockIdentityId(identityId), createMockPermill(tax))
      ),
    },
    !corporateAction
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCAId = (
  caId?:
    | PalletCorporateActionsCaId
    | {
        ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
        localId: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<PalletCorporateActionsCaId> => {
  const { ticker, localId } = caId ?? {
    ticker: createMockTicker(),
    localId: createMockU32(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      localId: createMockU32(localId),
    },
    !caId
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDistribution = (distribution?: {
  from: PolymeshPrimitivesIdentityIdPortfolioId | Parameters<typeof createMockPortfolioId>[0];
  currency: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
  perShare: Balance | Parameters<typeof createMockBalance>[0];
  amount: Balance | Parameters<typeof createMockBalance>[0];
  remaining: Balance | Parameters<typeof createMockBalance>[0];
  reclaimed: bool | Parameters<typeof createMockBool>[0];
  paymentAt: Moment | Parameters<typeof createMockMoment>[0];
  expiresAt: Option<Moment>;
}): MockCodec<PalletCorporateActionsDistribution> => {
  const { from, currency, perShare, amount, remaining, reclaimed, paymentAt, expiresAt } =
    distribution ?? {
      from: createMockPortfolioId(),
      currency: createMockTicker(),
      perShare: createMockBalance(),
      amount: createMockBalance(),
      remaining: createMockBalance(),
      reclaimed: createMockBool(),
      paymentAt: createMockMoment(),
      expiresAt: createMockOption(),
    };

  return createMockCodec(
    {
      from: createMockPortfolioId(from),
      currency: createMockTicker(currency),
      perShare: createMockBalance(perShare),
      amount: createMockBalance(amount),
      remaining: createMockBalance(remaining),
      reclaimed: createMockBool(reclaimed),
      paymentAt: createMockMoment(paymentAt),
      expiresAt: createMockOption(expiresAt),
    },
    !distribution
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferConditionResult = (transferManagerResult?: {
  condition:
    | PolymeshPrimitivesTransferComplianceTransferCondition
    | Parameters<typeof createMockTransferCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<TransferConditionResult> => {
  const { condition, result } = transferManagerResult ?? {
    condition: createMockTransferCondition(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      condition: createMockTransferCondition(condition),
      result: createMockBool(result),
    },
    !transferManagerResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioValidityResult = (portfolioValidityResult?: {
  receiver_is_same_portfolio: bool | Parameters<typeof createMockBool>[0];
  sender_portfolio_does_not_exist: bool | Parameters<typeof createMockBool>[0];
  receiver_portfolio_does_not_exist: bool | Parameters<typeof createMockBool>[0];
  sender_insufficient_balance: bool | Parameters<typeof createMockBool>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<PortfolioValidityResult> => {
  const {
    receiver_is_same_portfolio,
    sender_portfolio_does_not_exist,
    receiver_portfolio_does_not_exist,
    sender_insufficient_balance,
    result,
  } = portfolioValidityResult ?? {
    receiver_is_same_portfolio: createMockBool(),
    sender_portfolio_does_not_exist: createMockBool(),
    receiver_portfolio_does_not_exist: createMockBool(),
    sender_insufficient_balance: createMockBool(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      receiver_is_same_portfolio: createMockBool(receiver_is_same_portfolio),
      sender_portfolio_does_not_exist: createMockBool(sender_portfolio_does_not_exist),
      receiver_portfolio_does_not_exist: createMockBool(receiver_portfolio_does_not_exist),
      sender_insufficient_balance: createMockBool(sender_insufficient_balance),
      result: createMockBool(result),
    },
    !portfolioValidityResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockGranularCanTransferResult = (granularCanTransferResult?: {
  invalid_granularity: bool | Parameters<typeof createMockBool>[0];
  self_transfer: bool | Parameters<typeof createMockBool>[0];
  invalid_receiver_cdd: bool | Parameters<typeof createMockBool>[0];
  invalid_sender_cdd: bool | Parameters<typeof createMockBool>[0];
  missing_scope_claim: bool | Parameters<typeof createMockBool>[0];
  receiver_custodian_error: bool | Parameters<typeof createMockBool>[0];
  sender_custodian_error: bool | Parameters<typeof createMockBool>[0];
  sender_insufficient_balance: bool | Parameters<typeof createMockBool>[0];
  portfolio_validity_result:
    | PortfolioValidityResult
    | Parameters<typeof createMockPortfolioValidityResult>[0];
  asset_frozen: bool | Parameters<typeof createMockBool>[0];
  transfer_condition_result: (
    | TransferConditionResult
    | Parameters<typeof createMockTransferConditionResult>[0]
  )[];
  compliance_result: AssetComplianceResult | Parameters<typeof createMockAssetComplianceResult>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<GranularCanTransferResult> => {
  const {
    invalid_granularity,
    self_transfer,
    invalid_receiver_cdd,
    invalid_sender_cdd,
    missing_scope_claim,
    receiver_custodian_error,
    sender_custodian_error,
    sender_insufficient_balance,
    portfolio_validity_result,
    asset_frozen,
    transfer_condition_result,
    compliance_result,
    result,
  } = granularCanTransferResult ?? {
    invalid_granularity: createMockBool(),
    self_transfer: createMockBool(),
    invalid_receiver_cdd: createMockBool(),
    invalid_sender_cdd: createMockBool(),
    missing_scope_claim: createMockBool(),
    receiver_custodian_error: createMockBool(),
    sender_custodian_error: createMockBool(),
    sender_insufficient_balance: createMockBool(),
    portfolio_validity_result: createMockPortfolioValidityResult(),
    asset_frozen: createMockBool(),
    transfer_condition_result: [],
    compliance_result: createMockAssetComplianceResult(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      invalid_granularity: createMockBool(invalid_granularity),
      self_transfer: createMockBool(self_transfer),
      invalid_receiver_cdd: createMockBool(invalid_receiver_cdd),
      invalid_sender_cdd: createMockBool(invalid_sender_cdd),
      missing_scope_claim: createMockBool(missing_scope_claim),
      receiver_custodian_error: createMockBool(receiver_custodian_error),
      sender_custodian_error: createMockBool(sender_custodian_error),
      sender_insufficient_balance: createMockBool(sender_insufficient_balance),
      portfolio_validity_result: createMockPortfolioValidityResult(portfolio_validity_result),
      asset_frozen: createMockBool(asset_frozen),
      transfer_condition_result: transfer_condition_result.map(res =>
        createMockTransferConditionResult(res)
      ),
      compliance_result: createMockAssetComplianceResult(compliance_result as any),
      result: createMockBool(result),
    },
    !granularCanTransferResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockHeader = (
  header?:
    | Header
    | {
        parentHash: Hash | Parameters<typeof createMockHash>[0];
        number: Compact<u32>;
        stateRoot: Hash | Parameters<typeof createMockHash>[0];
        extrinsicsRoot: Hash | Parameters<typeof createMockHash>[0];
      }
): MockCodec<Header> => {
  const { parentHash, number, stateRoot, extrinsicsRoot } = header ?? {
    parentHash: createMockHash(),
    number: createMockCompact(),
    stateRoot: createMockHash(),
    extrinsicsRoot: createMockHash(),
  };

  return createMockCodec(
    {
      parentHash: createMockHash(parentHash),
      number: createMockCompact(number.unwrap()),
      stateRoot: createMockHash(stateRoot),
      extrinsicsRoot: createMockHash(extrinsicsRoot),
    },
    !header
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockExtrinsics = (
  extrinsics?:
    | Vec<GenericExtrinsic>
    | {
        toHex: () => string;
      }[]
): MockCodec<Vec<GenericExtrinsic>> => {
  const [{ toHex }] = extrinsics ?? [
    {
      toHex: () => createMockStringCodec(),
    },
  ];
  return createMockCodec(
    [
      {
        toHex,
      },
    ],
    !extrinsics
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBlock = (
  block?:
    | Block
    | {
        header: Header | Parameters<typeof createMockHeader>[0];
        extrinsics: Vec<GenericExtrinsic> | Parameters<typeof createMockExtrinsics>[0];
      }
): MockCodec<Block> => {
  const { header, extrinsics } = block ?? {
    header: createMockHeader(),
    extrinsics: createMockExtrinsics(),
  };

  return createMockCodec(
    {
      header: createMockHeader(header),
      extrinsics: createMockExtrinsics(extrinsics),
    },
    !block
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignedBlock = (
  signedBlock?:
    | SignedBlock
    | {
        block: Block | Parameters<typeof createMockBlock>[0];
      }
): MockCodec<SignedBlock> => {
  const { block } = signedBlock ?? {
    block: createMockBlock(),
  };

  return createMockCodec(
    {
      block: createMockBlock(block),
    },
    !signedBlock
  );
};

/**
 * @hidden
 */
export const createMockBlockHash = (value?: string | BlockHash): MockCodec<BlockHash> => {
  if (isCodec<BlockHash>(value)) {
    return value as MockCodec<BlockHash>;
  }

  return createMockStringCodec(value) as MockCodec<BlockHash>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRuntimeDispatchInfo = (
  runtimeDispatchInfo?:
    | RuntimeDispatchInfo
    | {
        partialFee: Balance | Parameters<typeof createMockBalance>[0];
      }
): MockCodec<RuntimeDispatchInfo> => {
  const { partialFee } = runtimeDispatchInfo ?? {
    partialFee: createMockBalance(),
  };

  return createMockCodec(
    {
      partialFee: createMockBalance(partialFee),
    },
    !runtimeDispatchInfo
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProtocolOp = (
  protocolOp?:
    | 'AssetRegisterTicker'
    | 'AssetIssue'
    | 'AssetAddDocuments'
    | 'AssetCreateAsset'
    | 'CheckpointCreateSchedule'
    | 'ComplianceManagerAddComplianceRequirement'
    | 'IdentityCddRegisterDid'
    | 'IdentityAddClaim'
    | 'IdentityAddSecondaryKeysWithAuthorization'
    | 'PipsPropose'
    | 'ContractsPutCode'
    | 'CorporateBallotAttachBallot'
    | 'CapitalDistributionDistribute'
): MockCodec<MockCodec<PolymeshCommonUtilitiesProtocolFeeProtocolOp>> => {
  return createMockEnum<PolymeshCommonUtilitiesProtocolFeeProtocolOp>(protocolOp);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsOpType = (
  op?: PolymeshPrimitivesStatisticsStatOpType | StatType
): MockCodec<PolymeshPrimitivesStatisticsStatOpType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatOpType>(op)) {
    return op as MockCodec<PolymeshPrimitivesStatisticsStatOpType>;
  }

  return createMockCodec(
    {
      type: op,
      isCount: op === StatType.Count,
      isBalance: op === StatType.Balance,
    },
    !op
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsOpTypeToStatType = (
  op?: PolymeshPrimitivesStatisticsStatType | StatType
): MockCodec<PolymeshPrimitivesStatisticsStatType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatType>(op)) {
    return op as MockCodec<PolymeshPrimitivesStatisticsStatType>;
  }

  return createMockCodec(
    {
      op: {
        type: op,
        isCount: op === StatType.Count,
        isBalance: op === StatType.Balance,
      },
    },
    !op
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsStatType = (
  stat?:
    | PolymeshPrimitivesStatisticsStatType
    | {
        op: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer: Option<
          ITuple<[PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId]>
        >;
      }
): MockCodec<PolymeshPrimitivesStatisticsStatType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatType>(stat)) {
    return stat as MockCodec<PolymeshPrimitivesStatisticsStatType>;
  }

  const { op, claimIssuer } = stat ?? {
    op: createMockStatisticsOpType(),
    claimIssuer: createMockOption(),
  };

  return createMockCodec(
    {
      op,
      claimIssuer: createMockOption(claimIssuer),
    },
    !op
  );
};

/**
 * @hidden
 *
 */
export const createMock2ndKey = (
  key2?:
    | 'NoClaimStat'
    | { Claim: PolymeshPrimitivesStatisticsStatClaim }
    | PolymeshPrimitivesStatisticsStat2ndKey
): MockCodec<PolymeshPrimitivesStatisticsStat2ndKey> => {
  if (isCodec<PolymeshPrimitivesStatisticsStat2ndKey>(key2)) {
    return key2 as MockCodec<PolymeshPrimitivesStatisticsStat2ndKey>;
  }

  return createMockEnum<PolymeshPrimitivesStatisticsStat2ndKey>(key2);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatUpdate = (
  update?:
    | {
        key2: PolymeshPrimitivesStatisticsStat2ndKey | Parameters<typeof createMock2ndKey>[0];
        value: Option<u128>;
      }
    | PolymeshPrimitivesStatisticsStatUpdate
): MockCodec<PolymeshPrimitivesStatisticsStatUpdate> => {
  const { key2, value } = update ?? {
    key2: createMock2ndKey(),
    value: createMockOption(),
  };

  return createMockCodec(
    {
      key2: createMock2ndKey(key2),
      value: createMockOption(value),
    },
    !update
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInitiateCorporateActionArgs = (
  caArgs?:
    | PalletCorporateActionsInitiateCorporateActionArgs
    | {
        ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
        kind: PalletCorporateActionsCaKind | Parameters<typeof createMockCAKind>[0];
        declDate: u64 | Parameters<typeof createMockU64>[0];
        recordDate: Option<PalletCorporateActionsRecordDateSpec>;
        details: Bytes | Parameters<typeof createMockBytes>[0];
        targets: Option<PalletCorporateActionsTargetIdentities>;
        defaultWithholdingTax: Option<Permill>;
        withholdingTax:
          | [
              PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0],
              Permill | Parameters<typeof createMockPermill>[0]
            ][]
          | null;
      }
): MockCodec<PalletCorporateActionsInitiateCorporateActionArgs> => {
  const {
    ticker,
    kind,
    declDate,
    recordDate,
    details,
    targets,
    defaultWithholdingTax,
    withholdingTax,
  } = caArgs ?? {
    ticker: createMockTicker(),
    kind: createMockCAKind(),
    declDate: createMockU64(),
    recordDate: createMockOption(),
    details: createMockBytes(),
    targets: createMockOption(),
    defaultWithholdingTax: createMockOption(),
    withholdingTax: createMockOption(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      kind: createMockCAKind(kind),
      declDate: createMockU64(declDate),
      recordDate: createMockOption(recordDate),
      details: createMockBytes(details),
      targets: createMockOption(targets),
      defaultWithholdingTax: createMockOption(defaultWithholdingTax),
      withholdingTax,
    },
    !caArgs
  );
};

export const createMockStatisticsStatClaim = (
  statClaim:
    | PolymeshPrimitivesStatisticsStatClaim
    | { Accredited: bool }
    | { Affiliate: bool }
    | { Jurisdiction: Option<PolymeshPrimitivesJurisdictionCountryCode> }
): MockCodec<PolymeshPrimitivesStatisticsStatClaim> => {
  if (statClaim)
    if (isCodec<PolymeshPrimitivesStatisticsStatClaim>(statClaim)) {
      return statClaim as MockCodec<PolymeshPrimitivesStatisticsStatClaim>;
    }
  return createMockEnum<PolymeshPrimitivesStatisticsStatClaim>(statClaim);
};

/**
 * @hidden
 */
export const createMockAssetTransferCompliance = (
  transferCompliance?:
    | {
        paused: bool | Parameters<typeof createMockBool>[0];
        requirements:
          | BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
          | Parameters<typeof createMockBTreeSet>[0];
      }
    | PolymeshPrimitivesTransferComplianceAssetTransferCompliance
): MockCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance> => {
  if (isCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance>(transferCompliance)) {
    return transferCompliance as MockCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance>;
  }
  const { paused, requirements } = transferCompliance ?? {
    paused: dsMockUtils.createMockBool(false),
    requirements: dsMockUtils.createMockBTreeSet([]),
  };

  const args = { paused: createMockBool(paused), requirements: createMockBTreeSet(requirements) };

  return createMockCodec(args, !transferCompliance);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCall = (callArgs?: {
  args: unknown[];
  method: string;
  section: string;
}): MockCodec<Call> => {
  const { args, method, section } = callArgs ?? {
    args: [],
    method: '',
    section: '',
  };

  return createMockCodec(
    {
      args: createMockCodec(args, false),
      method,
      section,
    },
    !callArgs
  ) as MockCodec<Call>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalDetails = (proposalDetails?: {
  approvals: u64 | Parameters<typeof createMockU64>[0];
  rejections: u64 | Parameters<typeof createMockU64>[0];
  status: PalletMultisigProposalStatus | Parameters<typeof createMockProposalStatus>[0];
  autoClose: bool | Parameters<typeof createMockBool>[0];
  expiry: Option<Moment> | null;
}): PalletMultisigProposalDetails => {
  const { approvals, rejections, status, autoClose, expiry } = proposalDetails ?? {
    approvals: createMockU64(),
    rejections: createMockU64(),
    status: createMockProposalStatus(),
    autoClose: createMockBool(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      approvals,
      rejections,
      status,
      expiry,
      autoClose,
    },
    !proposalDetails
  ) as MockCodec<PalletMultisigProposalDetails>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetMetadataKey = (
  key: PolymeshPrimitivesAssetMetadataAssetMetadataKey | { Local: u64 } | { Global: u64 }
): MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataKey> => {
  if (isCodec<PolymeshPrimitivesAssetMetadataAssetMetadataKey>(key)) {
    return key as MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataKey>;
  }

  return createMockEnum<PolymeshPrimitivesAssetMetadataAssetMetadataKey>(key);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetMetadataSpec = (
  specs?:
    | PolymeshPrimitivesAssetMetadataAssetMetadataSpec
    | {
        url: Option<Bytes>;
        description: Option<Bytes>;
        typeDef: Option<Bytes>;
      }
): MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataSpec> => {
  if (isCodec<PolymeshPrimitivesAssetMetadataAssetMetadataSpec>(specs)) {
    return specs as MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataSpec>;
  }

  const { url, description, typeDef } = specs ?? {
    url: createMockOption(),
    description: createMockOption(),
    typeDef: createMockOption(),
  };

  return createMockCodec(
    {
      url,
      description,
      typeDef,
    },
    !specs
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetMetadataLockStatus = (
  args:
    | {
        lockStatus?: 'Locked' | 'Unlocked';
      }
    | {
        lockStatus: 'LockedUntil';
        lockedUntil: Date;
      }
): MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus> => {
  const { lockStatus } = args;

  let meshLockStatus;
  if (lockStatus === 'LockedUntil') {
    const { lockedUntil } = args;
    meshLockStatus = { LockedUntil: createMockU64(new BigNumber(lockedUntil.getTime())) };
  } else {
    meshLockStatus = lockStatus;
  }

  return createMockEnum<PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus>(meshLockStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetMetadataValueDetail = (
  valueDetail?:
    | PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
    | {
        lockStatus: PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus;
        expire: Option<u64>;
      }
): MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail> => {
  if (isCodec<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>(valueDetail)) {
    return valueDetail as MockCodec<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>;
  }

  const { lockStatus, expire } = valueDetail ?? {
    lockStatus: createMockAssetMetadataLockStatus({ lockStatus: 'Unlocked' }),
    expire: createMockOption(),
  };

  return createMockCodec(
    {
      lockStatus,
      expire,
    },
    false
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstructionMemo = (
  memo?: string | PalletSettlementInstructionMemo
): MockCodec<PalletSettlementInstructionMemo> => {
  if (isCodec<PalletSettlementInstructionMemo>(memo)) {
    return memo as MockCodec<PalletSettlementInstructionMemo>;
  }

  return createMockStringCodec<PalletSettlementInstructionMemo>(memo);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockContractInfo = (contractInfo?: {
  trieId: Bytes;
  codeHash: U8aFixed;
  storageDeposit: u128;
}): MockCodec<PalletContractsStorageContractInfo> => {
  const { trieId, codeHash, storageDeposit } = contractInfo ?? {
    trieId: createMockBytes(),
    codeHash: createMockHash(),
    storageDeposit: createMockU128(),
  };

  return createMockCodec(
    {
      trieId,
      codeHash,
      storageDeposit,
    },
    !contractInfo
  );
};
