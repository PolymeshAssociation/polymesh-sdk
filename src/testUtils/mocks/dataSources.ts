/* istanbul ignore file */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise, Keyring } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import { bool, Bytes, Enum, Option, Text, u8, u32, u64 } from '@polkadot/types';
import {
  AccountData,
  AccountId,
  AccountInfo,
  Balance,
  DispatchError,
  DispatchErrorModule,
  EventRecord,
  ExtrinsicStatus,
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
import { cloneDeep, every, merge, upperFirst } from 'lodash';
import {
  AccountKey,
  AssetIdentifier,
  AssetName,
  AssetTransferRule,
  AssetTransferRuleResult,
  AssetTransferRulesResult,
  AssetType,
  AuthIdentifier,
  Authorization,
  AuthorizationData,
  CanTransferResult,
  CddStatus,
  Claim,
  DidRecord,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  IdentityRole,
  JurisdictionName,
  Link,
  LinkData,
  LinkedKeyInfo,
  Permission,
  Pip,
  PipsMetadata,
  PosRatio,
  ProposalState,
  Rule,
  RuleType,
  Scope,
  SecurityToken,
  Signatory,
  SignatoryType,
  SigningItem,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
} from 'polymesh-types/types';
import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import { Context } from '~/context';
import { Mocked } from '~/testUtils/types';
import { AccountBalance, KeyringPair, SignerType } from '~/types';
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

const apolloConstructorStub = sinon.stub();

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
  apolloInstance: new MockApolloClientClass() as ApolloClient<NormalizedCacheObject>,
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
  opts.withSeed
    ? getCurrentIdentity.returns({
        getPolyXBalance: sinon.stub().resolves(opts.balance),
        did: opts.did,
        hasRoles: sinon.stub().resolves(opts.hasRoles),
        hasValidCdd: sinon.stub().resolves(opts.validCdd),
        getTokenBalance: sinon.stub().resolves(opts.tokenBalance),
      })
    : getCurrentIdentity.throws(
        new Error('The current account does not have an associated identity')
      );
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
    getSigningKeys: sinon.stub().returns(
      opts.withSeed
        ? [
            {
              type: SignerType.AccountKey,
              value: opts.currentPairAddress,
            },
          ]
        : []
    ),
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
  mockInstanceContainer.apolloInstance = new MockApolloClientClass() as ApolloClient<
    NormalizedCacheObject
  >;
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

  if (opts?.entries) {
    const entryResults = opts.entries.map(([keys, value], index) => [
      { args: keys, toHex: (): string => `key${index}` },
      value,
    ]);
    stub.entries.resolves(entryResults);
    stub.entriesPaged.resolves(entryResults);
  }
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
export function throwOnMiddlewareQuery(): void {
  const instance = mockInstanceContainer.apolloInstance;
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
export const createMockAccountKey = (accountKey?: string): AccountKey =>
  createMockU8ACodec(accountKey) as AccountKey;

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
export const createMockMoment = (millis?: number): Moment =>
  createMockNumberCodec(millis) as Moment;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistration = (
  reg: { owner: IdentityId; expiry: Option<Moment> } = {
    owner: createMockIdentityId(),
    expiry: createMockOption(),
  }
): TickerRegistration =>
  createMockCodec(
    {
      owner: reg.owner,
      expiry: reg.expiry,
    },
    reg.owner.isEmpty && reg.expiry.isEmpty
  ) as TickerRegistration;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8 = (value?: number): u8 => createMockNumberCodec(value) as u8;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU32 = (value?: number): u8 => createMockNumberCodec(value) as u32;

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
export const createMockLinkData = (
  linkData?: { DocumentOwned: Document } | { TickerOwned: Ticker } | { AssetOwned: Ticker }
): LinkData => {
  return createMockEnum(linkData) as LinkData;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistrationConfig = (
  regConfig: { max_ticker_length: u8; registration_length: Option<Moment> } = {
    max_ticker_length: createMockU8(),
    registration_length: createMockOption(),
  }
): TickerRegistrationConfig =>
  createMockCodec(
    regConfig,
    regConfig.max_ticker_length.isEmpty && regConfig.registration_length.isEmpty
  ) as TickerRegistrationConfig;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecurityToken = (
  token: {
    name: AssetName;
    total_supply: Balance;
    owner_did: IdentityId;
    divisible: bool;
    asset_type: AssetType;
    link_id: u64;
  } = {
    name: createMockAssetName(),
    total_supply: createMockBalance(),
    owner_did: createMockIdentityId(),
    divisible: createMockBool(),
    asset_type: createMockAssetType(),
    link_id: createMockU64(),
  }
): SecurityToken =>
  createMockCodec(
    token,
    every(token, val => val.isEmpty)
  ) as SecurityToken;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockLink = (
  link: { link_data: LinkData; expiry: Option<Moment>; link_id: u64 } = {
    link_data: createMockLinkData(),
    expiry: createMockOption(),
    link_id: createMockU64(),
  }
): Link =>
  createMockCodec(
    {
      link_data: link.link_data,
      expiry: link.expiry,
      link_id: link.link_id,
    },
    false
  ) as Link;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocument = (
  document: { name: DocumentName; uri: DocumentUri; content_hash: DocumentHash } = {
    name: createMockDocumentName(),
    uri: createMockDocumentUri(),
    content_hash: createMockDocumentHash(),
  }
): Document =>
  createMockCodec(
    {
      name: document.name,
      uri: document.uri,
      content_hash: document.content_hash,
    },
    false
  ) as Document;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountData = (
  accountData: { free: Balance; reserved: Balance; miscFrozen: Balance; feeFrozen: Balance } = {
    free: createMockBalance(),
    reserved: createMockBalance(),
    miscFrozen: createMockBalance(),
    feeFrozen: createMockBalance(),
  }
): AccountData =>
  createMockCodec(
    {
      free: accountData.free,
      reserved: accountData.reserved,
      miscFrozen: accountData.miscFrozen,
      feeFrozen: accountData.feeFrozen,
    },
    false
  ) as AccountData;

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
export const createMockAccountInfo = (
  accountInfo: { nonce: Index; refcount: RefCount; data: AccountData } = {
    nonce: createMockIndex(),
    refcount: createMockRefCount(),
    data: createMockAccountData(),
  }
): AccountInfo =>
  createMockCodec(
    {
      nonce: accountInfo.nonce,
      refcount: accountInfo.refcount,
      data: accountInfo.data,
    },
    false
  ) as AccountInfo;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatory = (
  signatory?: { Identity: IdentityId } | { AccountKey: AccountKey }
): Signatory => {
  return createMockEnum(signatory) as Signatory;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthIdentifier = (
  authIdentifier: { signatory: Signatory; auth_id: u64 } = {
    signatory: createMockSignatory(),
    auth_id: createMockU64(),
  }
): AuthIdentifier =>
  createMockCodec(
    {
      signatory: authIdentifier.signatory,
      auth_id: authIdentifier.auth_id,
    },
    false
  ) as AuthIdentifier;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentifierType = (
  identifierType?: 'Isin' | 'Cusip' | 'Cins'
): IdentifierType => {
  return createMockEnum(identifierType) as IdentifierType;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetIdentifier = (identifier?: string): AssetIdentifier =>
  createMockStringCodec(identifier) as AssetIdentifier;

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
export const createMockAuthorizationData = (
  authorizationData?:
    | { AttestMasterKeyRotation: IdentityId }
    | { RotateMasterKey: IdentityId }
    | { TransferTicker: Ticker }
    | 'AddMultiSigSigner'
    | { TransferAssetOwnership: Ticker }
    | { JoinIdentity: IdentityId }
    | { custom: Bytes }
    | 'NoData'
): AuthorizationData => {
  return createMockEnum(authorizationData) as AuthorizationData;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorization = (
  authorization: {
    authorization_data: AuthorizationData;
    authorized_by: Signatory;
    expiry: Option<Moment>;
    auth_id: u64;
  } = {
    authorization_data: createMockAuthorizationData(),
    authorized_by: createMockSignatory(),
    expiry: createMockOption(),
    auth_id: createMockU64(),
  }
): Authorization =>
  createMockCodec(
    {
      authorization_data: authorization.authorization_data,
      authorized_by: authorization.authorized_by,
      expiry: authorization.expiry,
      auth_id: authorization.auth_id,
    },
    false
  ) as Authorization;

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
export const createMockJurisdictionName = (name?: string): JurisdictionName =>
  createMockStringCodec(name) as JurisdictionName;

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
    | 'CustomerDueDiligence'
    | { KnowYourCustomer: Scope }
    | { Jurisdiction: [JurisdictionName, Scope] }
    | { Exempted: Scope }
    | { Blocked: Scope }
    | 'NoData'
): Claim => createMockEnum(claim) as Claim;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRuleType = (
  ruleType?:
    | { IsPresent: Claim }
    | { IsAbsent: Claim }
    | { IsAnyOf: Claim[] }
    | { IsNoneOf: Claim[] }
): RuleType => createMockEnum(ruleType) as RuleType;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRule = (
  rule: { rule_type: RuleType; issuers: IdentityId[] } = {
    rule_type: createMockRuleType(),
    issuers: [],
  }
): Rule =>
  createMockCodec(
    {
      rule_type: rule.rule_type,
      issuers: rule.issuers,
    },
    false
  ) as Rule;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetTransferRule = (
  assetTransferRule: { sender_rules: Rule[]; receiver_rules: Rule[]; rule_id: u32 } = {
    sender_rules: [],
    receiver_rules: [],
    rule_id: createMockU32(),
  }
): AssetTransferRule =>
  createMockCodec(
    {
      sender_rules: assetTransferRule.sender_rules,
      receiver_rules: assetTransferRule.receiver_rules,
      rule_id: assetTransferRule.rule_id,
    },
    false
  ) as AssetTransferRule;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetTransferRuleResult = (
  assetTransferRuleResult: {
    sender_rules: Rule[];
    receiver_rules: Rule[];
    rule_id: u32;
    transfer_rule_result: bool;
  } = {
    sender_rules: [],
    receiver_rules: [],
    rule_id: createMockU32(),
    transfer_rule_result: createMockBool(),
  }
): AssetTransferRuleResult =>
  createMockCodec(
    {
      sender_rules: assetTransferRuleResult.sender_rules,
      receiver_rules: assetTransferRuleResult.receiver_rules,
      rule_id: assetTransferRuleResult.rule_id,
      transfer_rule_result: assetTransferRuleResult.transfer_rule_result,
    },
    false
  ) as AssetTransferRuleResult;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetTransferRulesResult = (assetTransferRulesResult: {
  is_paused: bool;
  rules: AssetTransferRuleResult[];
  final_result: bool;
}): AssetTransferRulesResult =>
  createMockCodec(
    {
      is_paused: assetTransferRulesResult.is_paused,
      rules: assetTransferRulesResult.rules,
      final_result: assetTransferRulesResult.final_result,
    },
    false
  ) as AssetTransferRulesResult;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatoryType = (
  signatoryType?: 'External' | 'Identity' | 'Multisig' | 'Relayer'
): SignatoryType => createMockEnum(signatoryType) as SignatoryType;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSigningItem = (
  signingItem: { signer: Signatory; signer_type: SignatoryType; permissions: Permission[] } = {
    signer: createMockSignatory(),
    signer_type: createMockSignatoryType(),
    permissions: [],
  }
): SigningItem =>
  createMockCodec(
    {
      signer: signingItem.signer,
      signer_type: signingItem.signer_type,
      permissions: signingItem.permissions,
    },
    false
  ) as SigningItem;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDidRecord = (didRecord?: {
  roles: IdentityRole[];
  master_key: AccountKey;
  signing_items: SigningItem[];
}): DidRecord => {
  const { roles, master_key, signing_items } = didRecord || {
    roles: [],
    master_key: createMockAccountKey(),
    signing_items: [],
  };

  return createMockCodec(
    {
      roles,
      master_key,
      signing_items,
    },
    !didRecord
  ) as DidRecord;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScope = (did?: string): Scope => createMockStringCodec(did) as Scope;

/**
 * @hidden
 */
export const createMockCanTransferResult = (
  canTransferResult?: { Ok: u8 } | { Err: Bytes }
): CanTransferResult => createMockEnum(canTransferResult) as CanTransferResult;

/**
 * @hidden
 */
export const setRuntimeVersion = (args: unknown): void => {
  mockInstanceContainer.apiInstance.runtimeVersion = args as RuntimeVersion;
};

export const createMockText = (value: string): Text => createMockStringCodec(value) as Text;

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
export const createMockPip = (
  pip: { id: u32; proposal: Call; state: ProposalState } = {
    id: createMockU32(),
    proposal: ('proposal' as unknown) as Call,
    state: createMockProposalState(),
  }
): Pip =>
  createMockCodec(
    {
      id: pip.id,
      proposal: pip.proposal,
      state: pip.state,
    },
    false
  ) as Pip;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalMetadata = (
  metadata: { proposer: AccountKey; cool_off_until: u32; end: u32 } = {
    proposer: createMockAccountKey(),
    cool_off_until: createMockU32(),
    end: createMockU32(),
  }
): PipsMetadata =>
  createMockCodec(
    {
      proposer: metadata.proposer,
      cool_off_until: metadata.cool_off_until,
      end: metadata.end,
    },
    false
  ) as PipsMetadata;
