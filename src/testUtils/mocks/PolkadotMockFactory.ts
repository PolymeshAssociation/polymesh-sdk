/* istanbul ignore file */
import * as polkadotModule from '@polymathnetwork/polkadot/api';
import {
  DispatchError,
  DispatchErrorModule,
  ExtrinsicStatus,
} from '@polymathnetwork/polkadot/types/interfaces';
import { IKeyringPair, ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import { BigNumber } from 'bignumber.js';
import { merge } from 'lodash';
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
};

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
      getAccounts: sinon.stub().returns([]),
      setPair: sinon.stub().callsFake(address => {
        contextInstance.currentPair = { address } as IKeyringPair;
      }),
      currentPair,
      currentIdentity,
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
    this.contextCreateMockManager.mock('create', this.contextInstance);
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
    QueryName extends keyof Queries[ModuleName],
    ReturnValue extends unknown
  >(
    mod: ModuleName,
    query: QueryName,
    returnValue?: ReturnValue
  ): Queries[ModuleName][QueryName] & SinonStub<ArgsType<Queries[ModuleName][QueryName]>> {
    let runtimeModule = this.queryModule[mod];

    if (!runtimeModule) {
      runtimeModule = {} as Queries[ModuleName];
      this.queryModule[mod] = runtimeModule;
    }

    if (!runtimeModule[query]) {
      runtimeModule[query] = (sinon.stub() as unknown) as Queries[ModuleName][QueryName];

      this.updateQuery();
    }

    const instance = this.apiInstance;

    const stub = instance.query[mod][query] as Queries[ModuleName][QueryName] &
      SinonStub<ArgsType<Queries[ModuleName][QueryName]>>;

    if (returnValue) {
      stub.returns(returnValue);
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
   * Make the next call to `Context.create` throw an error
   */
  public throwOnContextCreation(error?: Error): void {
    this.contextCreateMockManager
      .mock('create')
      .onFirstCall()
      .throws(error);
  }

  /**
   * Make the next call to `ApiPromise.create` throw an error
   */
  public throwOnApiCreation(error?: Error): void {
    this.polkadotCreateMockManager
      .mock('create')
      .onFirstCall()
      .throws(error);
  }

  /**
   * Retrieve an instance of the mocked Polkadot API
   */
  public getApiInstance(): polkadotModule.ApiPromise {
    return this.apiInstance as polkadotModule.ApiPromise;
  }

  /**
   * Retrieve an instance  of the mocked Context
   */
  public getContextInstance(): MockContext {
    return this.contextInstance;
  }
}
