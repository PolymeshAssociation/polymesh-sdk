/* istanbul ignore file */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise, Keyring } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import { bool, Bytes, Compact, Enum, Option, Text, u8, U8aFixed, u32, u64 } from '@polkadot/types';
import { CompactEncodable } from '@polkadot/types/codec/Compact';
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
  RefCount,
  RuntimeVersion,
} from '@polkadot/types/interfaces';
import { Call } from '@polkadot/types/interfaces/runtime';
import { Codec, ISubmittableResult, Registry } from '@polkadot/types/types';
import { stringToU8a } from '@polkadot/util';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { BigNumber } from 'bignumber.js';
import { EventEmitter } from 'events';
import { cloneDeep, merge, upperFirst } from 'lodash';
import {
  AssetComplianceResult,
  AssetIdentifier,
  AssetName,
  AssetOwnershipRelation,
  AssetType,
  AuthIdentifier,
  Authorization,
  AuthorizationData,
  AuthorizationStatus,
  AuthorizationType as MeshAuthorizationType,
  CanTransferResult,
  CddId,
  CddStatus,
  Claim,
  ComplianceRequirement,
  ComplianceRequirementResult,
  Condition,
  ConditionType,
  CountryCode,
  DidRecord,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentityId,
  IdentityRole,
  Instruction,
  InstructionStatus,
  IssueAssetItem,
  LinkedKeyInfo,
  Permission,
  Pip,
  PipId,
  PipsMetadata,
  PortfolioId,
  PortfolioKind,
  PosRatio,
  ProposalState,
  Scope,
  SecondaryKey as MeshSecondaryKey,
  SecurityToken,
  SettlementType,
  Signatory,
  TargetIdentity,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
  VenueDetails,
  VenueType,
} from 'polymesh-types/types';
import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import { AuthorizationRequest, Identity } from '~/api/entities';
import { Context } from '~/base';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  ClaimData,
  ClaimType,
  CountryCode as CountryCodeEnum,
  ExtrinsicData,
  KeyringPair,
  ResultSet,
  SecondaryKey,
} from '~/types';
import { Extrinsics, GraphqlQuery, PolymeshTx, Queries } from '~/types/internal';
import { Mutable } from '~/types/utils';

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
  } as Mutable<ApiPromise> & EventEmitter;
}

let apolloConstructorStub: SinonStub;

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
  apolloInstance: {} as ApolloClient<NormalizedCacheObject>,
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

interface ContextOptions {
  did?: string;
  withSeed?: boolean;
  balance?: AccountBalance;
  hasRoles?: boolean;
  validCdd?: boolean;
  tokenBalance?: BigNumber;
  invalidDids?: string[];
  transactionFee?: BigNumber;
  currentPairAddress?: string;
  issuedClaims?: ResultSet<ClaimData>;
  primaryKey?: string;
  secondaryKeys?: SecondaryKey[];
  transactionHistory?: ResultSet<ExtrinsicData>;
  latestBlock?: BigNumber;
  middlewareEnabled?: boolean;
  middlewareAvailable?: boolean;
  sentAuthorizations?: ResultSet<AuthorizationRequest>;
  isArchiveNode?: boolean;
}

interface Pair {
  address: string;
  meta: object;
  publicKey: string;
}

interface KeyringOptions {
  getPair?: Pair;
  getPairs?: Pair[];
  addFromUri?: Pair;
  addFromSeed?: Pair;
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

export type MockContext = Mocked<Context>;

export enum MockTxStatus {
  Ready = 'Ready',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Aborted = 'Aborted',
  Rejected = 'Rejected',
  Intermediate = 'Intermediate',
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

const successReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: true, asInBlock: 'blockHash' },
  isCompleted: true,
  isInBlock: true,
});

/**
 * @hidden
 */
const createFailReceipt = (err: Partial<DispatchError>): ISubmittableResult =>
  merge({}, successReceipt, {
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

/**
 * @hidden
 */
const statusToReceipt = (status: MockTxStatus, failReason?: TxFailReason): ISubmittableResult => {
  if (status === MockTxStatus.Aborted) {
    return abortReceipt;
  }
  if (status === MockTxStatus.Failed) {
    if (!failReason || failReason === TxFailReason.Module) {
      return moduleFailReceipt;
    }

    if (failReason === TxFailReason.BadOrigin) {
      return badOriginFailReceipt;
    }

    if (failReason === TxFailReason.CannotLookup) {
      return cannotLookupFailReceipt;
    }

    if (failReason === TxFailReason.Other) {
      return otherFailReceipt;
    }
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

  throw new Error(`There is no receipt associated with status ${status}`);
};

export const mockPolkadotModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  ApiPromise: MockApiPromiseClass,
  WsProvider: MockWsProviderClass,
  Keyring: MockKeyringClass,
});

export const mockContextModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Context: MockContextClass,
});

export const mockApolloModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  ApolloClient: MockApolloClientClass,
});

const txMocksData = new Map<unknown, TxMockData>();
let txModule = {} as Extrinsics;
let queryModule = {} as Queries;

// TODO cast rpcModule to a better type
let rpcModule = {} as any;

let queryMultiStub = sinon.stub();

const defaultContextOptions: ContextOptions = {
  did: 'someDid',
  withSeed: true,
  balance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
  },
  hasRoles: true,
  validCdd: true,
  tokenBalance: new BigNumber(1000),
  invalidDids: [],
  transactionFee: new BigNumber(200),
  currentPairAddress: '0xdummy',
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
};
let contextOptions: ContextOptions = defaultContextOptions;
const defaultKeyringOptions: KeyringOptions = {
  getPair: { address: 'address', meta: {}, publicKey: 'publicKey1' },
  getPairs: [{ address: 'address', meta: {}, publicKey: 'publicKey2' }],
  addFromSeed: { address: 'address', meta: {}, publicKey: 'publicKey3' },
  addFromUri: { address: 'address', meta: {}, publicKey: 'publicKey4' },
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
    hasValidCdd: sinon.stub().resolves(opts.validCdd),
    getTokenBalance: sinon.stub().resolves(opts.tokenBalance),
    getPrimaryKey: sinon.stub().resolves(opts.primaryKey),
    getSecondaryKeys: sinon.stub().resolves(opts.secondaryKeys),
    authorizations: {
      getSent: sinon.stub().resolves(opts.sentAuthorizations),
    },
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
      })
    : getCurrentAccount.throws(new Error('There is no account associated with the SDK'));
  const currentPair = opts.withSeed
    ? ({
        address: opts.currentPairAddress,
        isLocked: false,
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
    getAccounts: sinon.stub().returns([]),
    setPair: sinon.stub().callsFake(address => {
      contextInstance.currentPair = { address } as KeyringPair;
    }),
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
    getLatestBlock: sinon.stub().resolves(opts.latestBlock),
    isMiddlewareEnabled: sinon.stub().returns(opts.middlewareEnabled),
    isMiddlewareAvailable: sinon.stub().resolves(opts.middlewareAvailable),
    isArchiveNode: opts.isArchiveNode,
  } as unknown) as MockContext;

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
  initQueryMulti();

  apiPromiseCreateStub = sinon.stub();
  MockApiPromiseClass.create = apiPromiseCreateStub.resolves(mockInstanceContainer.apiInstance);
}

/**
 * @hidden
 */
function configureKeyring(opts: KeyringOptions): void {
  const { error, getPair, getPairs, addFromUri, addFromSeed } = opts;

  const err = new Error('Error');

  const keyringInstance = {
    getPair: sinon.stub().returns(getPair),
    getPairs: sinon.stub().returns(getPairs),
    addFromSeed: sinon.stub().returns(addFromSeed),
    addFromUri: sinon.stub().returns(addFromUri),
  };

  if (error) {
    keyringInstance.getPair.throws(err);
    keyringInstance.getPairs.throws(err);
    keyringInstance.addFromSeed.throws(err);
    keyringInstance.addFromUri.throws(err);
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
  mockInstanceContainer.apolloInstance = {} as ApolloClient<NormalizedCacheObject>;
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

  const transactionMock = (instance.tx[mod][tx] as unknown) as PolymeshTx<
    ArgsType<Extrinsics[ModuleName][TransactionName]>
  > &
    SinonStub;

  return transactionMock;
}

/**
 * @hidden
 * Create and return an apollo query stub
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloQueryStub(query: GraphqlQuery<any>, returnData: any): SinonStub {
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

  let stub: Queries[ModuleName][QueryName] & SinonStub & StubQuery;

  if (!runtimeModule[query]) {
    stub = (sinon.stub() as unknown) as Queries[ModuleName][QueryName] & SinonStub & StubQuery;
    stub.entries = sinon.stub();
    stub.entriesPaged = sinon.stub();
    stub.at = sinon.stub();
    stub.multi = sinon.stub();
    stub.size = sinon.stub();
    runtimeModule[query] = stub;

    updateQuery();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    stub = instance.query[mod][query] as Queries[ModuleName][QueryName] & SinonStub & StubQuery;
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
  if (opts?.size) {
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
export function throwOnMiddlewareQuery(err?: object): void {
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
export function getMiddlewareApi(): ApolloClient<NormalizedCacheObject> {
  return mockInstanceContainer.apolloInstance;
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
    initContext(opts);
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
export function getKeyringInstance(opts?: KeyringOptions): Keyring {
  if (opts) {
    initKeyring(opts);
  }
  return mockInstanceContainer.keyringInstance as Keyring;
}

// TODO @monitz87: make struct making functions behave like `createMockDidRecord`

/**
 * @hidden
 */
const createMockCodec = (codec: object, isEmpty: boolean): Codec => {
  const clone = cloneDeep(codec) as Mutable<Codec>;
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
const createMockU8ACodec = (value?: string): Codec =>
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
export const createMockIdentityId = (did?: string): IdentityId =>
  createMockStringCodec(did) as IdentityId;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTicker = (ticker?: string): Ticker => createMockU8ACodec(ticker) as Ticker;

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
export const createMockBalance = (balance?: number): Balance =>
  createMockNumberCodec(balance) as Balance;

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
export const createMockOption = <T extends Codec>(wrapped: T | null = null): Option<T> =>
  createMockCodec(
    {
      unwrap: () => wrapped as T,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  ) as Option<T>;

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
export const createMockMoment = (millis?: number): Moment =>
  createMockNumberCodec(millis) as Moment;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistration = (registration?: {
  owner: IdentityId;
  expiry: Option<Moment>;
}): TickerRegistration => {
  const reg = registration || {
    owner: createMockIdentityId(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      ...reg,
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
export const createMockU32 = (value?: number): u32 => createMockNumberCodec(value) as u32;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU64 = (value?: number): u64 => createMockNumberCodec(value) as u64;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBytes = (value?: string): Bytes => createMockU8ACodec(value) as Bytes;

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
export const createMockBool = (value?: boolean): bool =>
  createMockCodec(
    {
      isTrue: value,
      isFalse: !value,
      valueOf: () => value,
    },
    !value
  ) as bool;

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
  portfolioKind?: 'Default' | { User: u64 }
): PortfolioKind => {
  return createMockEnum(portfolioKind) as PortfolioKind;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioId = (portfiolioId?: {
  did: IdentityId;
  kind: PortfolioKind;
}): PortfolioId => {
  const id = portfiolioId || {
    did: createMockIdentityId(),
    kind: createMockPortfolioKind(),
  };
  return createMockCodec(
    {
      ...id,
    },
    !portfiolioId
  ) as PortfolioId;
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
  primary_issuance_agent: Option<IdentityId>;
}): SecurityToken => {
  const st = token || {
    name: createMockAssetName(),
    total_supply: createMockBalance(),
    owner_did: createMockIdentityId(),
    divisible: createMockBool(),
    asset_type: createMockAssetType(),
    primary_issuance_agent: createMockOption(createMockIdentityId()),
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
}): Document => {
  const doc = document || {
    uri: createMockDocumentUri(),
    content_hash: createMockDocumentHash(),
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
export const createMockAuthIdentifier = (authIdentifier?: {
  signatory: Signatory;
  auth_id: u64;
}): AuthIdentifier => {
  const identifier = authIdentifier || {
    signatory: createMockSignatory(),
    auth_id: createMockU64(),
  };

  return createMockCodec(
    {
      ...identifier,
    },
    !authIdentifier
  ) as AuthIdentifier;
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
  createMockU8ACodec(value) as U8aFixed;

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
export const createMockPermission = (
  permission: 'Admin' | 'Full' | 'Operator' | 'SpendFunds'
): Permission => {
  return createMockEnum(permission) as Permission;
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
    | { JoinIdentity: Permission[] }
    | { TransferPrimaryIssuanceAgent: Ticker }
    | { PortfolioCustody: PortfolioId }
    | { custom: Bytes }
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
export const createMockLinkedKeyInfo = (
  linkedKeyInfo?: { Unique: IdentityId } | { Group: IdentityId[] }
): LinkedKeyInfo => createMockEnum(linkedKeyInfo) as LinkedKeyInfo;

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
    | 'NoData'
): Claim => createMockEnum(claim) as Claim;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentity = (
  targetIdentity?: { Specific: IdentityId } | 'PrimaryIssuanceAgent'
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
): ConditionType => createMockEnum(conditionType) as ConditionType;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCondition = (condition?: {
  condition_type: ConditionType;
  issuers: IdentityId[];
}): Condition => {
  const auxCondition = condition || {
    condition_type: createMockConditionType(),
    issuers: [],
  };
  return createMockCodec(
    {
      ...auxCondition,
    },
    !condition
  ) as Condition;
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
  sender_conditions: Condition[];
  receiver_conditions: Condition[];
  id: u32;
  result: bool;
}): ComplianceRequirementResult => {
  const result = complianceRequirementResult || {
    sender_conditions: [],
    receiver_conditions: [],
    id: createMockU32(),
    result: createMockBool(),
  };

  return createMockCodec(
    {
      ...result,
    },
    !complianceRequirementResult
  ) as ComplianceRequirementResult;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetComplianceResult = (assetComplianceResult?: {
  paused: bool;
  requirements: ComplianceRequirementResult[];
  result: bool;
}): AssetComplianceResult => {
  const result = assetComplianceResult || {
    paused: createMockBool(),
    requirements: createMockComplianceRequirementResult(),
    result: createMockBool(),
  };

  return createMockCodec(
    {
      ...result,
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
export const createMockText = (value: string): Text => createMockStringCodec(value) as Text;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetOwnershipRelation = (
  assetOwnershipRelation?: 'NotOwned' | 'TickerOwned' | 'AssetOwned'
): AssetOwnershipRelation => createMockEnum(assetOwnershipRelation) as AssetOwnershipRelation;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIssueAssetItem = (issueAssetItem?: {
  identity_did: IdentityId;
  value: Balance;
}): IssueAssetItem => {
  const item = issueAssetItem || {
    identity_did: createMockIdentityId(),
    value: createMockBalance(),
  };

  return createMockCodec(
    {
      ...item,
    },
    !issueAssetItem
  ) as IssueAssetItem;
};

/**
 * @hidden
 */
export const setRuntimeVersion = (args: unknown): void => {
  mockInstanceContainer.apiInstance.runtimeVersion = args as RuntimeVersion;
};

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
  permissions: Permission[];
}): MeshSecondaryKey => {
  const key = secondaryKey || {
    signer: createMockSignatory(),
    permissions: [],
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
export const createMockInstructionStatus = (
  instructionStatus?: 'Pending' | 'Unknown'
): InstructionStatus => {
  return createMockEnum(instructionStatus) as InstructionStatus;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSettlementType = (
  settlementType?: 'SettleOnAuthorization' | { SettleOnBlock: u32 }
): SettlementType => {
  return createMockEnum(settlementType) as SettlementType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationStatus = (
  authorizationStatus?: 'Unknown' | 'Pending' | 'Authorized' | 'Rejected'
): AuthorizationStatus => {
  return createMockEnum(authorizationStatus) as AuthorizationStatus;
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
  valid_from: Option<Moment>;
}): Instruction => {
  const data = instruction || {
    instruction_id: createMockU64(),
    venue_id: createMockU64(),
    status: createMockInstructionStatus(),
    settlement_type: createMockSettlementType(),
    created_at: createMockOption(),
    valid_from: createMockOption(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !instruction
  ) as Instruction;
};
