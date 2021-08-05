/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise, Keyring } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import { bool, Bytes, Compact, Enum, Option, Text, u8, U8aFixed, u32, u64 } from '@polkadot/types';
import { CompactEncodable } from '@polkadot/types/codec/types';
import {
  AccountData,
  AccountId,
  AccountInfo,
  Balance,
  DispatchError,
  DispatchErrorModule,
  EventRecord,
  ExtrinsicStatus,
  Hash,
  Index,
  Moment,
  Permill,
  RefCount,
  RuntimeVersion,
  Signature,
} from '@polkadot/types/interfaces';
import { Call } from '@polkadot/types/interfaces/runtime';
import { Codec, IEvent, ISubmittableResult, Registry } from '@polkadot/types/types';
import { stringToU8a } from '@polkadot/util';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { BigNumber } from 'bignumber.js';
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
  ClaimData,
  ClaimType,
  CountryCode as CountryCodeEnum,
  DistributionWithDetails,
  ExtrinsicData,
  KeyringPair,
  ResultSet,
  SecondaryKey,
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
    setSigner: sinon.stub() as (signer: Signer) => void,
    disconnect: sinon.stub() as () => Promise<void>,
  } as Mutable<ApiPromise> & EventEmitter;
}

/**
 * Create a mock instance of the Apollo client
 */
function createApolloClient(): Mutable<ApolloClient<NormalizedCacheObject>> {
  return ({
    stop: sinon.stub(),
  } as unknown) as Mutable<ApolloClient<NormalizedCacheObject>>;
}

let apolloConstructorStub: SinonStub;

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
  keyringInstance: {} as Mutable<Keyring>,
  apolloInstance: createApolloClient(),
};

let apiPromiseCreateStub: SinonStub;

const MockApiPromiseClass = class {
  /**
   * @hidden
   */
  public static create = apiPromiseCreateStub;
};

const MockWsProviderClass = class {};

let keyringConstructorStub: SinonStub;

const MockKeyringClass = class {
  /**
   * @hidden
   */
  public constructor() {
    return keyringConstructorStub();
  }
};

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

interface Pair {
  address: string;
  meta: Record<string, unknown>;
  publicKey: string;
  isLocked?: boolean;
}

interface ContextOptions {
  did?: string;
  withSeed?: boolean;
  balance?: AccountBalance;
  hasRoles?: boolean;
  hasPermissions?: boolean;
  hasTokenPermissions?: boolean;
  validCdd?: boolean;
  tokenBalance?: BigNumber;
  invalidDids?: string[];
  transactionFee?: BigNumber;
  currentPairAddress?: string;
  currentPairIsLocked?: boolean;
  issuedClaims?: ResultSet<ClaimData>;
  getIdentityClaimsFromChain?: ClaimData[];
  getIdentityClaimsFromMiddleware?: ResultSet<ClaimData>;
  primaryKey?: string;
  secondaryKeys?: SecondaryKey[];
  transactionHistory?: ResultSet<ExtrinsicData>;
  latestBlock?: BigNumber;
  middlewareEnabled?: boolean;
  middlewareAvailable?: boolean;
  sentAuthorizations?: ResultSet<AuthorizationRequest>;
  isArchiveNode?: boolean;
  ss58Format?: number;
  areScondaryKeysFrozen?: boolean;
  getDividendDistributionsForTokens?: DistributionWithDetails[];
  isFrozen?: boolean;
  addPair?: Pair;
  getAccounts?: Account[];
}

interface KeyringOptions {
  getPair?: Pair;
  getPairs?: Pair[];
  addFromUri?: Pair;
  addFromSeed?: Pair;
  addFromMnemonic?: Pair;
  addPair?: Pair;
  encodeAddress?: string;
  /**
   * @hidden
   * Whether keyring functions should throw
   */
  error?: boolean;
}

export interface StubQuery {
  entries: SinonStub;
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
  asModule: ({
    error: { toNumber: (): number => 1 },
    index: { toNumber: (): number => 1 },
    registry: {
      findMetaError: (): { section: string; name: string; documentation: string[] } => ({
        section: 'someModule',
        name: 'SomeError',
        documentation: ['This is very bad'],
      }),
    },
  } as unknown) as DispatchErrorModule,
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
  if (status === MockTxStatus.Succeeded) {
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
  Keyring: MockKeyringClass,
});

export const mockContextModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Context: MockContextClass,
});

export const mockApolloModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ApolloClient: MockApolloClientClass,
});

const txMocksData = new Map<unknown, TxMockData>();
let txModule = {} as Extrinsics;
let queryModule = {} as Queries;
let constsModule = {} as Consts;

// TODO cast rpcModule to a better type
let rpcModule = {} as any;

let queryMultiStub = sinon.stub();

const defaultContextOptions: ContextOptions = {
  did: 'someDid',
  withSeed: true,
  balance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  hasRoles: true,
  hasPermissions: true,
  hasTokenPermissions: true,
  validCdd: true,
  tokenBalance: new BigNumber(1000),
  invalidDids: [],
  transactionFee: new BigNumber(200),
  currentPairAddress: '0xdummy',
  currentPairIsLocked: false,
  issuedClaims: {
    data: [
      {
        target: ('targetIdentity' as unknown) as Identity,
        issuer: ('issuerIdentity' as unknown) as Identity,
        issuedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: 1,
    count: 1,
  },
  getIdentityClaimsFromChain: [
    {
      target: ('targetIdentity' as unknown) as Identity,
      issuer: ('issuerIdentity' as unknown) as Identity,
      issuedAt: new Date(),
      expiry: null,
      claim: { type: ClaimType.NoData },
    },
  ],
  getIdentityClaimsFromMiddleware: {
    data: [
      {
        target: ('targetIdentity' as unknown) as Identity,
        issuer: ('issuerIdentity' as unknown) as Identity,
        issuedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: 1,
    count: 1,
  },
  primaryKey: 'primaryKey',
  secondaryKeys: [],
  transactionHistory: {
    data: [],
    next: null,
    count: 1,
  },
  latestBlock: new BigNumber(100),
  middlewareEnabled: true,
  middlewareAvailable: true,
  sentAuthorizations: {
    data: [{} as AuthorizationRequest],
    next: 1,
    count: 1,
  },
  isArchiveNode: true,
  ss58Format: 42,
  areScondaryKeysFrozen: false,
  getDividendDistributionsForTokens: [],
  isFrozen: false,
  addPair: {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {},
    isLocked: false,
    publicKey: 'someKey',
  },
  getAccounts: [],
};
let contextOptions: ContextOptions = defaultContextOptions;
const defaultKeyringOptions: KeyringOptions = {
  getPair: {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {},
    publicKey: 'publicKey1',
  },
  getPairs: [
    {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      meta: {},
      publicKey: 'publicKey2',
    },
  ],
  addFromSeed: {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {},
    publicKey: 'publicKey3',
  },
  addFromUri: {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {},
    publicKey: 'publicKey4',
  },
  addFromMnemonic: {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {},
    publicKey: 'publicKey5',
  },
  encodeAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
};
let keyringOptions: KeyringOptions = defaultKeyringOptions;

/**
 * @hidden
 */
function configureContext(opts: ContextOptions): void {
  const getCurrentIdentity = sinon.stub();
  const identity = {
    did: opts.did,
    hasRoles: sinon.stub().resolves(opts.hasRoles),
    hasTokenPermissions: sinon.stub().resolves(opts.hasTokenPermissions),
    hasValidCdd: sinon.stub().resolves(opts.validCdd),
    getTokenBalance: sinon.stub().resolves(opts.tokenBalance),
    getPrimaryKey: sinon.stub().resolves(opts.primaryKey),
    getSecondaryKeys: sinon.stub().resolves(opts.secondaryKeys),
    authorizations: {
      getSent: sinon.stub().resolves(opts.sentAuthorizations),
    },
    areSecondaryKeysFrozen: sinon.stub().resolves(opts.areScondaryKeysFrozen),
  };
  opts.withSeed
    ? getCurrentIdentity.resolves(identity)
    : getCurrentIdentity.throws(
        new Error('The current account does not have an associated identity')
      );
  const getCurrentAccount = sinon.stub();
  opts.withSeed
    ? getCurrentAccount.returns({
        address: opts.currentPairAddress,
        getBalance: sinon.stub().resolves(opts.balance),
        getIdentity: sinon.stub().resolves(identity),
        getTransactionHistory: sinon.stub().resolves(opts.transactionHistory),
        hasPermissions: sinon.stub().resolves(opts.hasPermissions),
        isFrozen: sinon.stub().resolves(opts.isFrozen),
      })
    : getCurrentAccount.throws(new Error('There is no account associated with the SDK'));
  const currentPair = opts.withSeed
    ? ({
        address: opts.currentPairAddress,
        isLocked: opts.currentPairIsLocked,
      } as KeyringPair)
    : undefined;
  const getCurrentPair = sinon.stub();
  opts.withSeed
    ? getCurrentPair.returns(currentPair)
    : getCurrentPair.throws(
        new Error('There is no account associated with the current SDK instance')
      );

  const contextInstance = ({
    currentPair,
    getCurrentIdentity,
    getCurrentAccount,
    getCurrentPair,
    accountBalance: sinon.stub().resolves(opts.balance),
    getAccounts: sinon.stub().returns(opts.getAccounts),
    setPair: sinon.stub().callsFake(address => {
      contextInstance.currentPair = { address } as KeyringPair;
    }),
    getSigner: sinon.stub().returns(currentPair),
    polymeshApi: mockInstanceContainer.apiInstance,
    middlewareApi: mockInstanceContainer.apolloInstance,
    queryMiddleware: sinon
      .stub()
      .callsFake(query => mockInstanceContainer.apolloInstance.query(query)),
    getInvalidDids: sinon.stub().resolves(opts.invalidDids),
    getTransactionFees: sinon.stub().resolves(opts.transactionFee),
    getTransactionArguments: sinon.stub().returns([]),
    getSecondaryKeys: sinon.stub().returns(opts.secondaryKeys),
    issuedClaims: sinon.stub().resolves(opts.issuedClaims),
    getIdentityClaimsFromChain: sinon.stub().resolves(opts.getIdentityClaimsFromChain),
    getIdentityClaimsFromMiddleware: sinon.stub().resolves(opts.getIdentityClaimsFromMiddleware),
    getLatestBlock: sinon.stub().resolves(opts.latestBlock),
    isMiddlewareEnabled: sinon.stub().returns(opts.middlewareEnabled),
    isMiddlewareAvailable: sinon.stub().resolves(opts.middlewareAvailable),
    isArchiveNode: opts.isArchiveNode,
    ss58Format: opts.ss58Format,
    disconnect: sinon.stub(),
    getDividendDistributionsForTokens: sinon
      .stub()
      .resolves(opts.getDividendDistributionsForTokens),
    addPair: sinon.stub().returns(opts.addPair),
  } as unknown) as MockContext;

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
  mockInstanceContainer.apiInstance.registry = ('registry' as unknown) as Registry;
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
 * @hidden
 */
function configureKeyring(opts: KeyringOptions): void {
  const {
    error,
    getPair,
    getPairs,
    addFromUri,
    addFromSeed,
    addFromMnemonic,
    addPair,
    encodeAddress,
  } = opts;

  const err = new Error('Error');

  const keyringInstance = {
    getPair: sinon.stub().returns(getPair),
    getPairs: sinon.stub().returns(getPairs),
    addFromSeed: sinon.stub().returns(addFromSeed),
    addFromUri: sinon.stub().returns(addFromUri),
    addFromMnemonic: sinon.stub().returns(addFromMnemonic),
    addPair: sinon.stub().returns(addPair),
    encodeAddress: sinon.stub().returns(encodeAddress),
  };

  if (error) {
    keyringInstance.getPair.throws(err);
    keyringInstance.getPairs.throws(err);
    keyringInstance.addFromSeed.throws(err);
    keyringInstance.addFromUri.throws(err);
    keyringInstance.addFromMnemonic.throws(err);
    keyringInstance.encodeAddress.throws(err);
  }

  Object.assign(mockInstanceContainer.keyringInstance, (keyringInstance as unknown) as Keyring);

  keyringConstructorStub.returns(keyringInstance);
}

/**
 * @hidden
 */
function initKeyring(opts?: KeyringOptions): void {
  keyringConstructorStub = sinon.stub();

  keyringOptions = { ...defaultKeyringOptions, ...opts };

  configureKeyring(keyringOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: {
  contextOptions?: ContextOptions;
  keyringOptions?: KeyringOptions;
}): void {
  const tempKeyringOptions = { ...defaultKeyringOptions, ...opts?.keyringOptions };

  configureKeyring(tempKeyringOptions);

  const tempContextOptions = { ...defaultContextOptions, ...opts?.contextOptions };

  configureContext(tempContextOptions);
}

/**
 * @hidden
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 *
 * @param opts.mockContext - if defined, the internal [[Context]] class will also be mocked with custom properties
 */
export function initMocks(opts?: {
  contextOptions?: ContextOptions;
  keyringOptions?: KeyringOptions;
}): void {
  /*
    NOTE: the idea is to expand this function to mock things as we need them
    and use the methods in the class to fetch/manipulate different parts of the API as required
   */

  // Context
  initContext(opts?.contextOptions);

  // Api
  initApi();

  // Keyring
  initKeyring(opts?.keyringOptions);

  // Apollo
  apolloConstructorStub = sinon.stub().returns(mockInstanceContainer.apolloInstance);

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
  mockInstanceContainer.keyringInstance = {} as Mutable<Keyring>;
  mockInstanceContainer.apolloInstance = createApolloClient();
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();

  initMocks({ contextOptions, keyringOptions });
}

/**
 * @hidden
 * Create and returns a mocked transaction. Each call will create a new version of the stub
 *
 * @param mod - name of the module
 * @param tx - name of the transaction function
 * @param autoresolve - if set to a status, the transaction will resolve immediately with that status.
 *  If set to false, the transaction lifecycle will be controlled by [[updateTxStatus]]
 */
export function createTxStub<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
>(
  mod: ModuleName,
  tx: TransactionName,
  opts: {
    autoresolve?: MockTxStatus | false;
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
    autoresolve = MockTxStatus.Succeeded,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    gas = createMockBalance(1),
    meta = { args: [] },
  } = opts;

  const transaction = (sinon.stub().returns({
    method: tx, // should be a `Call` object, but this is enough for testing
    hash: tx,
    signAndSend: sinon.stub().callsFake((_, cback: StatusCallback) => {
      if (autoresolve === MockTxStatus.Rejected) {
        return Promise.reject(new Error('Cancelled'));
      }

      const unsubCallback = sinon.stub();

      txMocksData.set(runtimeModule[tx], {
        statusCallback: cback,
        unsubCallback,
        resolved: !!autoresolve,
        status: (null as unknown) as MockTxStatus,
      });

      if (autoresolve) {
        process.nextTick(() => cback(statusToReceipt(autoresolve)));
      }

      return Promise.resolve(unsubCallback);
    }),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paymentInfo: sinon.stub().resolves({ partialFee: gas }),
  }) as unknown) as Extrinsics[ModuleName][TransactionName];

  (transaction as any).section = mod;
  (transaction as any).method = tx;
  (transaction as any).meta = meta;

  runtimeModule[tx] = transaction;

  updateTx();

  const instance = mockInstanceContainer.apiInstance;

  return (instance.tx[mod][tx] as unknown) as PolymeshTx<
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
 * Create and return an apollo stub for multiple queries
 *
 * @param queries - query and returnData for each stubbed query
 */
export function createApolloMultipleQueriesStub(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): SinonStub {
  const instance = mockInstanceContainer.apolloInstance;
  const stub = sinon.stub();

  queries.forEach(q => {
    stub.withArgs(q.query).resolves({
      data: q.returnData,
    });
  });

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
    size?: number;
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
    stub = (sinon.stub() as unknown) as QueryStub;
    stub.entries = sinon.stub();
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

  if (opts?.multi) {
    stub.multi.resolves(opts.multi);
  }
  if (typeof opts?.size !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    stub.size.resolves(createMockU64(opts.size));
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

  if ([MockTxStatus.Aborted, MockTxStatus.Failed, MockTxStatus.Succeeded].includes(status)) {
    txMocksData.set(tx, {
      ...txMockData,
      status,
      resolved: true,
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
  return (mockInstanceContainer.apiInstance as unknown) as ApiPromise &
    SinonStubbedInstance<ApiPromise> &
    EventEmitter;
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
 * Retrieve an instance of the mocked Keyring
 */
export function getKeyringInstance(opts?: KeyringOptions): Mocked<Keyring> {
  if (opts) {
    configureKeyring({ ...defaultKeyringOptions, ...opts });
  }
  return mockInstanceContainer.keyringInstance as Mocked<Keyring>;
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

/**
 * @hidden
 */
const createMockCodec = (codec: unknown, isEmpty: boolean): Codec => {
  const clone = cloneDeep(codec) as Mutable<Codec>;
  (clone as any)._isCodec = true;
  clone.isEmpty = isEmpty;
  return clone;
};

/**
 * @hidden
 */
const createMockStringCodec = (value?: string): Codec =>
  createMockCodec(
    {
      toString: () => value,
    },
    value === undefined
  );

/**
 * @hidden
 */
const createMockU8aCodec = (value?: string): Codec =>
  createMockCodec(stringToU8a(value), value === undefined);

/**
 * @hidden
 */
const createMockNumberCodec = (value?: number): Codec =>
  createMockCodec(
    {
      toNumber: () => value,
      toString: () => `${value}`,
      isZero: () => value === 0,
    },
    value === undefined
  );

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityId = (did?: string | IdentityId): IdentityId => {
  if (isCodec<IdentityId>(did)) {
    return did;
  }

  return createMockStringCodec(did) as IdentityId;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAgentGroup = (
  agentGroup?: 'Full' | 'ExceptMeta' | 'PolymeshV1Caa' | 'PolymeshV1Pia' | { Custom: AGId }
): AgentGroup => {
  return createMockEnum(agentGroup) as AgentGroup;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEcdsaSignature = (signature?: string | EcdsaSignature): EcdsaSignature => {
  if (isCodec<EcdsaSignature>(signature)) {
    return signature;
  }

  return createMockStringCodec(signature) as EcdsaSignature;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEthereumAddress = (address?: string | EthereumAddress): EthereumAddress => {
  if (isCodec<EthereumAddress>(address)) {
    return address;
  }

  return createMockU8aCodec(address) as EthereumAddress;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTicker = (ticker?: string | Ticker): Ticker => {
  if (isCodec<Ticker>(ticker)) {
    return ticker;
  }

  return createMockU8aCodec(ticker) as Ticker;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountId = (accountId?: string): AccountId =>
  createMockStringCodec(accountId) as AccountId;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBalance = (balance?: number | Balance): Balance => {
  if (isCodec<Balance>(balance)) {
    return balance;
  }

  return createMockNumberCodec(balance) as Balance;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentName = (name?: string): DocumentName =>
  createMockStringCodec(name) as DocumentName;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentUri = (uri?: string): DocumentUri =>
  createMockStringCodec(uri) as DocumentUri;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentHash = (hash?: string): DocumentHash =>
  createMockStringCodec(hash) as DocumentHash;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentType = (name?: string): DocumentType =>
  createMockStringCodec(name) as DocumentType;

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
  ) as Option<T>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCompact = <T extends CompactEncodable>(
  wrapped: T | null = null
): Compact<T> =>
  createMockCodec(
    {
      unwrap: () => wrapped as T,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  ) as Compact<T>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMoment = (millis?: number | Moment): Moment => {
  if (isCodec<Moment>(millis)) {
    return millis;
  }

  return createMockNumberCodec(millis) as Moment;
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
): TickerRegistration => {
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
  ) as TickerRegistration;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8 = (value?: number): u8 => createMockNumberCodec(value) as u8;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU32 = (value?: number | u32): u32 => {
  if (isCodec<u32>(value)) {
    return value;
  }
  return createMockNumberCodec(value) as u32;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU64 = (value?: number | u64): u64 => {
  if (isCodec<u64>(value)) {
    return value;
  }
  return createMockNumberCodec(value) as u64;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermill = (value?: number | Permill): Permill => {
  if (isCodec<Permill>(value)) {
    return value;
  }
  return createMockNumberCodec(value) as Permill;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBytes = (value?: string): Bytes => createMockU8aCodec(value) as Bytes;

/**
 * @hidden
 */
export const createMockHash = (value?: string): Hash => createMockStringCodec(value) as Hash;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetName = (name?: string): AssetName =>
  createMockStringCodec(name) as AssetName;

/**
 * @hidden
 */
export const createMockPosRatio = (numerator: number, denominator: number): PosRatio =>
  [createMockU32(numerator), createMockU32(denominator)] as PosRatio;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBool = (value?: boolean | bool): bool => {
  if (isCodec<bool>(value)) {
    return value;
  }

  return createMockCodec(
    {
      isTrue: value,
      isFalse: !value,
      valueOf: () => value,
    },
    !value
  ) as bool;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockEnum = (enumValue?: string | Record<string, Codec | Codec[]>): Enum => {
  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    codec[`is${upperFirst(enumValue)}`] = true;
  } else if (typeof enumValue === 'object') {
    const key = Object.keys(enumValue)[0];

    codec[`is${upperFirst(key)}`] = true;
    codec[`as${upperFirst(key)}`] = enumValue[key];
  }

  return createMockCodec(codec, false) as Enum;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioKind = (
  portfolioKind?: 'Default' | { User: u64 } | PortfolioKind
): PortfolioKind => {
  if (isCodec<PortfolioKind>(portfolioKind)) {
    return portfolioKind;
  }
  return createMockEnum(portfolioKind) as PortfolioKind;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioId = (
  portfiolioId?:
    | PortfolioId
    | {
        did: IdentityId | Parameters<typeof createMockIdentityId>[0];
        kind: PortfolioKind | Parameters<typeof createMockPortfolioKind>[0];
      }
): PortfolioId => {
  const { did, kind } = portfiolioId || {
    did: createMockIdentityId(),
    kind: createMockPortfolioKind(),
  };
  return createMockCodec(
    {
      did: createMockIdentityId(did),
      kind: createMockPortfolioKind(kind),
    },
    !portfiolioId
  ) as PortfolioId;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMovePortfolioItem = (movePortfolioItem?: {
  ticker: Ticker;
  amount: Balance;
}): MovePortfolioItem => {
  const item = movePortfolioItem || {
    ticker: createMockTicker(),
    amount: createMockBalance(),
  };
  return createMockCodec(
    {
      ...item,
    },
    !movePortfolioItem
  ) as MovePortfolioItem;
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
    | { Custom: Bytes }
): AssetType => {
  return createMockEnum(assetType) as AssetType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistrationConfig = (regConfig?: {
  max_ticker_length: u8;
  registration_length: Option<Moment>;
}): TickerRegistrationConfig => {
  const config = regConfig || {
    max_ticker_length: createMockU8(),
    registration_length: createMockOption(),
  };
  return createMockCodec({ ...config }, !regConfig) as TickerRegistrationConfig;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecurityToken = (token?: {
  name: AssetName;
  total_supply: Balance;
  owner_did: IdentityId;
  divisible: bool;
  asset_type: AssetType;
}): SecurityToken => {
  const st = token || {
    name: createMockAssetName(),
    total_supply: createMockBalance(),
    owner_did: createMockIdentityId(),
    divisible: createMockBool(),
    asset_type: createMockAssetType(),
  };
  return createMockCodec({ ...st }, !token) as SecurityToken;
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
}): Document => {
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
  ) as Document;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountData = (accountData?: {
  free: Balance;
  reserved: Balance;
  miscFrozen: Balance;
  feeFrozen: Balance;
}): AccountData => {
  const data = accountData || {
    free: createMockBalance(),
    reserved: createMockBalance(),
    miscFrozen: createMockBalance(),
    feeFrozen: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !accountData
  ) as AccountData;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIndex = (value?: number): Index => createMockNumberCodec(value) as Index;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRefCount = (value?: number): RefCount =>
  createMockNumberCodec(value) as RefCount;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountInfo = (accountInfo?: {
  nonce: Index;
  refcount: RefCount;
  data: AccountData;
}): AccountInfo => {
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
  ) as AccountInfo;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatory = (
  signatory?: { Identity: IdentityId } | { Account: AccountId }
): Signatory => {
  return createMockEnum(signatory) as Signatory;
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
): MeshAuthorizationType => {
  return createMockEnum(authorizationType) as MeshAuthorizationType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8aFixed = (value?: string): U8aFixed =>
  createMockU8aCodec(value) as U8aFixed;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetIdentifier = (
  identifier?: { Isin: U8aFixed } | { Cusip: U8aFixed } | { Cins: U8aFixed } | { Lei: U8aFixed }
): AssetIdentifier => createMockEnum(identifier) as AssetIdentifier;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundingRoundName = (roundName?: string): FundingRoundName =>
  createMockStringCodec(roundName) as FundingRoundName;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletName = (name?: string | PalletName): PalletName => {
  if (isCodec<PalletName>(name)) {
    return name;
  }

  return createMockStringCodec(name) as PalletName;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDispatchableName = (name?: string | DispatchableName): DispatchableName => {
  if (isCodec<DispatchableName>(name)) {
    return name;
  }

  return createMockStringCodec(name) as DispatchableName;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserName = (name?: string): FundraiserName =>
  createMockStringCodec(name) as FundraiserName;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletPermissions = (permissions?: {
  pallet_name: PalletName | Parameters<typeof createMockPalletName>[0];
  dispatchable_names: DispatchableNames | Parameters<typeof createMockDispatchableNames>[0];
}): PalletPermissions => {
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
  ) as PalletPermissions;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermissions = (permissions?: {
  asset: AssetPermissions;
  extrinsic: ExtrinsicPermissions;
  portfolio: PortfolioPermissions;
}): Permissions => {
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
  ) as Permissions;
};

/**
 * @hidden
 */
export const createMockAssetPermissions = (
  assetPermissions?: 'Whole' | { These: Ticker[] } | { Except: Ticker[] }
): AssetPermissions => {
  return createMockEnum(assetPermissions) as AssetPermissions;
};

/**
 * @hidden
 */
export const createMockExtrinsicPermissions = (
  assetPermissions?: 'Whole' | { These: PalletPermissions[] } | { Except: PalletPermissions[] }
): ExtrinsicPermissions => {
  return createMockEnum(assetPermissions) as ExtrinsicPermissions;
};

/**
 * @hidden
 */
export const createMockPortfolioPermissions = (
  assetPermissions?: 'Whole' | { These: PortfolioId[] } | { Except: PortfolioId[] }
): PortfolioPermissions => {
  return createMockEnum(assetPermissions) as PortfolioPermissions;
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
): DispatchableNames => {
  if (isCodec<DispatchableNames>(dispatchableNames)) {
    return dispatchableNames;
  }

  return createMockEnum(dispatchableNames) as DispatchableNames;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationData = (
  authorizationData?:
    | { AttestPrimaryKeyRotation: IdentityId }
    | { RotatePrimaryKey: IdentityId }
    | { TransferTicker: Ticker }
    | { AddMultiSigSigner: AccountId }
    | { TransferAssetOwnership: Ticker }
    | { JoinIdentity: Permissions }
    | { TransferPrimaryIssuanceAgent: Ticker }
    | { PortfolioCustody: PortfolioId }
    | { custom: Bytes }
    | { TransferCorporateActionAgent: Ticker }
    | 'NoData'
): AuthorizationData => {
  return createMockEnum(authorizationData) as AuthorizationData;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorization = (authorization?: {
  authorization_data: AuthorizationData;
  authorized_by: IdentityId;
  expiry: Option<Moment>;
  auth_id: u64;
}): Authorization => {
  const auth = authorization || {
    authorization_data: createMockAuthorizationData(),
    authorized_by: createMockIdentityId(),
    expiry: createMockOption(),
    auth_id: createMockU64(),
  };

  return createMockCodec(
    {
      ...auth,
    },
    !authorization
  ) as Authorization;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEventRecord = (data: unknown[]): EventRecord =>
  (({
    event: {
      data,
    },
  } as unknown) as EventRecord);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIEvent = <T extends Codec[]>(data: unknown[]): IEvent<T> =>
  (({
    data,
  } as unknown) as IEvent<T>);

/**
 * @hidden
 */
export const createMockCddStatus = (cddStatus?: { Ok: IdentityId } | { Err: Bytes }): CddStatus =>
  createMockEnum(cddStatus) as CddStatus;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCountryCode = (name?: CountryCodeEnum): CountryCode =>
  createMockEnum(name) as CountryCode;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScope = (
  scope?: { Identity: IdentityId } | { Ticker: Ticker } | { Custom: Bytes }
): Scope => createMockEnum(scope) as Scope;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddId = (cddId?: string): CddId => createMockStringCodec(cddId) as CddId;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeId = (scopeId?: string): ScopeId =>
  createMockStringCodec(scopeId) as ScopeId;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInvestorZKProofData = (proof?: string): InvestorZKProofData =>
  createMockStringCodec(proof) as InvestorZKProofData;

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
): Claim => createMockEnum(claim) as Claim;

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
}): IdentityClaim => {
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
  ) as IdentityClaim;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentity = (
  targetIdentity?: { Specific: IdentityId } | 'ExternalAgent'
): TargetIdentity => createMockEnum(targetIdentity) as TargetIdentity;

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
): ConditionType => {
  if (isCodec<ConditionType>(conditionType)) {
    return conditionType;
  }

  return createMockEnum(conditionType) as ConditionType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaimType = (claimType?: ClaimType): MeshClaimType =>
  createMockEnum(claimType) as MeshClaimType;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim1stKey = (claim1stKey?: {
  target: IdentityId;
  claim_type: MeshClaimType;
}): Claim1stKey => {
  const claimTypeMock = claim1stKey || {
    target: createMockIdentityId(),
    claim_type: createMockClaimType(),
  };
  return createMockCodec(
    {
      ...claimTypeMock,
    },
    !claimTypeMock
  ) as Claim1stKey;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedFor = (
  trustedFor?: 'Any' | { Specific: MeshClaimType[] }
): TrustedFor => createMockEnum(trustedFor) as TrustedFor;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedIssuer = (issuer?: {
  issuer: IdentityId;
  trusted_for: TrustedFor;
}): TrustedIssuer => {
  const trustedIssuer = issuer || {
    issuer: createMockIdentityId(),
    trusted_for: createMockTrustedFor(),
  };

  return createMockCodec(
    {
      ...trustedIssuer,
    },
    !issuer
  ) as TrustedIssuer;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCondition = (condition?: {
  condition_type: ConditionType | Parameters<typeof createMockConditionType>[0];
  issuers: (TrustedIssuer | Parameters<typeof createMockTrustedIssuer>[0])[];
}): Condition => {
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
  ) as Condition;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionResult = (conditionResult?: {
  condition: Condition | Parameters<typeof createMockCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): ConditionResult => {
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
  ) as ConditionResult;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirement = (complianceRequirement?: {
  sender_conditions: Condition[];
  receiver_conditions: Condition[];
  id: u32;
}): ComplianceRequirement => {
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
  ) as ComplianceRequirement;
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
}): ComplianceRequirementResult => {
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
  ) as ComplianceRequirementResult;
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
}): AssetComplianceResult => {
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
  ) as AssetComplianceResult;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDidRecord = (didRecord?: {
  roles: IdentityRole[];
  primary_key: AccountId;
  secondary_keys: MeshSecondaryKey[];
}): DidRecord => {
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
  ) as DidRecord;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCanTransferResult = (
  canTransferResult?: { Ok: u8 } | { Err: Bytes }
): CanTransferResult => createMockEnum(canTransferResult) as CanTransferResult;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockText = (value?: string | Text): Text => {
  if (isCodec<Text>(value)) {
    return value;
  }

  return createMockStringCodec(value) as Text;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetOwnershipRelation = (
  assetOwnershipRelation?: 'NotOwned' | 'TickerOwned' | 'AssetOwned'
): AssetOwnershipRelation => createMockEnum(assetOwnershipRelation) as AssetOwnershipRelation;

/**
 * @hidden
 */
export const createMockProposalState = (
  proposalState?: 'Pending' | 'Cancelled' | 'Killed' | 'Rejected' | 'Referendum' | { Custom: Bytes }
): ProposalState => {
  return createMockEnum(proposalState) as ProposalState;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPip = (pip?: { id: u32; proposal: Call; state: ProposalState }): Pip => {
  const proposal = pip || {
    id: createMockU32(),
    proposal: ('proposal' as unknown) as Call,
    state: createMockProposalState(),
  };

  return createMockCodec(
    {
      ...proposal,
    },
    !pip
  ) as Pip;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipsMetadata = (metadata?: {
  proposer: AccountId;
  cool_off_until: u32;
  end: u32;
}): PipsMetadata => {
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
  ) as PipsMetadata;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecondaryKey = (secondaryKey?: {
  signer: Signatory;
  permissions: Permissions;
}): MeshSecondaryKey => {
  const key = secondaryKey || {
    signer: createMockSignatory(),
    permissions: createMockPermissions(),
  };
  return createMockCodec(
    {
      ...key,
    },
    !secondaryKey
  ) as MeshSecondaryKey;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipId = (id: number | BigNumber): PipId =>
  createMockU32(new BigNumber(id).toNumber()) as PipId;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueDetails = (details?: string): VenueDetails =>
  createMockStringCodec(details) as VenueDetails;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueType = (
  venueType?: 'Other' | 'Distribution' | 'Sto' | 'Exchange'
): VenueType => {
  return createMockEnum(venueType) as VenueType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenue = (venue?: {
  creator: IdentityId;
  instructions: u64[];
  details: VenueDetails;
  venue_type: VenueType;
}): Venue => {
  const vn = venue || {
    creator: createMockIdentityId(),
    instructions: [],
    details: createMockVenueDetails(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    venue_type: createMockVenueType(),
  };

  return createMockCodec(
    {
      ...vn,
    },
    !venue
  ) as Venue;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstructionStatus = (
  instructionStatus?: 'Pending' | 'Unknown' | 'Failed'
): InstructionStatus => {
  return createMockEnum(instructionStatus) as InstructionStatus;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSettlementType = (
  settlementType?: 'SettleOnAffirmation' | { SettleOnBlock: u32 }
): SettlementType => {
  return createMockEnum(settlementType) as SettlementType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAffirmationStatus = (
  authorizationStatus?: 'Unknown' | 'Pending' | 'Affirmed' | 'Rejected'
): AffirmationStatus => {
  return createMockEnum(authorizationStatus) as AffirmationStatus;
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
}): Instruction => {
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
  ) as Instruction;
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
): TransferManager => {
  if (isCodec<TransferManager>(transferManager)) {
    return transferManager;
  }
  return createMockEnum(transferManager) as TransferManager;
};

/**
 * @hidden
 */
export const createMockFundraiserTier = (fundraiserTier?: {
  total: Balance;
  price: Balance;
  remaining: Balance;
}): FundraiserTier => {
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
  ) as FundraiserTier;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserStatus = (
  fundraiserStatus?: 'Live' | 'Frozen' | 'Closed' | 'ClosedEarly'
): FundraiserStatus => {
  return createMockEnum(fundraiserStatus) as FundraiserStatus;
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
}): Fundraiser => {
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
  ) as Fundraiser;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPriceTier = (priceTier?: { total: Balance; price: Balance }): PriceTier => {
  const data = priceTier || {
    total: createMockBalance(),
    price: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !priceTier
  ) as PriceTier;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarUnit = (
  calendarUnit?: 'Second' | 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | CalendarUnit
): CalendarUnit => {
  if (isCodec<CalendarUnit>(calendarUnit)) {
    return calendarUnit;
  }

  return createMockEnum(calendarUnit) as CalendarUnit;
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
): CalendarPeriod => {
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
  ) as CalendarPeriod;
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
): CheckpointSchedule => {
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
  ) as CheckpointSchedule;
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
): StoredSchedule => {
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
  ) as StoredSchedule;
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
): ScheduleSpec => {
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
  ) as ScheduleSpec;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScalar = (scalar?: string | Scalar): Scalar => {
  if (!scalar || typeof scalar === 'string') {
    return createMockStringCodec(scalar) as Scalar;
  } else {
    return scalar;
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
): RecordDateSpec => {
  if (isCodec<RecordDateSpec>(recordDateSpec)) {
    return recordDateSpec;
  }

  return createMockEnum(recordDateSpec) as RecordDateSpec;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRistrettoPoint = (
  ristrettoPoint?: string | RistrettoPoint
): RistrettoPoint => {
  if (!ristrettoPoint || typeof ristrettoPoint === 'string') {
    return createMockStringCodec(ristrettoPoint) as RistrettoPoint;
  } else {
    return ristrettoPoint;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCACheckpoint = (
  caCheckpoint?: { Scheduled: [ScheduleId, u64] } | { Existing: CheckpointId } | CACheckpoint
): CACheckpoint => {
  if (isCodec<CACheckpoint>(caCheckpoint)) {
    return caCheckpoint;
  }

  return createMockEnum(caCheckpoint) as CACheckpoint;
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
): RecordDate => {
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
  ) as RecordDate;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignature = (signature?: string | Signature): Signature => {
  if (!signature || typeof signature === 'string') {
    return createMockStringCodec(signature) as Signature;
  } else {
    return signature;
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
): ZkProofData => {
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
  ) as ZkProofData;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetTreatment = (
  targetTreatment?: 'Include' | 'Exclude' | TargetTreatment
): TargetTreatment => {
  if (isCodec<TargetTreatment>(targetTreatment)) {
    return targetTreatment;
  }

  return createMockEnum(targetTreatment) as TargetTreatment;
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
): TargetIdentities => {
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
  ) as TargetIdentities;
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
): MeshScopeClaimProof => {
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
  ) as MeshScopeClaimProof;
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
): CAKind => {
  if (isCodec<CAKind>(caKind)) {
    return caKind;
  }

  return createMockEnum(caKind) as CAKind;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCorporateAction = (corporateAction?: {
  kind: CAKind | Parameters<typeof createMockCAKind>[0];
  decl_date: Moment | Parameters<typeof createMockMoment>[0];
  record_date: Option<RecordDate> | Parameters<typeof createMockOption>[0];
  details: Text | Parameters<typeof createMockText>[0];
  targets: TargetIdentities | Parameters<typeof createMockTargetIdentities>[0];
  default_withholding_tax: Tax | Parameters<typeof createMockPermill>[0];
  withholding_tax: [
    IdentityId | Parameters<typeof createMockIdentityId>[0],
    Tax | Parameters<typeof createMockPermill>[0]
  ][];
}): CorporateAction => {
  const {
    kind,
    decl_date,
    record_date,
    details,
    targets,
    default_withholding_tax,
    withholding_tax,
  } = corporateAction || {
    kind: createMockCAKind(),
    decl_date: createMockMoment(),
    record_date: createMockOption(),
    details: createMockText(),
    targets: createMockTargetIdentities(),
    default_withholding_tax: createMockPermill(),
    withholding_tax: [],
  };

  return createMockCodec(
    {
      kind: createMockCAKind(kind),
      decl_date: createMockMoment(decl_date),
      record_date: createMockOption(record_date),
      details: createMockText(details),
      targets: createMockTargetIdentities(targets),
      default_withholding_tax: createMockPermill(default_withholding_tax),
      withholding_tax: withholding_tax.map(([identityId, tax]) =>
        tuple(createMockIdentityId(identityId), createMockPermill(tax))
      ),
    },
    !corporateAction
  ) as CorporateAction;
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
): CAId => {
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
  ) as CAId;
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
}): Distribution => {
  const {
    from,
    currency,
    per_share,
    amount,
    remaining,
    reclaimed,
    payment_at,
    expires_at,
  } = distribution || {
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
  ) as Distribution;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferManagerResult = (transferManagerResult?: {
  tm: TransferManager | Parameters<typeof createMockTransferManager>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): TransferManagerResult => {
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
  ) as TransferManagerResult;
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
}): PortfolioValidityResult => {
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
  ) as PortfolioValidityResult;
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
}): GranularCanTransferResult => {
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
  ) as GranularCanTransferResult;
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
): ClassicTickerRegistration => {
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
  ) as ClassicTickerRegistration;
};
