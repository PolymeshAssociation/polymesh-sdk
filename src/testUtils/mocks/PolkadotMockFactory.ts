/* istanbul ignore file */
import * as polkadotModule from '@polymathnetwork/polkadot/api';
import { QueryableStorage, SubmittableExtrinsics } from '@polymathnetwork/polkadot/api/types';
import {
  DispatchError,
  DispatchErrorModule,
  ExtrinsicStatus,
} from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';

import { Extrinsics, PolymeshTx, Queries } from '~/types/internal';

type StatusCallback = (receipt: ISubmittableResult) => void;
type UnsubCallback = () => void;

interface TxMockData {
  statusCallback: StatusCallback;
  unsubCallback: UnsubCallback;
  status: MockTxStatus;
  resolved: boolean;
}

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
 * Produces relevant mocks of different parts of the polkadot lib for testing
 */
export class PolkadotMockFactory {
  private apiMockManager = ImportMock.mockClass<polkadotModule.ApiPromise>(
    polkadotModule,
    'ApiPromise'
  );

  private txMocksData = new Map<unknown, TxMockData>();

  private txModule = {} as Extrinsics;

  private queryModule = {} as QueryableStorage<'promise'>;

  /**
   * @hidden
   */
  constructor() {
    this.init();
  }

  /**
   * @hidden
   *
   * Initialize the factory by adding default all-purpose functionality to the mock manager
   */
  private init(): void {
    /*
      NOTE: the idea is to expand this function to mock things as we need them
      and use the methods in the class to fetch/manipulate different parts of the API as required
     */

    this.txMocksData.clear();
    this.initTx();
    this.initQuery();
  }

  /**
   * @hidden
   *
   * Mock the tx module
   */
  private initTx(): void {
    const txModule = {} as SubmittableExtrinsics<'promise'>;
    this.txModule = txModule;
    this.apiMockManager.set('tx', txModule);
  }

  /**
   * @hidden
   *
   * Mock the query module
   */
  private initQuery(): void {
    const queryModule = {} as QueryableStorage<'promise'>;
    this.queryModule = queryModule;
    this.apiMockManager.set('query', queryModule);
  }

  /**
   * Resets the factory to the default, empty mocks
   */
  public reset(): void {
    this.init();
  }

  /**
   * Creates and returns a mocked transaction. Each call will create a new version of the stub
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
  ): PolymeshTx<ModuleName, TransactionName> & SinonStub {
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

    this.apiMockManager.set('tx', this.txModule);

    const instance = this.apiMockManager.getMockInstance();

    const transactionMock = (instance.tx[mod][tx] as unknown) as PolymeshTx<
      ModuleName,
      TransactionName
    > &
      SinonStub;

    return transactionMock;
  }

  /**
   * Creates and returns a query stub
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
  ): Queries[ModuleName][QueryName] & SinonStub {
    let runtimeModule = this.queryModule[mod];

    if (!runtimeModule) {
      runtimeModule = {} as Queries[ModuleName];
      this.queryModule[mod] = runtimeModule;
    }

    if (!runtimeModule[query]) {
      runtimeModule[query] = (sinon.stub() as unknown) as Queries[ModuleName][QueryName];

      this.apiMockManager.set('query', this.queryModule);
    }

    const instance = this.apiMockManager.getMockInstance();

    const stub = instance.query[mod][query] as Queries[ModuleName][QueryName] & SinonStub;

    if (returnValue) {
      stub.returns(returnValue);
    }

    return stub;
  }

  /**
   * Update the status of an existing mock transaction. Will throw an error if the transaction has already been resolved
   *
   * @param tx - transaction to update
   */
  public updateTxStatus<
    ModuleName extends keyof Extrinsics,
    TransactionName extends keyof Extrinsics[ModuleName]
  >(
    tx: PolymeshTx<ModuleName, TransactionName>,
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
        resolved: true,
      });
    }

    txMockData.statusCallback(statusToReceipt(status, failReason));
  }

  /**
   * Retrieve an instance of the mocked Polkadot
   */
  public getInstance(): polkadotModule.ApiPromise {
    return this.apiMockManager.getMockInstance();
  }
}
