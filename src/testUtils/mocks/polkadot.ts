/* istanbul ignore file */

import { ApiPromise, Keyring } from '@polkadot/api';
import { bool, Bytes, Enum, Option, u8, u64 } from '@polkadot/types';
import {
  Balance,
  DispatchError,
  DispatchErrorModule,
  EventRecord,
  ExtrinsicStatus,
  Moment,
} from '@polkadot/types/interfaces';
import { Codec, IKeyringPair, ISubmittableResult, Registry } from '@polkadot/types/types';
import { BigNumber } from 'bignumber.js';
import { every, merge, startCase } from 'lodash';
import {
  AssetType,
  IdentityId,
  SecurityToken,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
  TokenName,
} from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Context } from '~/context';
import { Mocked } from '~/testUtils/types';
import { Extrinsics, PolymeshTx, Queries } from '~/types/internal';
import { Mutable } from '~/types/utils';

const mockInstanceContainer = {
  contextInstance: {} as MockContext,
  apiInstance: {} as Mutable<ApiPromise>,
  keyringInstance: {} as Mutable<Keyring>,
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

let createErrStub: SinonStub;

type StatusCallback = (receipt: ISubmittableResult) => void;
type UnsubCallback = () => void;

interface TxMockData {
  statusCallback: StatusCallback;
  unsubCallback: UnsubCallback;
  status: MockTxStatus;
  resolved: boolean;
}

interface ContextOptions {
  withSeed?: boolean;
  balance?: BigNumber;
}

interface Pair {
  address: string;
  meta: object;
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

type MockContext = Mocked<Context>;

export enum MockTxStatus {
  Ready = 'Ready',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Aborted = 'Aborted',
  Rejected = 'Rejected',
  InBlock = 'InBlock',
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
  events: [],
  toHuman: () => ({}),
};

const inBlockReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: false, asInBlock: 'blockHash' },
  isCompleted: true,
  isInBlock: true,
});

const successReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isFinalized: true, asFinalized: 'blockHash' },
  isCompleted: true,
  isFinalized: true,
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
  if (status === MockTxStatus.InBlock) {
    return inBlockReceipt;
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

const txMocksData = new Map<unknown, TxMockData>();
let txModule = {} as Extrinsics;
let queryModule = {} as Queries;
const defaultContextOptions: ContextOptions = {
  withSeed: true,
  balance: new BigNumber(100),
};
let contextOptions: ContextOptions = defaultContextOptions;
const defaultKeyringOptions: KeyringOptions = {
  getPair: { address: 'address', meta: {} },
  getPairs: [{ address: 'address', meta: {} }],
  addFromSeed: { address: 'address', meta: {} },
  addFromUri: { address: 'address', meta: {} },
};
let keyringOptions: KeyringOptions = defaultKeyringOptions;

/**
 * @hidden
 */
function initContext(opts: ContextOptions): void {
  contextCreateStub = sinon.stub();

  const currentIdentity = opts.withSeed
    ? { getPolyXBalance: sinon.stub().resolves(opts.balance) }
    : undefined;
  const currentPair = opts.withSeed
    ? ({
        address: '0xdummy',
      } as IKeyringPair)
    : undefined;

  const contextInstance = ({
    currentPair,
    currentIdentity,
    accountBalance: sinon.stub().resolves(opts.balance),
    getAccounts: sinon.stub().returns([]),
    setPair: sinon.stub().callsFake(address => {
      contextInstance.currentPair = { address } as IKeyringPair;
    }),
    polymeshApi: mockInstanceContainer.apiInstance,
  } as unknown) as MockContext;

  mockInstanceContainer.contextInstance = contextInstance;

  MockContextClass.create = contextCreateStub.resolves(contextInstance);
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
  const queryModule = {} as Queries;

  updateQuery(queryModule);
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
 *
 * Mock the tx module
 */
function initTx(): void {
  const txModule = {} as Extrinsics;

  updateTx(txModule);
}

/**
 * @hidden
 */
function initApi(): void {
  mockInstanceContainer.apiInstance.registry = ('registry' as unknown) as Registry;

  initTx();
  initQuery();

  apiPromiseCreateStub = sinon.stub();
  MockApiPromiseClass.create = apiPromiseCreateStub.resolves(mockInstanceContainer.apiInstance);
}

/**
 * @hidden
 */
function initKeyring(opts: KeyringOptions): void {
  keyringConstructorStub = sinon.stub();

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

  mockInstanceContainer.keyringInstance = (keyringInstance as unknown) as Keyring;

  keyringConstructorStub.returns(keyringInstance);
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
  contextOptions = { ...defaultContextOptions, ...opts?.contextOptions };
  initContext(contextOptions);

  // Api
  initApi();

  // Keyring
  keyringOptions = { ...defaultKeyringOptions, ...opts?.keyringOptions };
  initKeyring(keyringOptions);

  txMocksData.clear();
  createErrStub = sinon.stub().throws(new Error('Error'));
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.apiInstance = {} as Mutable<ApiPromise>;
  mockInstanceContainer.contextInstance = {} as MockContext;
  mockInstanceContainer.keyringInstance = {} as Mutable<Keyring>;
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
  autoresolve: MockTxStatus | false = MockTxStatus.Succeeded
): PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>> &
  SinonStub<ArgsType<Extrinsics[ModuleName][TransactionName]>> {
  let runtimeModule = txModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Extrinsics[ModuleName];
    txModule[mod] = runtimeModule;
  }

  runtimeModule[tx] = (sinon.stub().returns({
    section: mod,
    method: tx,
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
  }) as unknown) as Extrinsics[ModuleName][TransactionName];

  updateTx();

  const instance = mockInstanceContainer.apiInstance;

  const transactionMock = (instance.tx[mod][tx] as unknown) as PolymeshTx<
    ArgsType<Extrinsics[ModuleName][TransactionName]>
  > &
    SinonStub<ArgsType<Extrinsics[ModuleName][TransactionName]>>;

  return transactionMock;
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
  QueryName extends keyof Queries[ModuleName],
  ReturnValue extends unknown
>(
  mod: ModuleName,
  query: QueryName,
  returnValue?: ReturnValue
): Queries[ModuleName][QueryName] & SinonStub<ArgsType<Queries[ModuleName][QueryName]>> {
  let runtimeModule = queryModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Queries[ModuleName];
    queryModule[mod] = runtimeModule;
  }

  if (!runtimeModule[query]) {
    runtimeModule[query] = (sinon.stub() as unknown) as Queries[ModuleName][QueryName];

    updateQuery();
  }

  const instance = mockInstanceContainer.apiInstance;

  const stub = instance.query[mod][query] as Queries[ModuleName][QueryName] &
    SinonStub<ArgsType<Queries[ModuleName][QueryName]>>;

  if (returnValue) {
    stub.returns(returnValue);
  }

  return stub;
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
 * Make calls to `Context.create` throw an error
 */
export function throwOnContextCreation(): void {
  MockContextClass.create = createErrStub;
}

/**
 * @hidden
 * Make calls to `ApiPromise.create` throw an error
 */
export function throwOnApiCreation(): void {
  MockApiPromiseClass.create = createErrStub;
}

/**
 * @hidden
 * Sets the `accountBalance` function in the mocked Context to return the specified amount
 *
 * @param balance - new account balance
 */
export function setContextAccountBalance(balance: BigNumber): void {
  mockInstanceContainer.contextInstance.accountBalance.returns(balance);
}

/**
 * @hidden
 * Retrieve an instance of the mocked Polkadot API
 */
export function getApiInstance(): ApiPromise {
  return mockInstanceContainer.apiInstance as ApiPromise;
}

/**
 * @hidden
 * Retrieve an instance of the mocked Context
 */
export function getContextInstance(): MockContext {
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
export function getKeyringInstance(): Keyring {
  return mockInstanceContainer.keyringInstance as Keyring;
}

/**
 * @hidden
 */
const createMockCodec = (codec: object, isEmpty: boolean): Codec =>
  ({
    ...codec,
    isEmpty,
  } as Codec);

/**
 * @hidden
 */
const createMockStringCodec = (value?: string): Codec =>
  createMockCodec(
    {
      toString: () => value,
    },
    !value
  );

/**
 * @hidden
 */
const createMockNumberCodec = (value?: number): Codec =>
  createMockCodec(
    {
      toNumber: () => value,
      toString: () => `${value}`,
    },
    !value
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
export const createMockTicker = (ticker?: string): Ticker =>
  createMockStringCodec(ticker) as Ticker;

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
export const createMockOption = <T extends Codec>(wrapped?: T): Option<T> =>
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
export const createMockU64 = (value?: number): u64 => createMockNumberCodec(value) as u64;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTokenName = (name?: string): TokenName =>
  createMockStringCodec(name) as TokenName;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBool = (value?: boolean): bool =>
  createMockCodec(
    {
      isTrue: () => value,
      isFalse: () => !value,
    },
    !value
  ) as bool;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockEnum = (enumValue?: string | Record<string, Codec>): Enum => {
  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    codec[`is${startCase(enumValue)}`] = true;
  } else if (typeof enumValue === 'object') {
    const key = Object.keys(enumValue)[0];

    codec[`is${startCase(key)}`] = true;
    codec[`as${startCase(key)}`] = enumValue[key];
  }

  return createMockCodec(codec, false) as Enum;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetType = (
  assetType?: 'equity' | 'debt' | 'commodity' | 'structuredProduct' | { custom: Bytes }
): AssetType => {
  return createMockEnum(assetType) as AssetType;
};

/* eslint-disable @typescript-eslint/camelcase */
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
    name: TokenName;
    total_supply: Balance;
    owner_did: IdentityId;
    divisible: bool;
    asset_type: AssetType;
    link_id: u64;
  } = {
    name: createMockTokenName(),
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
/* eslint-enable @typescript-eslint/camelcase */

/**
 * @hidden
 */
export const createMockEventRecord = (data: unknown[]): EventRecord =>
  (({
    event: {
      data,
    },
  } as unknown) as EventRecord);
