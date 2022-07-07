/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise } from '@polkadot/api';
import { DecoratedRpc } from '@polkadot/api/types';
import {
  bool,
  Bytes,
  Compact,
  Enum,
  Option,
  Text,
  u8,
  U8aFixed,
  u32,
  u64,
  Vec,
} from '@polkadot/types';
import { CompactEncodable } from '@polkadot/types/codec/types';
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
  Moment,
  Permill,
  RefCount,
  RuntimeDispatchInfo,
  RuntimeVersion,
  Signature,
  SignedBlock,
} from '@polkadot/types/interfaces';
import {
  Codec,
  IEvent,
  ISubmittableResult,
  Registry,
  Signer as PolkadotSigner,
} from '@polkadot/types/types';
import { hexToU8a, stringToU8a } from '@polkadot/util';
import { SigningManager } from '@polymathnetwork/signing-manager-types';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { cloneDeep, map, merge, upperFirst } from 'lodash';
import {
  AffirmationStatus,
  AgentGroup,
  AGId,
  AssetComplianceResult,
  AssetIdentifier,
  AssetName,
  AssetOwnershipRelation,
  AssetPermissions,
  AssetType,
  Authorization,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  CACheckpoint,
  CAId,
  CAKind,
  CalendarPeriod,
  CalendarUnit,
  CanTransferResult,
  CddId,
  CddStatus,
  CheckpointId,
  CheckpointSchedule,
  Claim,
  Claim1stKey,
  ClaimType as MeshClaimType,
  ClassicTickerRegistration,
  ComplianceRequirement,
  ComplianceRequirementResult,
  Condition,
  ConditionResult,
  ConditionType,
  CorporateAction,
  CountryCode,
  CustomAssetTypeId,
  DidRecord,
  DispatchableName,
  DispatchableNames,
  Distribution,
  Document,
  DocumentHash,
  DocumentName,
  DocumentType,
  DocumentUri,
  EcdsaSignature,
  EthereumAddress,
  ExtrinsicPermissions,
  FundingRoundName,
  Fundraiser,
  FundraiserName,
  FundraiserStatus,
  FundraiserTier,
  GranularCanTransferResult,
  IdentityClaim,
  IdentityId,
  IdentityRole,
  Instruction,
  InstructionStatus,
  InvestorZKProofData,
  MovePortfolioItem,
  PalletName,
  PalletPermissions,
  Permissions,
  Pip,
  PipId,
  PipsMetadata,
  PortfolioId,
  PortfolioKind,
  PortfolioPermissions,
  PortfolioValidityResult,
  PosRatio,
  PriceTier,
  ProposalState,
  ProtocolOp,
  RecordDate,
  RecordDateSpec,
  RistrettoPoint,
  Scalar,
  ScheduleId,
  ScheduleSpec,
  Scope,
  ScopeClaimProof as MeshScopeClaimProof,
  ScopeClaimProof,
  ScopeId,
  SecondaryKey as MeshSecondaryKey,
  SecurityToken,
  SettlementType,
  Signatory,
  StoredSchedule,
  Subsidy as MeshSubsidy,
  TargetIdentities,
  TargetIdentity,
  TargetTreatment,
  Tax,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
  TransferManager,
  TransferManagerResult,
  TrustedFor,
  TrustedIssuer,
  TxTags,
  Venue,
  VenueDetails,
  VenueType,
  ZkProofData,
} from 'polymesh-types/types';
import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
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
  SubsidyWithAllowance,
} from '~/types';
import { Consts, Extrinsics, GraphqlQuery, PolymeshTx, Queries } from '~/types/internal';
import { ArgsType, Mutable, tuple } from '~/types/utils';

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
    disconnect: sinon.stub() as () => Promise<void>,
  } as Mutable<ApiPromise> & EventEmitter;
}

/**
 * Create a mock instance of the Apollo client
 */
function createApolloClient(): Mutable<ApolloClient<NormalizedCacheObject>> {
  return {
    stop: sinon.stub(),
  } as unknown as Mutable<ApolloClient<NormalizedCacheObject>>;
}

let apolloConstructorStub: SinonStub;

/**
 * Creates mock websocket class. Contains additional methods for tests to control it
 */
export class MockWebSocket {
  /**
   * @hidden
   */
  onopen(): void {
    // stub for onopen
  }

  /**
   * @hidden
   */
  onclose(): void {
    // stub for onclose
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * @hidden
   */
  onerror(_err: Error): void {
    // stub for onerror
  }

  /**
   * @hidden
   */
  onmessage(_msg: Record<string, unknown>): void {
    // stub for onmessage
  }

  /**
   * @hidden
   */
  close(): void {
    // stub for close
  }

  /**
   * @hidden
   */
  send(_msg: string): void {
    const response = { data: '{ "result": "4.1.1" }' };
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
  sendVersion(version: string): void {
    const response = { data: `{ "result": "${version}" }` };
    this.onmessage(response);
  }
}

/**
 * Create a mock instance of the WebSocket lib
 */
function createWebSocket(): MockWebSocket {
  return new MockWebSocket();
}

let webSocketConstructorStub: SinonStub;

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
    return apolloConstructorStub();
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
    return webSocketConstructorStub();
  }
};

let apiPromiseCreateStub: SinonStub;

const MockApiPromiseClass = class {
  /**
   * @hidden
   */
  public static create = apiPromiseCreateStub;
};

const MockWsProviderClass = class {};

let contextCreateStub: SinonStub;

const MockContextClass = class {
  /**
   * @hidden
   */
  public static create = contextCreateStub;
};

let errorStub: SinonStub;

type StatusCallback = (receipt: ISubmittableResult) => void;
type UnsubCallback = () => void;

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
  issuedClaims?: ResultSet<ClaimData>;
  getIdentity?: Identity;
  getIdentityClaimsFromChain?: ClaimData[];
  getIdentityClaimsFromMiddleware?: ResultSet<ClaimData>;
  getIdentityClaimsFromMiddlewareV2?: ResultSet<ClaimData>;
  getExternalSigner?: PolkadotSigner;
  primaryAccount?: string;
  secondaryAccounts?: PermissionedAccount[];
  transactionHistory?: ResultSet<ExtrinsicData>;
  latestBlock?: BigNumber;
  middlewareEnabled?: boolean;
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

export interface StubQuery {
  entries: SinonStub;
  entriesAt: SinonStub;
  entriesPaged: SinonStub;
  at: SinonStub;
  multi: SinonStub;
  size: SinonStub;
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
      ? { event: { data: [{ toString: (): string => '1' }, 'Some Error'] } }
      : undefined,
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

let rpcModule = {} as DecoratedRpc<any, any>;

let queryMultiStub = sinon.stub();

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
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  primaryAccount: 'primaryAccount',
  secondaryAccounts: [],
  transactionHistory: {
    data: [],
    next: null,
    count: new BigNumber(1),
  },
  latestBlock: new BigNumber(100),
  middlewareEnabled: true,
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
  const getSigningIdentity = sinon.stub();
  const identity = {
    did: opts.did,
    hasRoles: sinon.stub().resolves(opts.hasRoles),
    checkRoles: sinon.stub().resolves(opts.checkRoles),
    hasValidCdd: sinon.stub().resolves(opts.validCdd),
    getAssetBalance: sinon.stub().resolves(opts.assetBalance),
    getPrimaryAccount: sinon.stub().resolves({
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
    getSecondaryAccounts: sinon.stub().resolves(opts.secondaryAccounts),
    authorizations: {
      getSent: sinon.stub().resolves(opts.sentAuthorizations),
    },
    assetPermissions: {
      hasPermissions: sinon.stub().resolves(opts.hasAssetPermissions),
      checkPermissions: sinon.stub().resolves(opts.checkAssetPermissions),
    },
    areSecondaryAccountsFrozen: sinon.stub().resolves(opts.areSecondaryAccountsFrozen),
    isEqual: sinon.stub().returns(opts.signingIdentityIsEqual),
  };
  opts.withSigningManager
    ? getSigningIdentity.resolves(identity)
    : getSigningIdentity.throws(
        new Error('The signing Account does not have an associated Identity')
      );
  const getSigningAccount = sinon.stub();
  opts.withSigningManager
    ? getSigningAccount.returns({
        address: opts.signingAddress,
        getBalance: sinon.stub().resolves(opts.balance),
        getSubsidy: sinon.stub().resolves(opts.subsidy),
        getIdentity: sinon.stub().resolves(identity),
        getTransactionHistory: sinon.stub().resolves(opts.transactionHistory),
        hasPermissions: sinon.stub().resolves(opts.hasPermissions),
        checkPermissions: sinon.stub().resolves(opts.checkPermissions),
        isFrozen: sinon.stub().resolves(opts.isFrozen),
        isEqual: sinon.stub().returns(opts.signingAccountIsEqual),
      })
    : getSigningAccount.throws(new Error('There is no Account associated with the SDK'));
  const signingAddress = opts.withSigningManager ? opts.signingAddress : undefined;
  const getSigningAddress = sinon.stub();
  opts.withSigningManager
    ? getSigningAddress.returns(signingAddress)
    : getSigningAddress.throws(
        new Error('There is no Account associated with the current SDK instance')
      );

  const contextInstance = {
    signingAddress,
    getSigningIdentity,
    getSigningAccount,
    getSigningAddress,
    accountBalance: sinon.stub().resolves(opts.balance),
    accountSubsidy: sinon.stub().resolves(opts.subsidy),
    getSigningAccounts: sinon.stub().resolves(opts.getSigningAccounts),
    setSigningAddress: sinon.stub().callsFake(address => {
      (contextInstance as any).signingAddress = address;
    }),
    setSigningManager: sinon.stub(),
    getExternalSigner: sinon.stub().returns(opts.getExternalSigner),
    polymeshApi: mockInstanceContainer.apiInstance,
    middlewareApi: mockInstanceContainer.apolloInstance,
    middlewareApiV2: mockInstanceContainer.apolloInstanceV2,
    queryMiddleware: sinon
      .stub()
      .callsFake(query => mockInstanceContainer.apolloInstance.query(query)),
    queryMiddlewareV2: sinon
      .stub()
      .callsFake(query => mockInstanceContainer.apolloInstanceV2.query(query)),
    getInvalidDids: sinon.stub().resolves(opts.invalidDids),
    getProtocolFees: sinon.stub().resolves(opts.transactionFees),
    getTransactionArguments: sinon.stub().returns([]),
    getSecondaryAccounts: sinon.stub().returns(opts.secondaryAccounts),
    issuedClaims: sinon.stub().resolves(opts.issuedClaims),
    getIdentity: sinon.stub().resolves(opts.getIdentity),
    getIdentityClaimsFromChain: sinon.stub().resolves(opts.getIdentityClaimsFromChain),
    getIdentityClaimsFromMiddleware: sinon.stub().resolves(opts.getIdentityClaimsFromMiddleware),
    getIdentityClaimsFromMiddlewareV2: sinon
      .stub()
      .resolves(opts.getIdentityClaimsFromMiddlewareV2),
    getLatestBlock: sinon.stub().resolves(opts.latestBlock),
    isMiddlewareEnabled: sinon.stub().returns(opts.middlewareEnabled),
    isMiddlewareAvailable: sinon.stub().resolves(opts.middlewareAvailable),
    isMiddlewareV2Available: sinon.stub().resolves(opts.middlewareV2Available),
    isArchiveNode: opts.isArchiveNode,
    ss58Format: opts.ss58Format,
    disconnect: sinon.stub(),
    getDividendDistributionsForAssets: sinon
      .stub()
      .resolves(opts.getDividendDistributionsForAssets),
    getNetworkVersion: sinon.stub().resolves(opts.networkVersion),
    supportsSubsidy: sinon.stub().returns(opts.supportsSubsidy),
    createType: sinon.stub(),
  } as unknown as MockContext;

  contextInstance.clone = sinon.stub<[], Context>().returns(contextInstance);

  Object.assign(mockInstanceContainer.contextInstance, contextInstance);

  MockContextClass.create = contextCreateStub.resolves(contextInstance);
}

/**
 * @hidden
 */
function initContext(opts?: ContextOptions): void {
  contextCreateStub = sinon.stub();

  contextOptions = { ...defaultContextOptions, ...opts };

  configureContext(contextOptions);
}

/**
 * @hidden
 */
function updateQuery(mod?: Queries): void {
  const updateTo = mod || queryModule;

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
  const updateTo = mod || txModule;

  txModule = updateTo;

  mockInstanceContainer.apiInstance.tx = txModule;
}

/**
 * @hidden
 */
function updateRpc(mod?: any): void {
  const updateTo = mod || rpcModule;

  rpcModule = updateTo;

  mockInstanceContainer.apiInstance.rpc = rpcModule;
}

/**
 * @hidden
 */
function updateConsts(mod?: Consts): void {
  const updateTo = mod || constsModule;

  constsModule = updateTo;

  mockInstanceContainer.apiInstance.consts = constsModule;
}

/**
 * @hidden
 */
function updateQueryMulti(stub?: SinonStub): void {
  const updateTo = stub || queryMultiStub;

  queryMultiStub = updateTo;

  mockInstanceContainer.apiInstance.queryMulti = queryMultiStub;
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
  const stub = sinon.stub();

  updateQueryMulti(stub);
}

/**
 * @hidden
 */
function initApi(): void {
  mockInstanceContainer.apiInstance.registry = 'registry' as unknown as Registry;
  mockInstanceContainer.apiInstance.createType = sinon.stub();
  mockInstanceContainer.apiInstance.runtimeVersion = {} as RuntimeVersion;

  initTx();
  initQuery();
  initRpc();
  initConsts();
  initQueryMulti();

  apiPromiseCreateStub = sinon.stub();
  MockApiPromiseClass.create = apiPromiseCreateStub.resolves(mockInstanceContainer.apiInstance);
}

/**
 * Create a mock instance of a Signing Manager
 */
function configureSigningManager(opts: SigningManagerOptions): void {
  const signingManagerInstance = {
    getAccounts: sinon.stub().resolves(opts.getAccounts),
    getExternalSigner: sinon.stub().returns(opts.getExternalSigner),
    setSs58Format: sinon.stub(),
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
  apolloConstructorStub = sinon.stub().returns(mockInstanceContainer.apolloInstance);

  webSocketConstructorStub = sinon.stub().returns(mockInstanceContainer.webSocketInstance);

  txMocksData.clear();
  errorStub = sinon.stub().throws(new Error('Error'));
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

  initMocks({ contextOptions });
}

/**
 * @hidden
 * Create and returns a mocked transaction. Each call will create a new version of the stub
 *
 * @param mod - name of the module
 * @param tx - name of the transaction function
 * @param autoResolve - if set to a status, the transaction will resolve immediately with that status.
 *  If set to false, the transaction lifecycle will be controlled by {@link updateTxStatus}
 */
export function createTxStub<
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
): PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>> & SinonStub {
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

  const transaction = sinon.stub().returns({
    method: tx, // should be a `Call` object, but this is enough for testing
    hash: tx,
    signAndSend: sinon.stub().callsFake((_, __, cb: StatusCallback) => {
      if (autoResolve === MockTxStatus.Rejected) {
        return Promise.reject(new Error('Cancelled'));
      }

      const unsubCallback = sinon.stub();

      txMocksData.set(runtimeModule[tx], {
        statusCallback: cb,
        unsubCallback,
        resolved: !!autoResolve,
        status: null as unknown as MockTxStatus,
      });

      if (autoResolve) {
        process.nextTick(() => cb(statusToReceipt(autoResolve)));
      }

      return Promise.resolve(unsubCallback);
    }),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paymentInfo: sinon.stub().resolves({ partialFee: gas }),
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
    SinonStub;
}

/**
 * @hidden
 * Create and return an apollo query stub
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloQueryStub(query: GraphqlQuery<any>, returnData: unknown): SinonStub {
  const instance = mockInstanceContainer.apolloInstance;
  const stub = sinon.stub();

  stub.withArgs(query).resolves({
    data: returnData,
  });

  instance.query = stub;

  return stub;
}

/**
 * @hidden
 * Create and return an apollo query stub
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloV2QueryStub(query: GraphqlQuery<any>, returnData: unknown): SinonStub {
  const instance = mockInstanceContainer.apolloInstanceV2;
  const stub = sinon.stub();

  stub.withArgs(query).resolves({
    data: returnData,
  });

  instance.query = stub;

  return stub;
}

/**
 *
 * @hidden
 */
function mockQueries(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): sinon.SinonStub {
  const stub = sinon.stub();

  queries.forEach(q => {
    stub.withArgs(q.query).resolves({
      data: q.returnData,
    });
  });
  return stub;
}

/**
 * @hidden
 * Create and return an apollo stub for multiple queries
 *
 * @param queries - query and returnData for each stubbed query
 */
export function createApolloMultipleQueriesStub(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): SinonStub {
  const instance = mockInstanceContainer.apolloInstance;
  const stub = mockQueries(queries);

  instance.query = stub;

  return stub;
}

/**
 * @hidden
 * Create and return an apollo stub for multiple V2 queries
 *
 * @param queries - query and returnData for each stubbed query
 */
export function createApolloMultipleV2QueriesStub(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): SinonStub {
  const instance = mockInstanceContainer.apolloInstanceV2;
  const stub = mockQueries(queries);

  instance.query = stub;

  return stub;
}

/**
 * @hidden
 * Create and return a query stub
 *
 * @param mod - name of the module
 * @param query - name of the query function
 */
export function createQueryStub<
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
): Queries[ModuleName][QueryName] & SinonStub & StubQuery {
  let runtimeModule = queryModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Queries[ModuleName];
    queryModule[mod] = runtimeModule;
  }

  type QueryStub = Queries[ModuleName][QueryName] & SinonStub & StubQuery;

  let stub: QueryStub;

  if (!runtimeModule[query]) {
    stub = sinon.stub() as unknown as QueryStub;
    stub.entries = sinon.stub();
    stub.entriesAt = sinon.stub();
    stub.entriesPaged = sinon.stub();
    stub.at = sinon.stub();
    stub.multi = sinon.stub();
    stub.size = sinon.stub();
    runtimeModule[query] = stub;

    updateQuery();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    stub = instance.query[mod][query] as QueryStub;
  }

  const entries = opts?.entries ?? [];

  const entryResults = entries.map(([keys, value], index) => [
    { args: keys, toHex: (): string => `key${index}` },
    value,
  ]);
  stub.entries.resolves(entryResults);
  stub.entriesPaged.resolves(entryResults);
  stub.entriesAt.resolves(entryResults);

  if (opts?.multi) {
    stub.multi.resolves(opts.multi);
  }
  if (typeof opts?.size !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    stub.size.resolves(createMockU64(new BigNumber(opts.size)));
  }
  if (opts?.returnValue) {
    stub.resolves(opts.returnValue);
    stub.at.resolves(opts.returnValue);
  }

  return stub;
}

let count = 0;

/**
 * @hidden
 * Create and return a rpc stub
 *
 * @param mod - name of the module
 * @param rpc - name of the rpc function
 */
export function createRpcStub(
  mod: string,
  rpc: string,
  opts?: {
    returnValue?: unknown;
  }
): SinonStub {
  const runtimeModule = {} as any;
  rpcModule[mod] = runtimeModule;

  const stub: SinonStub = sinon.stub();
  runtimeModule[rpc] = stub;

  updateRpc();

  if (opts?.returnValue) {
    stub.resolves(opts.returnValue);
  }

  (stub as any).count = count++;

  return stub;
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
export function getQueryMultiStub(): SinonStub {
  return queryMultiStub;
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
    (txMockData.unsubCallback as sinon.SinonStub).throws('Unsub error');
  }

  txMockData.statusCallback(statusToReceipt(status, failReason));
}

/**
 * @hidden
 * Make calls to `Middleware.query` throw an error
 */
export function throwOnMiddlewareQuery(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstance;

  if (err) {
    errorStub.throws(err);
  }

  instance.query = errorStub;
}

/**
 * @hidden
 * Make calls to `MiddlewareV2.query` throw an error
 */
export function throwOnMiddlewareV2Query(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstanceV2;

  if (err) {
    errorStub.throws(err);
  }

  instance.query = errorStub;
}

/**
 * @hidden
 * Make calls to `Context.create` throw an error
 */
export function throwOnContextCreation(): void {
  MockContextClass.create = errorStub;
}

/**
 * @hidden
 * Make calls to `ApiPromise.create` throw an error
 */
export function throwOnApiCreation(error?: unknown): void {
  MockApiPromiseClass.create = error ? sinon.stub().throws(error) : errorStub;
}

/**
 * @hidden
 * Sets the `accountBalance` function in the mocked Context to return the specified amount
 *
 * @param balance - new account balance
 */
export function setContextAccountBalance(balance: AccountBalance): void {
  mockInstanceContainer.contextInstance.accountBalance.returns(balance);
}

/**
 * @hidden
 * Retrieve an instance of the mocked Polkadot API
 */
export function getApiInstance(): ApiPromise & SinonStubbedInstance<ApiPromise> & EventEmitter {
  return mockInstanceContainer.apiInstance as unknown as ApiPromise &
    SinonStubbedInstance<ApiPromise> &
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
  SinonStubbedInstance<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstance as ApolloClient<NormalizedCacheObject> &
    SinonStubbedInstance<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve an instance of the mocked v2 Apollo Client
 */
export function getMiddlewareApiV2(): ApolloClient<NormalizedCacheObject> &
  SinonStubbedInstance<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstanceV2 as ApolloClient<NormalizedCacheObject> &
    SinonStubbedInstance<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve the stub of the createType method
 */
export function getCreateTypeStub(): SinonStub {
  return mockInstanceContainer.apiInstance.createType as SinonStub;
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
 * Retrieve the stub of the `Context.create` method
 */
export function getContextCreateStub(): SinonStub {
  return contextCreateStub;
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

export type MockCodec<C extends Codec> = C & { eq: sinon.SinonStub };

/**
 * @hidden
 */
const createMockCodec = (codec: unknown, isEmpty: boolean): MockCodec<Codec> => {
  const clone = cloneDeep(codec) as MockCodec<Mutable<Codec>>;
  (clone as any)._isCodec = true;
  clone.isEmpty = isEmpty;
  clone.eq = sinon.stub();
  return clone as MockCodec<Codec>;
};

/**
 * @hidden
 */
const createMockStringCodec = (value?: string): MockCodec<Codec> =>
  createMockCodec(
    {
      toString: () => value,
    },
    value === undefined
  );

/**
 * @hidden
 */
const createMockU8aCodec = (value?: string, hex?: boolean): MockCodec<Codec> =>
  createMockCodec(hex ? hexToU8a(value) : stringToU8a(value), value === undefined);

/**
 * @hidden
 */
const createMockNumberCodec = (value?: BigNumber): MockCodec<Codec> =>
  createMockCodec(
    {
      toNumber: () => value?.toNumber(),
      toString: () => value?.toString(),
      isZero: () => value?.isZero(),
    },
    value === undefined
  );

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityId = (did?: string | IdentityId): MockCodec<IdentityId> => {
  if (isCodec<IdentityId>(did)) {
    return did as MockCodec<IdentityId>;
  }

  return createMockStringCodec(did) as MockCodec<IdentityId>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockEnum = (enumValue?: string | Record<string, Codec | Codec[]>): MockCodec<Enum> => {
  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    codec[`is${upperFirst(enumValue)}`] = true;
  } else if (typeof enumValue === 'object') {
    const key = Object.keys(enumValue)[0];

    codec[`is${upperFirst(key)}`] = true;
    codec[`as${upperFirst(key)}`] = enumValue[key];
  }

  return createMockCodec(codec, !enumValue) as MockCodec<Enum>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAgentGroup = (
  agentGroup?: 'Full' | 'ExceptMeta' | 'PolymeshV1Caa' | 'PolymeshV1Pia' | { Custom: AGId }
): MockCodec<AgentGroup> => {
  return createMockEnum(agentGroup) as MockCodec<AgentGroup>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEcdsaSignature = (
  signature?: string | EcdsaSignature
): MockCodec<EcdsaSignature> => {
  if (isCodec<EcdsaSignature>(signature)) {
    return signature as MockCodec<EcdsaSignature>;
  }

  return createMockStringCodec(signature) as MockCodec<EcdsaSignature>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEthereumAddress = (
  address?: string | EthereumAddress
): MockCodec<EthereumAddress> => {
  if (isCodec<EthereumAddress>(address)) {
    return address as MockCodec<EthereumAddress>;
  }

  return createMockU8aCodec(address) as MockCodec<EthereumAddress>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTicker = (ticker?: string | Ticker): MockCodec<Ticker> => {
  if (isCodec<Ticker>(ticker)) {
    return ticker as MockCodec<Ticker>;
  }

  return createMockU8aCodec(ticker) as MockCodec<Ticker>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountId = (accountId?: string): MockCodec<AccountId> =>
  createMockStringCodec(accountId) as MockCodec<AccountId>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBalance = (balance?: BigNumber | Balance): MockCodec<Balance> => {
  if (isCodec<Balance>(balance)) {
    return balance as MockCodec<Balance>;
  }

  return createMockNumberCodec(balance) as MockCodec<Balance>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentName = (name?: string): MockCodec<DocumentName> =>
  createMockStringCodec(name) as MockCodec<DocumentName>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentUri = (uri?: string): MockCodec<DocumentUri> =>
  createMockStringCodec(uri) as MockCodec<DocumentUri>;

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
    | DocumentHash
): MockCodec<DocumentHash> => {
  if (isCodec<DocumentHash>(hash)) {
    return hash as MockCodec<DocumentHash>;
  }
  return createMockEnum(hash) as MockCodec<DocumentHash>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentType = (name?: string): MockCodec<DocumentType> =>
  createMockStringCodec(name) as MockCodec<DocumentType>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockOption = <T extends Codec>(
  wrapped: T | null | Option<T> = null
): Option<T> => {
  if (isOption<T>(wrapped)) {
    return wrapped;
  }

  return createMockCodec(
    {
      unwrap: () => wrapped as T,
      unwrapOr: (val: unknown) => wrapped ?? val,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  ) as MockCodec<Option<T>>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCompact = <T extends CompactEncodable>(
  wrapped: T | null = null
): MockCodec<Compact<T>> =>
  createMockCodec(
    {
      unwrap: () => wrapped as T,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  ) as MockCodec<Compact<T>>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMoment = (millis?: BigNumber | Moment): MockCodec<Moment> => {
  if (isCodec<Moment>(millis)) {
    return millis as MockCodec<Moment>;
  }

  return createMockNumberCodec(millis) as MockCodec<Moment>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistration = (
  registration?:
    | TickerRegistration
    | {
        owner: IdentityId | Parameters<typeof createMockIdentityId>[0];
        expiry: Option<Moment> | Parameters<typeof createMockOption>[0];
      }
): MockCodec<TickerRegistration> => {
  const { owner, expiry } = registration || {
    owner: createMockIdentityId(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      owner: createMockIdentityId(owner),
      expiry: createMockOption(expiry),
    },
    !registration
  ) as MockCodec<TickerRegistration>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8 = (value?: BigNumber): u8 =>
  createMockNumberCodec(value) as MockCodec<u8>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU32 = (value?: BigNumber | u32): MockCodec<u32> => {
  if (isCodec<u32>(value)) {
    return value as MockCodec<u32>;
  }
  return createMockNumberCodec(value) as MockCodec<u32>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU64 = (value?: BigNumber | u64): MockCodec<u64> => {
  if (isCodec<u64>(value)) {
    return value as MockCodec<u64>;
  }
  return createMockNumberCodec(value) as MockCodec<u64>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermill = (value?: BigNumber | Permill): MockCodec<Permill> => {
  if (isCodec<Permill>(value)) {
    return value as MockCodec<Permill>;
  }
  return createMockNumberCodec(value) as MockCodec<Permill>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBytes = (value?: string): Bytes =>
  createMockU8aCodec(value) as MockCodec<Bytes>;

/**
 * @hidden
 */
export const createMockHash = (value?: string | Hash): MockCodec<Hash> => {
  if (isCodec<Hash>(value)) {
    return value as MockCodec<Hash>;
  }

  return createMockStringCodec(value) as MockCodec<Hash>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetName = (name?: string): MockCodec<AssetName> =>
  createMockStringCodec(name) as MockCodec<AssetName>;

/**
 * @hidden
 */
export const createMockPosRatio = (
  numerator: BigNumber,
  denominator: BigNumber
): MockCodec<PosRatio> =>
  [createMockU32(numerator) as u32, createMockU32(denominator) as u32] as MockCodec<PosRatio>;

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
  ) as MockCodec<bool>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioKind = (
  portfolioKind?: 'Default' | { User: u64 } | PortfolioKind
): MockCodec<PortfolioKind> => {
  if (isCodec<PortfolioKind>(portfolioKind)) {
    return portfolioKind as MockCodec<PortfolioKind>;
  }
  return createMockEnum(portfolioKind) as MockCodec<PortfolioKind>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioId = (
  portfolioId?:
    | PortfolioId
    | {
        did: IdentityId | Parameters<typeof createMockIdentityId>[0];
        kind: PortfolioKind | Parameters<typeof createMockPortfolioKind>[0];
      }
): MockCodec<PortfolioId> => {
  const { did, kind } = portfolioId || {
    did: createMockIdentityId(),
    kind: createMockPortfolioKind(),
  };
  return createMockCodec(
    {
      did: createMockIdentityId(did),
      kind: createMockPortfolioKind(kind),
    },
    !portfolioId
  ) as MockCodec<PortfolioId>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMovePortfolioItem = (movePortfolioItem?: {
  ticker: Ticker;
  amount: Balance;
}): MockCodec<MovePortfolioItem> => {
  const item = movePortfolioItem || {
    ticker: createMockTicker(),
    amount: createMockBalance(),
  };
  return createMockCodec(
    {
      ...item,
    },
    !movePortfolioItem
  ) as MockCodec<MovePortfolioItem>;
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
    | { Custom: CustomAssetTypeId }
): MockCodec<AssetType> => {
  return createMockEnum(assetType) as MockCodec<AssetType>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistrationConfig = (regConfig?: {
  max_ticker_length: u8;
  registration_length: Option<Moment>;
}): MockCodec<TickerRegistrationConfig> => {
  const config = regConfig || {
    max_ticker_length: createMockU8(),
    registration_length: createMockOption(),
  };
  return createMockCodec({ ...config }, !regConfig) as MockCodec<TickerRegistrationConfig>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecurityToken = (token?: {
  total_supply: Balance;
  owner_did: IdentityId;
  divisible: bool;
  asset_type: AssetType;
}): MockCodec<SecurityToken> => {
  const st = token || {
    total_supply: createMockBalance(),
    owner_did: createMockIdentityId(),
    divisible: createMockBool(),
    asset_type: createMockAssetType(),
  };
  return createMockCodec({ ...st }, !token) as MockCodec<SecurityToken>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocument = (document?: {
  uri: DocumentUri;
  content_hash: DocumentHash;
  name: DocumentName;
  doc_type: Option<DocumentType>;
  filing_date: Option<Moment>;
}): MockCodec<Document> => {
  const doc = document || {
    uri: createMockDocumentUri(),
    content_hash: createMockDocumentHash(),
    name: createMockDocumentName(),
    doc_type: createMockOption(),
    filing_date: createMockOption(),
  };
  return createMockCodec(
    {
      ...doc,
    },
    !document
  ) as MockCodec<Document>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletName = (name?: string | PalletName): MockCodec<PalletName> => {
  if (isCodec<PalletName>(name)) {
    return name as MockCodec<PalletName>;
  }

  return createMockStringCodec(name) as MockCodec<PalletName>;
};

/**
 * @hidden
 */
export const createMockDispatchableNames = (
  dispatchableNames?:
    | 'Whole'
    | { These: DispatchableName[] }
    | { Except: DispatchableName[] }
    | DispatchableNames
): MockCodec<DispatchableNames> => {
  if (isCodec<DispatchableNames>(dispatchableNames)) {
    return dispatchableNames as MockCodec<DispatchableNames>;
  }

  return createMockEnum(dispatchableNames) as MockCodec<DispatchableNames>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletPermissions = (permissions?: {
  pallet_name: PalletName | Parameters<typeof createMockPalletName>[0];
  dispatchable_names: DispatchableNames | Parameters<typeof createMockDispatchableNames>[0];
}): MockCodec<PalletPermissions> => {
  const { pallet_name, dispatchable_names } = permissions || {
    pallet_name: createMockPalletName(),
    dispatchable_names: createMockDispatchableNames(),
  };

  return createMockCodec(
    {
      pallet_name: createMockPalletName(pallet_name),
      dispatchable_names: createMockDispatchableNames(dispatchable_names),
    },
    !permissions
  ) as MockCodec<PalletPermissions>;
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
  const { free, reserved, miscFrozen, feeFrozen } = accountData || {
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
  ) as MockCodec<AccountData>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIndex = (value?: BigNumber): Index =>
  createMockNumberCodec(value) as MockCodec<Index>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRefCount = (value?: BigNumber): RefCount =>
  createMockNumberCodec(value) as MockCodec<RefCount>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountInfo = (accountInfo?: {
  nonce: Index;
  refcount: RefCount;
  data: AccountData;
}): MockCodec<AccountInfo> => {
  const info = accountInfo || {
    nonce: createMockIndex(),
    refcount: createMockRefCount(),
    data: createMockAccountData(),
  };

  return createMockCodec(
    {
      ...info,
    },
    !accountInfo
  ) as MockCodec<AccountInfo>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSubsidy = (subsidy?: {
  paying_key: AccountId;
  remaining: Balance;
}): MockCodec<MeshSubsidy> => {
  const sub = subsidy || {
    paying_key: createMockAccountId(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...sub,
    },
    !subsidy
  ) as MockCodec<MeshSubsidy>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatory = (
  signatory?: { Identity: IdentityId } | { Account: AccountId }
): MockCodec<Signatory> => {
  return createMockEnum(signatory) as MockCodec<Signatory>;
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
  return createMockEnum(authorizationType) as MockCodec<MeshAuthorizationType>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8aFixed = (value?: string, hex?: boolean): MockCodec<U8aFixed> =>
  createMockU8aCodec(value, hex) as MockCodec<U8aFixed>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetIdentifier = (
  identifier?: { Isin: U8aFixed } | { Cusip: U8aFixed } | { Cins: U8aFixed } | { Lei: U8aFixed }
): MockCodec<AssetIdentifier> => createMockEnum(identifier) as MockCodec<AssetIdentifier>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundingRoundName = (roundName?: string): MockCodec<FundingRoundName> =>
  createMockStringCodec(roundName) as MockCodec<FundingRoundName>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDispatchableName = (
  name?: string | DispatchableName
): MockCodec<DispatchableName> => {
  if (isCodec<DispatchableName>(name)) {
    return name as MockCodec<DispatchableName>;
  }

  return createMockStringCodec(name) as MockCodec<DispatchableName>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserName = (name?: string): MockCodec<FundraiserName> =>
  createMockStringCodec(name) as MockCodec<FundraiserName>;

/**
 * @hidden
 */
export const createMockAssetPermissions = (
  assetPermissions?: 'Whole' | { These: Ticker[] } | { Except: Ticker[] }
): MockCodec<AssetPermissions> => {
  return createMockEnum(assetPermissions) as MockCodec<AssetPermissions>;
};

/**
 * @hidden
 */
export const createMockExtrinsicPermissions = (
  assetPermissions?: 'Whole' | { These: PalletPermissions[] } | { Except: PalletPermissions[] }
): MockCodec<ExtrinsicPermissions> => {
  return createMockEnum(assetPermissions) as MockCodec<ExtrinsicPermissions>;
};

/**
 * @hidden
 */
export const createMockPortfolioPermissions = (
  assetPermissions?: 'Whole' | { These: PortfolioId[] } | { Except: PortfolioId[] }
): MockCodec<PortfolioPermissions> => {
  return createMockEnum(assetPermissions) as MockCodec<PortfolioPermissions>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermissions = (permissions?: {
  asset: AssetPermissions;
  extrinsic: ExtrinsicPermissions;
  portfolio: PortfolioPermissions;
}): MockCodec<Permissions> => {
  const perms = permissions || {
    asset: createMockAssetPermissions(),
    extrinsic: createMockExtrinsicPermissions(),
    portfolio: createMockPortfolioPermissions(),
  };

  return createMockCodec(
    {
      ...perms,
    },
    !permissions
  ) as MockCodec<Permissions>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationData = (
  authorizationData?:
    | { AttestPrimaryKeyRotation: IdentityId }
    | 'RotatePrimaryKey'
    | { RotatePrimaryKeyToSecondary: Permissions }
    | { TransferTicker: Ticker }
    | { AddMultiSigSigner: AccountId }
    | { TransferAssetOwnership: Ticker }
    | { JoinIdentity: Permissions }
    | { PortfolioCustody: PortfolioId }
    | { AddRelayerPayingKey: [AccountId, AccountId, Balance] }
    | { BecomeAgent: [Ticker, AgentGroup] }
    | AuthorizationData
): MockCodec<AuthorizationData> => {
  if (isCodec<AuthorizationData>(authorizationData)) {
    return authorizationData as MockCodec<AuthorizationData>;
  }

  return createMockEnum(authorizationData) as MockCodec<AuthorizationData>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorization = (authorization?: {
  authorization_data: AuthorizationData | Parameters<typeof createMockAuthorizationData>[0];
  authorized_by: IdentityId | Parameters<typeof createMockIdentityId>[0];
  expiry: Option<Moment>;
  auth_id: u64 | Parameters<typeof createMockU64>[0];
}): MockCodec<Authorization> => {
  const { authorization_data, authorized_by, expiry, auth_id } = authorization || {
    authorization_data: createMockAuthorizationData(),
    authorized_by: createMockIdentityId(),
    expiry: createMockOption(),
    auth_id: createMockU64(),
  };

  return createMockCodec(
    {
      authorization_data: createMockAuthorizationData(authorization_data),
      authorized_by: createMockIdentityId(authorized_by),
      expiry: createMockOption(expiry),
      auth_id: createMockU64(auth_id),
    },
    !authorization
  ) as MockCodec<Authorization>;
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
 */
export const createMockCddStatus = (
  cddStatus?: { Ok: IdentityId } | { Err: Bytes }
): MockCodec<CddStatus> => createMockEnum(cddStatus) as MockCodec<CddStatus>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCountryCode = (name?: CountryCodeEnum): MockCodec<CountryCode> =>
  createMockEnum(name) as MockCodec<CountryCode>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScope = (
  scope?: { Identity: IdentityId } | { Ticker: Ticker } | { Custom: Bytes }
): MockCodec<Scope> => createMockEnum(scope) as MockCodec<Scope>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddId = (cddId?: string): MockCodec<CddId> =>
  createMockStringCodec(cddId) as MockCodec<CddId>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeId = (scopeId?: string): ScopeId =>
  createMockStringCodec(scopeId) as MockCodec<ScopeId>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInvestorZKProofData = (proof?: string): InvestorZKProofData =>
  createMockStringCodec(proof) as MockCodec<InvestorZKProofData>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim = (
  claim?:
    | { Accredited: Scope }
    | { Affiliate: Scope }
    | { BuyLockup: Scope }
    | { SellLockup: Scope }
    | { CustomerDueDiligence: CddId }
    | { KnowYourCustomer: Scope }
    | { Jurisdiction: [CountryCode, Scope] }
    | { Exempted: Scope }
    | { Blocked: Scope }
    | { InvestorUniqueness: [Scope, ScopeId, CddId] }
    | { InvestorUniquenessV2: CddId }
    | 'NoData'
): Claim => createMockEnum(claim) as MockCodec<Claim>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityClaim = (identityClaim?: {
  claim_issuer: IdentityId;
  issuance_date: Moment;
  last_update_date: Moment;
  expiry: Option<Moment>;
  claim: Claim;
}): MockCodec<IdentityClaim> => {
  const identityClaimMock = identityClaim || {
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
  ) as MockCodec<IdentityClaim>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentity = (
  targetIdentity?: { Specific: IdentityId } | 'ExternalAgent'
): TargetIdentity => createMockEnum(targetIdentity) as MockCodec<TargetIdentity>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionType = (
  conditionType?:
    | { IsPresent: Claim }
    | { IsAbsent: Claim }
    | { IsAnyOf: Claim[] }
    | { IsNoneOf: Claim[] }
    | { IsIdentity: TargetIdentity }
    | ConditionType
): MockCodec<ConditionType> => {
  if (isCodec<ConditionType>(conditionType)) {
    return conditionType as MockCodec<ConditionType>;
  }

  return createMockEnum(conditionType) as MockCodec<ConditionType>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaimType = (claimType?: ClaimType): MeshClaimType =>
  createMockEnum(claimType) as MockCodec<MeshClaimType>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim1stKey = (claim1stKey?: {
  target: IdentityId;
  claim_type: MeshClaimType;
}): MockCodec<Claim1stKey> => {
  const claimTypeMock = claim1stKey || {
    target: createMockIdentityId(),
    claim_type: createMockClaimType(),
  };
  return createMockCodec(
    {
      ...claimTypeMock,
    },
    !claimTypeMock
  ) as MockCodec<Claim1stKey>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedFor = (
  trustedFor?: 'Any' | { Specific: MeshClaimType[] }
): MockCodec<TrustedFor> => createMockEnum(trustedFor) as MockCodec<TrustedFor>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedIssuer = (issuer?: {
  issuer: IdentityId;
  trusted_for: TrustedFor;
}): MockCodec<TrustedIssuer> => {
  const trustedIssuer = issuer || {
    issuer: createMockIdentityId(),
    trusted_for: createMockTrustedFor(),
  };

  return createMockCodec(
    {
      ...trustedIssuer,
    },
    !issuer
  ) as MockCodec<TrustedIssuer>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCondition = (condition?: {
  condition_type: ConditionType | Parameters<typeof createMockConditionType>[0];
  issuers: (TrustedIssuer | Parameters<typeof createMockTrustedIssuer>[0])[];
}): MockCodec<Condition> => {
  const { condition_type, issuers } = condition || {
    condition_type: createMockConditionType(),
    issuers: [],
  };
  return createMockCodec(
    {
      condition_type: createMockConditionType(condition_type),
      issuers: issuers.map(issuer => createMockTrustedIssuer(issuer)),
    },
    !condition
  ) as MockCodec<Condition>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionResult = (conditionResult?: {
  condition: Condition | Parameters<typeof createMockCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<ConditionResult> => {
  const { condition, result } = conditionResult || {
    condition: createMockCondition(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      condition: createMockCondition(condition),
      result: createMockBool(result),
    },
    !conditionResult
  ) as MockCodec<ConditionResult>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirement = (complianceRequirement?: {
  sender_conditions: Condition[];
  receiver_conditions: Condition[];
  id: u32;
}): MockCodec<ComplianceRequirement> => {
  const requirement = complianceRequirement || {
    sender_conditions: [],
    receiver_conditions: [],
    id: createMockU32(),
  };

  return createMockCodec(
    {
      ...requirement,
    },
    !complianceRequirement
  ) as MockCodec<ComplianceRequirement>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirementResult = (complianceRequirementResult?: {
  sender_conditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  receiver_conditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  id: u32 | Parameters<typeof createMockU32>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<ComplianceRequirementResult> => {
  const { sender_conditions, receiver_conditions, id, result } = complianceRequirementResult || {
    sender_conditions: [],
    receiver_conditions: [],
    id: createMockU32(),
    result: createMockBool(),
  };

  return createMockCodec(
    {
      sender_conditions: sender_conditions.map(condition => createMockConditionResult(condition)),
      receiver_conditions: receiver_conditions.map(condition =>
        createMockConditionResult(condition)
      ),
      id: createMockU32(id),
      result: createMockBool(result),
    },
    !complianceRequirementResult
  ) as MockCodec<ComplianceRequirementResult>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetComplianceResult = (assetComplianceResult?: {
  paused: bool | Parameters<typeof createMockBool>[0];
  requirements: (
    | ComplianceRequirementResult
    | Parameters<typeof createMockComplianceRequirementResult>[0]
  )[];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<AssetComplianceResult> => {
  const { paused, requirements, result } = assetComplianceResult || {
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
  ) as MockCodec<AssetComplianceResult>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDidRecord = (didRecord?: {
  roles: IdentityRole[];
  primary_key: AccountId;
  secondary_keys: MeshSecondaryKey[];
}): MockCodec<DidRecord> => {
  const record = didRecord || {
    roles: [],
    primary_key: createMockAccountId(),
    secondary_items: [],
  };

  return createMockCodec(
    {
      ...record,
    },
    !didRecord
  ) as MockCodec<DidRecord>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCanTransferResult = (
  canTransferResult?: { Ok: u8 } | { Err: Bytes }
): MockCodec<CanTransferResult> =>
  createMockEnum(canTransferResult) as MockCodec<CanTransferResult>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockText = (value?: string | Text): MockCodec<Text> => {
  if (isCodec<Text>(value)) {
    return value as MockCodec<Text>;
  }

  return createMockStringCodec(value) as MockCodec<Text>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetOwnershipRelation = (
  assetOwnershipRelation?: 'NotOwned' | 'TickerOwned' | 'AssetOwned'
): MockCodec<AssetOwnershipRelation> =>
  createMockEnum(assetOwnershipRelation) as MockCodec<AssetOwnershipRelation>;

/**
 * @hidden
 */
export const createMockProposalState = (
  proposalState?: 'Pending' | 'Cancelled' | 'Killed' | 'Rejected' | 'Referendum' | { Custom: Bytes }
): MockCodec<ProposalState> => {
  return createMockEnum(proposalState) as MockCodec<ProposalState>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPip = (pip?: {
  id: u32;
  proposal: Call;
  state: ProposalState;
}): MockCodec<Pip> => {
  const proposal = pip || {
    id: createMockU32(),
    proposal: 'proposal' as unknown as Call,
    state: createMockProposalState(),
  };

  return createMockCodec(
    {
      ...proposal,
    },
    !pip
  ) as MockCodec<Pip>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipsMetadata = (metadata?: {
  proposer: AccountId;
  cool_off_until: u32;
  end: u32;
}): MockCodec<PipsMetadata> => {
  const data = metadata || {
    proposer: createMockAccountId(),
    cool_off_until: createMockU32(),
    end: createMockU32(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !metadata
  ) as MockCodec<PipsMetadata>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecondaryKey = (secondaryKey?: {
  signer: Signatory;
  permissions: Permissions;
}): MockCodec<MeshSecondaryKey> => {
  const key = secondaryKey || {
    signer: createMockSignatory(),
    permissions: createMockPermissions(),
  };
  return createMockCodec(
    {
      ...key,
    },
    !secondaryKey
  ) as MockCodec<MeshSecondaryKey>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipId = (id: BigNumber): MockCodec<PipId> =>
  createMockU32(new BigNumber(id)) as MockCodec<PipId>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueDetails = (details?: string): MockCodec<VenueDetails> =>
  createMockStringCodec(details) as MockCodec<VenueDetails>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueType = (
  venueType?: 'Other' | 'Distribution' | 'Sto' | 'Exchange'
): MockCodec<VenueType> => {
  return createMockEnum(venueType) as MockCodec<VenueType>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenue = (venue?: {
  creator: IdentityId;
  venue_type: VenueType;
}): MockCodec<Venue> => {
  const vn = venue || {
    creator: createMockIdentityId(),
    venue_type: createMockVenueType(),
  };

  return createMockCodec(
    {
      ...vn,
    },
    !venue
  ) as MockCodec<Venue>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstructionStatus = (
  instructionStatus?: 'Pending' | 'Unknown' | 'Failed'
): MockCodec<InstructionStatus> => {
  return createMockEnum(instructionStatus) as MockCodec<InstructionStatus>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSettlementType = (
  settlementType?: 'SettleOnAffirmation' | { SettleOnBlock: u32 }
): MockCodec<SettlementType> => {
  return createMockEnum(settlementType) as MockCodec<SettlementType>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAffirmationStatus = (
  authorizationStatus?: 'Unknown' | 'Pending' | 'Affirmed'
): MockCodec<AffirmationStatus> => {
  return createMockEnum(authorizationStatus) as MockCodec<AffirmationStatus>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstruction = (instruction?: {
  instruction_id: u64;
  venue_id: u64;
  status: InstructionStatus;
  settlement_type: SettlementType;
  created_at: Option<Moment>;
  trade_date: Option<Moment>;
  value_date: Option<Moment>;
}): MockCodec<Instruction> => {
  const data = instruction || {
    instruction_id: createMockU64(),
    venue_id: createMockU64(),
    status: createMockInstructionStatus(),
    settlement_type: createMockSettlementType(),
    created_at: createMockOption(),
    trade_date: createMockOption(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !instruction
  ) as MockCodec<Instruction>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferManager = (
  transferManager?:
    | { CountTransferManager: u64 }
    | { PercentageTransferManager: Permill }
    | TransferManager
): MockCodec<TransferManager> => {
  if (isCodec<TransferManager>(transferManager)) {
    return transferManager as MockCodec<TransferManager>;
  }
  return createMockEnum(transferManager) as MockCodec<TransferManager>;
};

/**
 * @hidden
 */
export const createMockFundraiserTier = (fundraiserTier?: {
  total: Balance;
  price: Balance;
  remaining: Balance;
}): MockCodec<FundraiserTier> => {
  const data = fundraiserTier || {
    total: createMockBalance(),
    price: createMockBalance(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiserTier
  ) as MockCodec<FundraiserTier>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserStatus = (
  fundraiserStatus?: 'Live' | 'Frozen' | 'Closed' | 'ClosedEarly'
): MockCodec<FundraiserStatus> => {
  return createMockEnum(fundraiserStatus) as MockCodec<FundraiserStatus>;
};

/**
 * @hidden
 */
export const createMockFundraiser = (fundraiser?: {
  creator: IdentityId;
  offering_portfolio: PortfolioId;
  offering_asset: Ticker;
  raising_portfolio: PortfolioId;
  raising_asset: Ticker;
  tiers: FundraiserTier[];
  venue_id: u64;
  start: Moment;
  end: Option<Moment>;
  status: FundraiserStatus;
  minimum_investment: Balance;
}): MockCodec<Fundraiser> => {
  const data = fundraiser || {
    creator: createMockIdentityId(),
    offering_portfolio: createMockPortfolioId(),
    offering_asset: createMockTicker(),
    raising_portfolio: createMockPortfolioId(),
    raising_asset: createMockTicker(),
    tiers: [],
    venue_id: createMockU64(),
    start: createMockMoment(),
    end: createMockOption(),
    status: createMockFundraiserStatus(),
    minimum_investment: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiser
  ) as MockCodec<Fundraiser>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPriceTier = (priceTier?: {
  total: Balance;
  price: Balance;
}): MockCodec<PriceTier> => {
  const data = priceTier || {
    total: createMockBalance(),
    price: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !priceTier
  ) as MockCodec<PriceTier>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarUnit = (
  calendarUnit?: 'Second' | 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | CalendarUnit
): MockCodec<CalendarUnit> => {
  if (isCodec<CalendarUnit>(calendarUnit)) {
    return calendarUnit as MockCodec<CalendarUnit>;
  }

  return createMockEnum(calendarUnit) as MockCodec<CalendarUnit>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarPeriod = (
  calendarPeriod?:
    | CalendarPeriod
    | {
        unit: CalendarUnit | Parameters<typeof createMockCalendarUnit>[0];
        amount: u64 | Parameters<typeof createMockU64>[0];
      }
): MockCodec<CalendarPeriod> => {
  const { unit, amount } = calendarPeriod || {
    unit: createMockCalendarUnit(),
    amount: createMockU64(),
  };

  return createMockCodec(
    {
      unit: createMockCalendarUnit(unit),
      amount: createMockU64(amount),
    },
    !calendarPeriod
  ) as MockCodec<CalendarPeriod>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCheckpointSchedule = (
  checkpointSchedule?:
    | CheckpointSchedule
    | {
        start: Moment | Parameters<typeof createMockMoment>[0];
        period: CalendarPeriod | Parameters<typeof createMockCalendarPeriod>[0];
      }
): MockCodec<CheckpointSchedule> => {
  const { start, period } = checkpointSchedule || {
    start: createMockMoment(),
    period: createMockCalendarPeriod(),
  };

  return createMockCodec(
    {
      start: createMockMoment(start),
      period: createMockCalendarPeriod(period),
    },
    !checkpointSchedule
  ) as MockCodec<CheckpointSchedule>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStoredSchedule = (
  storedSchedule?:
    | StoredSchedule
    | {
        schedule: CheckpointSchedule | Parameters<typeof createMockCheckpointSchedule>[0];
        id: u64 | Parameters<typeof createMockU64>[0];
        at: Moment | Parameters<typeof createMockMoment>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<StoredSchedule> => {
  const { schedule, id, at, remaining } = storedSchedule || {
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
  ) as MockCodec<StoredSchedule>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScheduleSpec = (
  scheduleSpec?:
    | ScheduleSpec
    | {
        start: Option<Moment> | Parameters<typeof createMockOption>[0];
        period: CalendarPeriod | Parameters<typeof createMockCalendarPeriod>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<ScheduleSpec> => {
  const { start, period, remaining } = scheduleSpec || {
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
  ) as MockCodec<ScheduleSpec>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScalar = (scalar?: string | Scalar): MockCodec<Scalar> => {
  if (!scalar || typeof scalar === 'string') {
    return createMockStringCodec(scalar) as MockCodec<Scalar>;
  } else {
    return scalar as MockCodec<Scalar>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDateSpec = (
  recordDateSpec?:
    | { Scheduled: Moment }
    | { ExistingSchedule: ScheduleId }
    | { Existing: CheckpointId }
    | RecordDateSpec
): MockCodec<RecordDateSpec> => {
  if (isCodec<RecordDateSpec>(recordDateSpec)) {
    return recordDateSpec as MockCodec<RecordDateSpec>;
  }

  return createMockEnum(recordDateSpec) as MockCodec<RecordDateSpec>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRistrettoPoint = (
  ristrettoPoint?: string | RistrettoPoint
): MockCodec<RistrettoPoint> => {
  if (!ristrettoPoint || typeof ristrettoPoint === 'string') {
    return createMockStringCodec(ristrettoPoint) as MockCodec<RistrettoPoint>;
  } else {
    return ristrettoPoint as MockCodec<RistrettoPoint>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCACheckpoint = (
  caCheckpoint?: { Scheduled: [ScheduleId, u64] } | { Existing: CheckpointId } | CACheckpoint
): MockCodec<CACheckpoint> => {
  if (isCodec<CACheckpoint>(caCheckpoint)) {
    return caCheckpoint as MockCodec<CACheckpoint>;
  }

  return createMockEnum(caCheckpoint) as MockCodec<CACheckpoint>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDate = (
  recordDate?:
    | RecordDate
    | {
        date: Moment | Parameters<typeof createMockMoment>[0];
        checkpoint: CACheckpoint | Parameters<typeof createMockCACheckpoint>[0];
      }
): MockCodec<RecordDate> => {
  const { date, checkpoint } = recordDate || {
    date: createMockMoment(),
    checkpoint: createMockCACheckpoint(),
  };

  return createMockCodec(
    {
      date: createMockMoment(date),
      checkpoint: createMockCACheckpoint(checkpoint),
    },
    !recordDate
  ) as MockCodec<RecordDate>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignature = (signature?: string | Signature): MockCodec<Signature> => {
  if (!signature || typeof signature === 'string') {
    return createMockStringCodec(signature) as MockCodec<Signature>;
  } else {
    return signature as MockCodec<Signature>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockZkProofData = (
  zkProofData?:
    | ZkProofData
    | {
        challenge_responses: [Scalar, Scalar] | [string, string];
        subtract_expressions_res: RistrettoPoint | string;
        blinded_scope_did_hash: RistrettoPoint | string;
      }
): MockCodec<ZkProofData> => {
  const { challenge_responses, subtract_expressions_res, blinded_scope_did_hash } = zkProofData || {
    challenge_responses: [createMockScalar(), createMockScalar()],
    subtract_expressions_res: createMockRistrettoPoint(),
    blinded_scope_did_hash: createMockRistrettoPoint(),
  };

  return createMockCodec(
    {
      challenge_responses: [
        createMockScalar(challenge_responses[0]),
        createMockScalar(challenge_responses[1]),
      ],
      subtract_expressions_res: createMockRistrettoPoint(subtract_expressions_res),
      blinded_scope_did_hash: createMockRistrettoPoint(blinded_scope_did_hash),
    },
    !zkProofData
  ) as MockCodec<ZkProofData>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetTreatment = (
  targetTreatment?: 'Include' | 'Exclude' | TargetTreatment
): MockCodec<TargetTreatment> => {
  if (isCodec<TargetTreatment>(targetTreatment)) {
    return targetTreatment as MockCodec<TargetTreatment>;
  }

  return createMockEnum(targetTreatment) as MockCodec<TargetTreatment>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentities = (
  targetIdentities?:
    | TargetIdentities
    | {
        identities: (IdentityId | Parameters<typeof createMockIdentityId>[0])[];
        treatment: TargetTreatment | Parameters<typeof createMockTargetTreatment>[0];
      }
): MockCodec<TargetIdentities> => {
  const { identities, treatment } = targetIdentities || {
    identities: [],
    treatment: createMockTargetTreatment(),
  };

  return createMockCodec(
    {
      identities: map(identities, identityId => createMockIdentityId(identityId)),
      treatment: createMockTargetTreatment(treatment),
    },
    !targetIdentities
  ) as MockCodec<TargetIdentities>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeClaimProof = (
  scopeClaimProof?:
    | ScopeClaimProof
    | {
        proof_scope_id_wellformed: Signature | string;
        proof_scope_id_cdd_id_match:
          | ZkProofData
          | {
              challenge_responses: [string, string];
              subtract_expressions_res: string;
              blinded_scope_did_hash: string;
            };
        scope_id: RistrettoPoint | string;
      }
): MockCodec<MeshScopeClaimProof> => {
  const { proof_scope_id_wellformed, proof_scope_id_cdd_id_match, scope_id } = scopeClaimProof || {
    proof_scope_id_wellformed: createMockSignature(),
    proof_scope_id_cdd_id_match: createMockZkProofData(),
    scope_id: createMockRistrettoPoint(),
  };

  return createMockCodec(
    {
      proof_scope_id_wellformed: createMockSignature(proof_scope_id_wellformed),
      proof_scope_id_cdd_id_match: createMockZkProofData(proof_scope_id_cdd_id_match),
      scope_id: createMockRistrettoPoint(scope_id),
    },
    !scopeClaimProof
  ) as MockCodec<MeshScopeClaimProof>;
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
    | CAKind
): MockCodec<CAKind> => {
  if (isCodec<CAKind>(caKind)) {
    return caKind as MockCodec<CAKind>;
  }

  return createMockEnum(caKind) as MockCodec<CAKind>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCorporateAction = (corporateAction?: {
  kind: CAKind | Parameters<typeof createMockCAKind>[0];
  decl_date: Moment | Parameters<typeof createMockMoment>[0];
  record_date: Option<RecordDate> | Parameters<typeof createMockOption>[0];
  targets: TargetIdentities | Parameters<typeof createMockTargetIdentities>[0];
  default_withholding_tax: Tax | Parameters<typeof createMockPermill>[0];
  withholding_tax: [
    IdentityId | Parameters<typeof createMockIdentityId>[0],
    Tax | Parameters<typeof createMockPermill>[0]
  ][];
}): MockCodec<CorporateAction> => {
  const { kind, decl_date, record_date, targets, default_withholding_tax, withholding_tax } =
    corporateAction || {
      kind: createMockCAKind(),
      decl_date: createMockMoment(),
      record_date: createMockOption(),
      targets: createMockTargetIdentities(),
      default_withholding_tax: createMockPermill(),
      withholding_tax: [],
    };

  return createMockCodec(
    {
      kind: createMockCAKind(kind),
      decl_date: createMockMoment(decl_date),
      record_date: createMockOption(record_date),
      targets: createMockTargetIdentities(targets),
      default_withholding_tax: createMockPermill(default_withholding_tax),
      withholding_tax: withholding_tax.map(([identityId, tax]) =>
        tuple(createMockIdentityId(identityId), createMockPermill(tax))
      ),
    },
    !corporateAction
  ) as MockCodec<CorporateAction>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCAId = (
  caId?:
    | CAId
    | {
        ticker: Ticker | Parameters<typeof createMockTicker>[0];
        local_id: u64 | Parameters<typeof createMockU64>[0];
      }
): MockCodec<CAId> => {
  const { ticker, local_id } = caId || {
    ticker: createMockTicker(),
    local_id: createMockU64(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      local_id: createMockU64(local_id),
    },
    !caId
  ) as MockCodec<CAId>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDistribution = (distribution?: {
  from: PortfolioId | Parameters<typeof createMockPortfolioId>[0];
  currency: Ticker | Parameters<typeof createMockTicker>[0];
  per_share: Balance | Parameters<typeof createMockBalance>[0];
  amount: Balance | Parameters<typeof createMockBalance>[0];
  remaining: Balance | Parameters<typeof createMockBalance>[0];
  reclaimed: bool | Parameters<typeof createMockBool>[0];
  payment_at: Moment | Parameters<typeof createMockMoment>[0];
  expires_at: Option<Moment> | Parameters<typeof createMockOption>[0];
}): MockCodec<Distribution> => {
  const { from, currency, per_share, amount, remaining, reclaimed, payment_at, expires_at } =
    distribution || {
      from: createMockPortfolioId(),
      currency: createMockTicker(),
      per_share: createMockBalance(),
      amount: createMockBalance(),
      remaining: createMockBalance(),
      reclaimed: createMockBool(),
      payment_at: createMockMoment(),
      expires_at: createMockOption(),
    };

  return createMockCodec(
    {
      from: createMockPortfolioId(from),
      currency: createMockTicker(currency),
      per_share: createMockBalance(per_share),
      amount: createMockBalance(amount),
      remaining: createMockBalance(remaining),
      reclaimed: createMockBool(reclaimed),
      payment_at: createMockMoment(payment_at),
      expires_at: createMockOption(expires_at),
    },
    !distribution
  ) as MockCodec<Distribution>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferManagerResult = (transferManagerResult?: {
  tm: TransferManager | Parameters<typeof createMockTransferManager>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<TransferManagerResult> => {
  const { tm, result } = transferManagerResult || {
    tm: createMockTransferManager(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      tm: createMockTransferManager(tm),
      result: createMockBool(result),
    },
    !transferManagerResult
  ) as MockCodec<TransferManagerResult>;
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
  } = portfolioValidityResult || {
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
  ) as MockCodec<PortfolioValidityResult>;
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
  statistics_result: (
    | TransferManagerResult
    | Parameters<typeof createMockTransferManagerResult>[0]
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
    statistics_result,
    compliance_result,
    result,
  } = granularCanTransferResult || {
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
    statistics_result: [],
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
      statistics_result: statistics_result.map(res => createMockTransferManagerResult(res)),
      compliance_result: createMockAssetComplianceResult(compliance_result),
      result: createMockBool(result),
    },
    !granularCanTransferResult
  ) as MockCodec<GranularCanTransferResult>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClassicTickerRegistration = (
  registration?:
    | ClassicTickerRegistration
    | {
        eth_owner: EthereumAddress | Parameters<typeof createMockEthereumAddress>[0];
        is_created: bool | Parameters<typeof createMockBool>[0];
      }
): MockCodec<ClassicTickerRegistration> => {
  const { eth_owner, is_created } = registration || {
    eth_owner: createMockEthereumAddress(),
    is_created: createMockBool(),
  };

  return createMockCodec(
    {
      eth_owner: createMockEthereumAddress(eth_owner),
      is_created: createMockBool(is_created),
    },
    !registration
  ) as MockCodec<ClassicTickerRegistration>;
};

/**
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
  const { parentHash, number, stateRoot, extrinsicsRoot } = header || {
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
  ) as MockCodec<Header>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockExtrinsics = (
  extrinsics?:
    | Vec<GenericExtrinsic>
    | {
        toHex: () => string;
      }[]
): MockCodec<Vec<GenericExtrinsic>> => {
  const [{ toHex }] = extrinsics || [
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
  ) as MockCodec<Vec<GenericExtrinsic>>;
};

/**
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
  const { header, extrinsics } = block || {
    header: createMockHeader(),
    extrinsics: createMockExtrinsics(),
  };

  return createMockCodec(
    {
      header: createMockHeader(header),
      extrinsics: createMockExtrinsics(extrinsics),
    },
    !block
  ) as MockCodec<Block>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignedBlock = (
  signedBlock?:
    | SignedBlock
    | {
        block: Block | Parameters<typeof createMockBlock>[0];
      }
): MockCodec<SignedBlock> => {
  const { block } = signedBlock || {
    block: createMockBlock(),
  };

  return createMockCodec(
    {
      block: createMockBlock(block),
    },
    !signedBlock
  ) as MockCodec<SignedBlock>;
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
  const { partialFee } = runtimeDispatchInfo || {
    partialFee: createMockBalance(),
  };

  return createMockCodec(
    {
      partialFee: createMockBalance(partialFee),
    },
    !runtimeDispatchInfo
  ) as MockCodec<RuntimeDispatchInfo>;
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
): MockCodec<MockCodec<ProtocolOp>> => {
  return createMockEnum(protocolOp) as MockCodec<ProtocolOp>;
};
