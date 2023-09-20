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

type ReturnValues = [number, number];

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

    tx1 = dsMockUtils.createTxMock('asset', 'registerTicker');
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
        TxTags.asset.RegisterTicker,
        TxTags.asset.CreateAsset,
        TxTags.portfolio.CreatePortfolio,
      ],
      resolvers: [(): number => 1, (): number => 2],
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
    it('should return the appropriate roles and permissions', async () => {
      const tags = [
        TxTags.asset.RegisterTicker,
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
      });

      const boundFunc = getAuthorization.bind<typeof proc, never, ProcedureAuthorization>(proc);

      expect(boundFunc()).toEqual({
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
      const boundFunc = prepareStorage.bind<
        typeof proc,
        CreateTransactionBatchParams<ReturnValues>,
        Storage
      >(proc);
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
          TxTags.asset.RegisterTicker,
          TxTags.asset.CreateAsset,
          TxTags.portfolio.CreatePortfolio,
        ],
        resolvers: [expect.any(Function), expect.any(Function)],
      });

      await expect(result.resolvers[0]({} as ISubmittableResult)).resolves.toBe(1);
      await expect(result.resolvers[1]({} as ISubmittableResult)).resolves.toBe(4);
    });
  });
});
