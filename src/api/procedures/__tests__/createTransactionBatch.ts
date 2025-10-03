import { ISubmittableResult } from '@polkadot/types/types';
import { PolkadotSigner } from '@polymeshassociation/signing-manager-types';

import {
  getAuthorization,
  prepareCreateTransactionBatch,
  prepareStorage,
  Storage,
} from '~/api/procedures/createTransactionBatch';
import { Context, PolymeshTransaction, PolymeshTransactionBatch } from '~/internal';
import {
  dsMockUtils,
  entityMockUtils,
  polymeshTransactionMockUtils,
  procedureMockUtils,
} from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateTransactionBatchParams, TxTags } from '~/types';
import { BatchTransactionSpec, PolymeshTx, ProcedureAuthorization } from '~/types/internal';
import * as utilsInternalModule from '~/utils/internal';

type ReturnValues = number[];
type SingleReturnValues = [number];

describe('createTransactionBatch procedure', () => {
  let mockContext: Mocked<Context>;
  let tx1: PolymeshTx, tx2: PolymeshTx, tx3: PolymeshTx;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    polymeshTransactionMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
    tx2 = dsMockUtils.createTxMock('asset', 'createAsset');
    tx3 = dsMockUtils.createTxMock('portfolio', 'createPortfolio');
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return a batch transaction spec with every transaction in the arguments', async () => {
    const processedTransactions = [
      {
        transaction: tx1,
        args: [],
      },
      {
        transaction: tx2,
        args: [],
      },
      {
        transaction: tx3,
        args: [],
      },
    ];

    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<ReturnValues>,
      ReturnValues,
      Storage
    >(mockContext, {
      processedTransactions,
      tags: [
        TxTags.asset.RegisterUniqueTicker,
        TxTags.asset.CreateAsset,
        TxTags.portfolio.CreatePortfolio,
      ],
      resolvers: [(): number => 1, (): number => 2],
      preRunValidations: [],
    });

    const result = await prepareCreateTransactionBatch.call<
      typeof proc,
      never[],
      Promise<BatchTransactionSpec<ReturnValues, unknown[][]>>
    >(proc);

    expect(result).toEqual({
      transactions: processedTransactions,
      resolver: expect.any(Function),
    });

    expect(await (result.resolver as () => Promise<unknown>)()).toEqual([1, 2]);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const tags = [
        TxTags.asset.RegisterUniqueTicker,
        TxTags.asset.CreateAsset,
        TxTags.portfolio.CreatePortfolio,
      ];

      const proc = procedureMockUtils.getInstance<
        CreateTransactionBatchParams<ReturnValues>,
        ReturnValues,
        Storage
      >(mockContext, {
        processedTransactions: [],
        tags,
        resolvers: [],
        preRunValidations: [],
      });

      const boundFunc = (getAuthorization as (this: typeof proc) => ProcedureAuthorization).bind(
        proc
      );
      const result = boundFunc();

      expect(result).toEqual({
        permissions: {
          transactions: [...tags, TxTags.utility.BatchAll],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the DID of signing Identity', async () => {
      const transactions = [
        new PolymeshTransactionBatch(
          {
            transactions: [
              {
                transaction: tx1,
                args: ['foo'] as unknown[],
              },
              {
                transaction: tx2,
                args: ['bar'] as unknown[],
              },
            ],
            resolver: 1,
            signingAddress: 'someAddress',
            signer: {} as PolkadotSigner,
            mortality: { immortal: false },
          },
          mockContext
        ),
        new PolymeshTransaction(
          {
            transaction: tx3,
            args: ['baz'] as unknown[],
            resolver: (): number => 2,
            transformer: (val): number => val * 2,
            signingAddress: 'someAddress',
            signer: {} as PolkadotSigner,
            mortality: { immortal: false },
          },
          mockContext
        ),
      ] as const;
      const proc = procedureMockUtils.getInstance<
        CreateTransactionBatchParams<ReturnValues>,
        ReturnValues,
        Storage
      >(mockContext);
      const boundFunc = (
        prepareStorage as (
          this: typeof proc,
          args: CreateTransactionBatchParams<ReturnValues>
        ) => Storage
      ).bind(proc);
      const result = boundFunc({ transactions });

      expect(result).toEqual({
        processedTransactions: [
          {
            transaction: tx1,
            args: ['foo'],
            fee: undefined,
            feeMultiplier: undefined,
          },
          {
            transaction: tx2,
            args: ['bar'],
            fee: undefined,
            feeMultiplier: undefined,
          },
          {
            transaction: tx3,
            args: ['baz'],
            fee: undefined,
            feeMultiplier: undefined,
          },
        ],
        tags: [
          TxTags.asset.RegisterUniqueTicker,
          TxTags.asset.CreateAsset,
          TxTags.portfolio.CreatePortfolio,
        ],
        resolvers: [expect.any(Function), expect.any(Function)],
        preRunValidations: [undefined, undefined],
      });

      jest.spyOn(utilsInternalModule, 'sliceBatchReceipt').mockImplementation();

      await expect(result.resolvers[0]!({} as ISubmittableResult)).resolves.toBe(1);
      await expect(result.resolvers[1]!({} as ISubmittableResult)).resolves.toBe(4);
    });
  });

  it('should handle a single transaction in batch', async () => {
    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx3,
          args: ['baz'] as unknown[],
          resolver: (): number => 2,
          transformer: (val): number => val * 2,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
        },
        mockContext
      ),
    ] as const;
    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<SingleReturnValues>,
      SingleReturnValues,
      Storage
    >(mockContext);
    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<SingleReturnValues>
      ) => Storage
    ).bind(proc);
    const result = boundFunc({ transactions });

    expect(result).toEqual({
      processedTransactions: [
        {
          transaction: tx3,
          args: ['baz'],
          fee: undefined,
          feeMultiplier: undefined,
        },
      ],
      tags: [TxTags.portfolio.CreatePortfolio],
      resolvers: [expect.any(Function)],
      preRunValidations: [undefined],
    });

    jest.spyOn(utilsInternalModule, 'sliceBatchReceipt').mockImplementation();

    await expect(result.resolvers[0]!({} as ISubmittableResult)).resolves.toBe(4);
  });

  it('should handle a single transaction in batch without resolver function', async () => {
    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx3,
          args: ['baz'] as unknown[],
          resolver: 5,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
        },
        mockContext
      ),
    ] as const;
    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<SingleReturnValues>,
      SingleReturnValues,
      Storage
    >(mockContext);
    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<SingleReturnValues>
      ) => Storage
    ).bind(proc);
    const result = boundFunc({ transactions });

    expect(result).toEqual({
      processedTransactions: [
        {
          transaction: tx3,
          args: ['baz'],
          fee: undefined,
          feeMultiplier: undefined,
        },
      ],
      tags: [TxTags.portfolio.CreatePortfolio],
      resolvers: [expect.any(Function)],
      preRunValidations: [undefined],
    });

    jest.spyOn(utilsInternalModule, 'sliceBatchReceipt').mockImplementation();

    await expect(result.resolvers[0]!({} as ISubmittableResult)).resolves.toBe(5);
  });

  it('should handle a single transaction in batch with identity transformer', async () => {
    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx3,
          args: ['baz'] as unknown[],
          resolver: (): number => 3,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
        },
        mockContext
      ),
    ] as const;
    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<SingleReturnValues>,
      SingleReturnValues,
      Storage
    >(mockContext);
    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<SingleReturnValues>
      ) => Storage
    ).bind(proc);
    const result = boundFunc({ transactions });

    expect(result).toEqual({
      processedTransactions: [
        {
          transaction: tx3,
          args: ['baz'],
          fee: undefined,
          feeMultiplier: undefined,
        },
      ],
      tags: [TxTags.portfolio.CreatePortfolio],
      resolvers: [expect.any(Function)],
      preRunValidations: [undefined],
    });

    jest.spyOn(utilsInternalModule, 'sliceBatchReceipt').mockImplementation();

    await expect(result!.resolvers[0]!({} as ISubmittableResult)).resolves.toBe(3);
  });

  it('should combine preRunValidation functions from multiple transactions', async () => {
    const validation1 = jest.fn().mockResolvedValue(undefined);
    const validation2 = jest.fn().mockResolvedValue(undefined);

    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx1,
          args: ['tx1'] as unknown[],
          resolver: 1,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
          preRunValidation: validation1,
        },
        mockContext
      ),
      new PolymeshTransaction(
        {
          transaction: tx2,
          args: ['tx2'] as unknown[],
          resolver: 2,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
          preRunValidation: validation2,
        },
        mockContext
      ),
    ] as const;

    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<ReturnValues>,
      ReturnValues,
      Storage
    >(mockContext);

    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<ReturnValues>
      ) => Storage
    ).bind(proc);

    const result = boundFunc({ transactions });

    expect(result.preRunValidations).toEqual([validation1, validation2]);

    // Test that prepareCreateTransactionBatch combines them
    const batchProc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<ReturnValues>,
      ReturnValues,
      Storage
    >(mockContext, result);

    const batchResult = await prepareCreateTransactionBatch.call<
      typeof batchProc,
      never[],
      Promise<BatchTransactionSpec<ReturnValues, unknown[][]>>
    >(batchProc);

    expect(batchResult.preRunValidation).toBeDefined();

    // Call the combined validation
    await batchResult.preRunValidation!({ asProposal: true });

    expect(validation1).toHaveBeenCalledWith({ asProposal: true });
    expect(validation2).toHaveBeenCalledWith({ asProposal: true });
  });

  it('should handle mixed transactions with and without preRunValidation', async () => {
    const validation1 = jest.fn().mockResolvedValue(undefined);
    const validation2 = jest.fn().mockResolvedValue(undefined);

    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx1,
          args: ['tx1'] as unknown[],
          resolver: 1,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
          preRunValidation: validation1,
        },
        mockContext
      ),
      new PolymeshTransaction(
        {
          transaction: tx2,
          args: ['tx2'] as unknown[],
          resolver: 2,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
        },
        mockContext
      ),
      new PolymeshTransaction(
        {
          transaction: tx3,
          args: ['tx3'] as unknown[],
          resolver: 3,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
          preRunValidation: validation2,
        },
        mockContext
      ),
    ] as const;

    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<ReturnValues>,
      ReturnValues,
      Storage
    >(mockContext);

    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<ReturnValues>
      ) => Storage
    ).bind(proc);

    const result = boundFunc({ transactions });

    const batchProc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<ReturnValues>,
      ReturnValues,
      Storage
    >(mockContext, result);

    const batchResult = await prepareCreateTransactionBatch.call<
      typeof batchProc,
      never[],
      Promise<BatchTransactionSpec<ReturnValues, unknown[][]>>
    >(batchProc);

    expect(batchResult.preRunValidation).toBeDefined();

    await batchResult.preRunValidation!({ asProposal: false });

    expect(validation1).toHaveBeenCalledWith({ asProposal: false });
    expect(validation2).toHaveBeenCalledWith({ asProposal: false });
  });

  it('should not include preRunValidation if no transactions have it', async () => {
    const transactions = [
      new PolymeshTransaction(
        {
          transaction: tx1,
          args: ['tx1'] as unknown[],
          resolver: 1,
          signingAddress: 'someAddress',
          signer: {} as PolkadotSigner,
          mortality: { immortal: false },
        },
        mockContext
      ),
    ] as const;

    const proc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<SingleReturnValues>,
      SingleReturnValues,
      Storage
    >(mockContext);

    const boundFunc = (
      prepareStorage as (
        this: typeof proc,
        args: CreateTransactionBatchParams<SingleReturnValues>
      ) => Storage
    ).bind(proc);

    const result = boundFunc({ transactions });

    const batchProc = procedureMockUtils.getInstance<
      CreateTransactionBatchParams<SingleReturnValues>,
      SingleReturnValues,
      Storage
    >(mockContext, result);

    const batchResult = await prepareCreateTransactionBatch.call<
      typeof batchProc,
      never[],
      Promise<BatchTransactionSpec<SingleReturnValues, unknown[][]>>
    >(batchProc);

    expect(batchResult.preRunValidation).toBeUndefined();
  });
});
