/* istanbul ignore file */
import * as polkadotModule from '@polymathnetwork/polkadot/api';
import { bool, Bytes, Enum, Option, u8, u64 } from '@polymathnetwork/polkadot/types';
import {
  AssetType,
  Balance,
  DispatchError,
  DispatchErrorModule,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  EventRecord,
  ExtrinsicStatus,
  IdentityId,
  Link,
  LinkData,
  Moment,
  SecurityToken,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
  TokenName,
} from '@polymathnetwork/polkadot/types/interfaces';
import { Codec, IKeyringPair, ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import { BigNumber } from 'bignumber.js';
import { every, merge, upperFirst } from 'lodash';
import sinon, { SinonStub } from 'sinon';
import { ImportMock, StaticMockManager } from 'ts-mock-imports';

import * as contextModule from '~/context';
import { Mocked } from '~/testUtils/types';
import { Extrinsics, PolymeshTx, Queries } from '~/types/internal';
import { Mutable } from '~/types/utils';

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

type MockContext = Mocked<contextModule.Context>;

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

/**
 * Produces relevant mocks of different parts of the polkadot lib for testing. In order for mocks to work, [[initMocks]] **MUST** be explicitly called
 */
export class PolkadotMockFactory {
  private polkadotCreateMockManager = {} as StaticMockManager<polkadotModule.ApiPromise>;

  private contextCreateMockManager = {} as StaticMockManager<MockContext>;

  private txMocksData = new Map<unknown, TxMockData>();

  private txModule = {} as Extrinsics;

  private queryModule = {} as Queries;

  private apiInstance = {} as Mutable<polkadotModule.ApiPromise>;

  private contextInstance = {} as MockContext;

  private isMockingContext = false;

  private mockingContextOptions: ContextOptions = {
    withSeed: true,
    balance: new BigNumber(100),
  };

  private contextCreateStub = {} as SinonStub;

  /**
   * Initialize the factory by adding default all-purpose functionality to the mock manager
   *
   * @param opts.mockContext - if defined, the internal [[Context]] class will also be mocked with custom properties
   */
  public initMocks(opts?: { mockContext?: ContextOptions | true }): void {
    /*
      NOTE: the idea is to expand this function to mock things as we need them
      and use the methods in the class to fetch/manipulate different parts of the API as required
     */

    // Context
    if (opts?.mockContext) {
      this.isMockingContext = true;
      if (opts.mockContext !== true) {
        this.mockingContextOptions = { ...this.mockingContextOptions, ...opts.mockContext };
      }

      this.contextCreateMockManager = ImportMock.mockStaticClass<MockContext>(
        contextModule,
        'Context'
      );
      this.contextCreateStub = this.contextCreateMockManager.mock('create');
      this.initContext(this.mockingContextOptions);
    }

    this.txMocksData.clear();

    // Polkadot
    this.polkadotCreateMockManager = ImportMock.mockStaticClass<polkadotModule.ApiPromise>(
      polkadotModule,
      'ApiPromise'
    );
    this.initApi();
  }

  /**
   * @hidden
   */
  private initApi(): void {
    this.apiInstance = {} as polkadotModule.ApiPromise;
    this.initTx();
    this.initQuery();
  }

  /**
   * @hidden
   */
  private initContext(opts: ContextOptions): void {
    const currentIdentity = opts.withSeed
      ? { getIdentityBalance: sinon.stub().resolves(opts.balance) }
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
    } as unknown) as MockContext;

    this.contextInstance = contextInstance;

    this.updateContext();
  }

  /**
   * @hidden
   *
   * Mock the tx module
   */
  private initTx(): void {
    const txModule = {} as Extrinsics;

    this.updateTx(txModule);
  }

  /**
   * @hidden
   */
  private updateTx(txModule?: Extrinsics): void {
    const updateTo = txModule || this.txModule;

    this.txModule = updateTo;

    this.apiInstance.tx = this.txModule;

    this.updateInstances();
  }

  /**
   * @hidden
   *
   * Mock the query module
   */
  private initQuery(): void {
    const queryModule = {} as Queries;
    this.updateQuery(queryModule);
  }

  /**
   * @hidden
   */
  private updateQuery(queryModule?: Queries): void {
    const updateTo = queryModule || this.queryModule;

    this.queryModule = updateTo;

    this.apiInstance.query = this.queryModule;

    this.updateInstances();
  }

  /**
   * @hidden
   */
  private updateContext(): void {
    this.contextInstance.polymeshApi = this.apiInstance as polkadotModule.ApiPromise;
  }

  /**
   * @hidden
   */
  private updateInstances(): void {
    if (this.isMockingContext) {
      this.updateContext();
      this.updateContextConstructor();
    }
    this.updatePolkadotConstructor();
  }

  /**
   * @hidden
   */
  private updatePolkadotConstructor(): void {
    this.polkadotCreateMockManager.mock('create', this.apiInstance);
  }

  /**
   * @hidden
   */
  private updateContextConstructor(): void {
    this.contextCreateStub = this.contextCreateStub.returns(this.contextInstance);
  }

  /**
   * Reset the factory to the default, empty mocks
   */
  public reset(): void {
    this.cleanup();
    if (this.isMockingContext) {
      this.initMocks({ mockContext: this.mockingContextOptions });
    } else {
      this.initMocks();
    }
  }

  /**
   * Restore imports to their original state. While [[reset]] simply clears all stubs,
   * this method makes it so that next import that targets polkadot will resolve to the real
   * library
   */
  public cleanup(): void {
    this.polkadotCreateMockManager.restore();

    if (this.isMockingContext) {
      this.contextCreateMockManager.restore();
    }
  }

  /**
   * Create and returns a mocked transaction. Each call will create a new version of the stub
   *
   * @param mod - name of the module
   * @param tx - name of the transaction function
   * @param autoresolve - if set to a status, the transaction will resolve immediately with that status.
   *  If set to false, the transaction lifecycle will be controlled by [[updateTxStatus]]
   */
  public createTxStub<
    ModuleName extends keyof Extrinsics,
    TransactionName extends keyof Extrinsics[ModuleName]
  >(
    mod: ModuleName,
    tx: TransactionName,
    autoresolve: MockTxStatus | false = MockTxStatus.Succeeded
  ): PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>> &
    SinonStub<ArgsType<Extrinsics[ModuleName][TransactionName]>> {
    let runtimeModule = this.txModule[mod];

    if (!runtimeModule) {
      runtimeModule = {} as Extrinsics[ModuleName];
      this.txModule[mod] = runtimeModule;
    }

    runtimeModule[tx] = (sinon.stub().returns({
      hash: tx as string,
      signAndSend: sinon.stub().callsFake((_, cback: StatusCallback) => {
        if (autoresolve === MockTxStatus.Rejected) {
          return Promise.reject(new Error('Cancelled'));
        }

        const unsubCallback = sinon.stub();

        this.txMocksData.set(runtimeModule[tx], {
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

    this.updateTx();

    const instance = this.apiInstance;

    const transactionMock = (instance.tx[mod][tx] as unknown) as PolymeshTx<
      ArgsType<Extrinsics[ModuleName][TransactionName]>
    > &
      SinonStub<ArgsType<Extrinsics[ModuleName][TransactionName]>>;

    return transactionMock;
  }

  /**
   * Create and return a query stub
   *
   * @param mod - name of the module
   * @param query - name of the query function
   */
  public createQueryStub<
    ModuleName extends keyof Queries,
    QueryName extends keyof Queries[ModuleName]
  >(
    mod: ModuleName,
    query: QueryName,
    opts?: {
      returnValue?: unknown;
      entries?: unknown[];
    }
  ): Queries[ModuleName][QueryName] & SinonStub<ArgsType<Queries[ModuleName][QueryName]>> {
    let runtimeModule = this.queryModule[mod];

    if (!runtimeModule) {
      runtimeModule = {} as Queries[ModuleName];
      this.queryModule[mod] = runtimeModule;
    }

    if (!runtimeModule[query]) {
      runtimeModule[query] = (sinon.stub() as unknown) as Queries[ModuleName][QueryName];
      if (opts?.entries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (runtimeModule[query] as any).entries = sinon
          .stub()
          .resolves(opts.entries.map(entry => ['someKey', entry]));
      }

      this.updateQuery();
    }

    const instance = this.apiInstance;

    const stub = instance.query[mod][query] as Queries[ModuleName][QueryName] &
      SinonStub<ArgsType<Queries[ModuleName][QueryName]>>;

    if (opts?.returnValue) {
      stub.returns(opts.returnValue);
    }

    return stub;
  }

  /**
   * Update the status of an existing mock transaction. Will throw an error if the transaction has already been resolved
   *
   * @param tx - transaction to update
   * @param status - new status
   */
  public updateTxStatus<
    ModuleName extends keyof Extrinsics,
    TransactionName extends keyof Extrinsics[ModuleName]
  >(
    tx: PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>>,
    status: MockTxStatus,
    failReason?: TxFailReason
  ): void {
    const txMockData = this.txMocksData.get(tx);

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
      this.txMocksData.set(tx, {
        ...txMockData,
        status,
        resolved: true,
      });
    }

    txMockData.statusCallback(statusToReceipt(status, failReason));
  }

  /**
   * Make calls to `Context.create` throw an error
   */
  public throwOnContextCreation(error?: Error): void {
    this.contextCreateStub.throws(error);
  }

  /**
   * Make calls to `ApiPromise.create` throw an error
   */
  public throwOnApiCreation(error?: Error): void {
    this.polkadotCreateMockManager.mock('create').throws(error);
  }

  /**
   * Sets the `accountBalance` function in the mocked Context to return the specified amount
   *
   * @param balance - new account balance
   */
  public setContextAccountBalance(balance: BigNumber): void {
    this.contextInstance.accountBalance.returns(balance);
  }

  /**
   * Retrieve an instance of the mocked Polkadot API
   */
  public getApiInstance(): polkadotModule.ApiPromise {
    return this.apiInstance as polkadotModule.ApiPromise;
  }

  /**
   * Retrieve an instance of the mocked Context
   */
  public getContextInstance(): MockContext {
    return this.contextInstance;
  }

  /**
   * Retrieve the stub of the `Context.create` method
   */
  public getContextCreateStub(): SinonStub {
    return this.contextCreateStub;
  }
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
 */
export const createMockDocumentName = (name?: string): DocumentName =>
  createMockStringCodec(name) as DocumentName;

/**
 * @hidden
 */
export const createMockDocumentUri = (uri?: string): DocumentUri =>
  createMockStringCodec(uri) as DocumentUri;

/**
 * @hidden
 */
export const createMockDocumentHash = (hash?: string): DocumentHash =>
  createMockStringCodec(hash) as DocumentHash;

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
 */
const createMockEnum = (enumValue?: string | Record<string, Codec>): Enum => {
  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    console.log(enumValue);
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
 */
export const createMockAssetType = (
  assetType?: 'equity' | 'debt' | 'commodity' | 'structuredProduct' | { custom: Bytes }
): AssetType => {
  return createMockEnum(assetType) as AssetType;
};

/**
 * @hidden
 */
export const createMockLinkData = (
  linkData?: { documentOwned: Document } | { tickerOwned: Ticker } | { tokenOwned: Ticker }
): LinkData => {
  return createMockEnum(linkData) as LinkData;
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

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockLink = (
  reg: { link_data: LinkData; expiry: Option<Moment>; link_id: u64 } = {
    link_data: createMockLinkData(),
    expiry: createMockOption(),
    link_id: createMockU64(),
  }
): Link =>
  createMockCodec(
    {
      link_data: reg.link_data,
      expiry: reg.expiry,
      link_id: reg.link_id,
    },
    false
  ) as Link;

/**
 * @hidden
 */
export const createMockDocument = (
  reg: { name: DocumentName; uri: DocumentUri; content_hash: DocumentHash } = {
    name: createMockDocumentName(),
    uri: createMockDocumentUri(),
    content_hash: createMockDocumentHash(),
  }
): Document =>
  createMockCodec(
    {
      name: reg.name,
      uri: reg.uri,
      content_hash: reg.content_hash,
    },
    false
  ) as Document;
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
