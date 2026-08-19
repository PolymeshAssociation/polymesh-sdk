import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { ISubmittableResult, TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  dispatchErrorToMessage,
  extrinsicHashMatcher,
  getExtrinsicFailure,
  handleTransactionSubmissionError,
  pollForTransactionFinalization,
  processType,
  subscribeForTransactionFinalization,
} from '~/base/utils';
import { PolymeshError } from '~/internal';
import { fakePromise } from '~/testUtils';
import { dsMockUtils } from '~/testUtils/mocks';
import {
  createMockEventRecord,
  createMockSystemPhase,
  MockContext,
} from '~/testUtils/mocks/dataSources';
import { ErrorCode, TransactionArgumentType } from '~/types';

describe('Process Type', () => {
  it('should be a function', () => {
    expect(processType).toBeInstanceOf(Function);
  });

  it('should return unknown type if info contains previously unknown type', () => {
    const rawType = { info: 1000 } as unknown as TypeDef;
    const name = 'foo';

    const result = processType(rawType, name);

    expect(result.type).toBe(TransactionArgumentType.Unknown);
  });
});

describe('dispatchErrorToMessage', () => {
  /**
   * Build a `SpRuntimeDispatchError`-shaped mock for a given variant
   */
  const buildDispatchError = (
    variant: string,
    extra: Record<string, unknown> = {}
  ): SpRuntimeDispatchError =>
    ({
      isModule: false,
      isBadOrigin: false,
      isCannotLookup: false,
      isToken: false,
      isArithmetic: false,
      isTransactional: false,
      type: variant,
      ...extra,
    } as unknown as SpRuntimeDispatchError);

  it('should resolve a Module error through chain metadata', () => {
    const error = buildDispatchError('Module', {
      isModule: true,
      asModule: {
        registry: {
          findMetaError: (): unknown => ({
            section: 'identity',
            name: 'AlreadyLinked',
            docs: ['One secondary or primary key can only belong to one DID'],
          }),
        },
      },
    });

    expect(dispatchErrorToMessage(error)).toBe(
      'identity.AlreadyLinked: One secondary or primary key can only belong to one DID'
    );
  });

  it('should name a Token error rather than reporting it as unknown', () => {
    // the common failure when an Account cannot cover a transfer
    const error = buildDispatchError('Token', {
      isToken: true,
      asToken: { type: 'FundsUnavailable' },
    });

    expect(dispatchErrorToMessage(error)).toBe('Token error: FundsUnavailable');
  });

  it('should name Arithmetic and Transactional errors', () => {
    expect(
      dispatchErrorToMessage(
        buildDispatchError('Arithmetic', {
          isArithmetic: true,
          asArithmetic: { type: 'Overflow' },
        })
      )
    ).toBe('Arithmetic error: Overflow');

    expect(
      dispatchErrorToMessage(
        buildDispatchError('Transactional', {
          isTransactional: true,
          asTransactional: { type: 'LimitReached' },
        })
      )
    ).toBe('Transactional error: LimitReached');
  });

  it('should report BadOrigin and CannotLookup', () => {
    expect(dispatchErrorToMessage(buildDispatchError('BadOrigin', { isBadOrigin: true }))).toBe(
      'Bad origin'
    );
    expect(
      dispatchErrorToMessage(buildDispatchError('CannotLookup', { isCannotLookup: true }))
    ).toBe('Could not lookup information required to validate the transaction');
  });

  it('should fall back to the variant name for any other error', () => {
    // a variant with no dedicated handling still produces something actionable
    expect(dispatchErrorToMessage(buildDispatchError('Exhausted'))).toBe(
      'Dispatch error: Exhausted'
    );
  });

  it('should only report "Unknown error" when there is genuinely nothing to report', () => {
    expect(dispatchErrorToMessage(buildDispatchError(''))).toBe('Unknown error');
  });
});

describe('handleTransactionSubmissionError', () => {
  it('should map a Polkadot signer cancellation, which reports rejection in the message', () => {
    const error = handleTransactionSubmissionError(new Error('Error: Cancelled'));

    expect(error.code).toBe(ErrorCode.TransactionRejectedByUser);
  });

  it('should map an EIP-1193 rejection, which reports it as code 4001', () => {
    const rejection = Object.assign(new Error('User rejected the request'), { code: 4001 });

    const error = handleTransactionSubmissionError(rejection);

    expect(error.code).toBe(ErrorCode.TransactionRejectedByUser);
  });

  it('should not treat another provider error code as a rejection', () => {
    const disconnected = Object.assign(new Error('The wallet is disconnected'), { code: 4900 });

    const error = handleTransactionSubmissionError(disconnected);

    expect(error.code).toBe(ErrorCode.UnexpectedError);
    expect(error.message).toBe('The wallet is disconnected');
  });

  it('should report anything else as an unexpected error', () => {
    const error = handleTransactionSubmissionError(new Error('something broke'));

    expect(error.code).toBe(ErrorCode.UnexpectedError);
    expect(error.message).toBe('something broke');
  });
});

describe('getExtrinsicFailure', () => {
  /**
   * Build a receipt whose `filterRecords` answers for the given `module.event` keys only
   */
  const buildReceipt = ({
    extrinsicFailed,
    ethExtrinsicRevert,
  }: {
    extrinsicFailed?: SpRuntimeDispatchError;
    ethExtrinsicRevert?: SpRuntimeDispatchError;
  }): ISubmittableResult =>
    ({
      filterRecords: (mod: string, eventName: string) => {
        const error =
          mod === 'system' && eventName === 'ExtrinsicFailed'
            ? extrinsicFailed
            : ethExtrinsicRevert;

        return error ? [{ event: { data: [error] } }] : [];
      },
    } as unknown as ISubmittableResult);

  const badOrigin = {
    isModule: false,
    isBadOrigin: true,
    isCannotLookup: false,
    isToken: false,
    isArithmetic: false,
    isTransactional: false,
    type: 'BadOrigin',
  } as unknown as SpRuntimeDispatchError;

  it('should return undefined when the receipt carries neither failure event', () => {
    expect(getExtrinsicFailure(buildReceipt({}))).toBeUndefined();
  });

  it('should report a native `system.ExtrinsicFailed`', () => {
    const error = getExtrinsicFailure(buildReceipt({ extrinsicFailed: badOrigin }));

    expect(error?.code).toBe(ErrorCode.TransactionReverted);
    expect(error?.message).toBe('Bad origin');
  });

  it('should report a `revive.EthExtrinsicRevert`, which the Ethereum path emits instead', () => {
    const error = getExtrinsicFailure(buildReceipt({ ethExtrinsicRevert: badOrigin }));

    expect(error?.code).toBe(ErrorCode.TransactionReverted);
    expect(error?.message).toBe('Bad origin');
  });
});

describe('pollForTransactionFinalization', () => {
  const txHash = dsMockUtils.createMockHash('txHash');
  when(txHash.eq).calledWith(txHash).mockReturnValue(true);
  const startingBlock = new BigNumber(1);

  let context: MockContext;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return finalized transaction info', async () => {
    context.getLatestBlock.mockResolvedValue(new BigNumber(2));
    dsMockUtils.createRpcMock('chain', 'getBlockHash', {
      returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
    });

    dsMockUtils.createRpcMock('chain', 'getBlock', {
      returnValue: dsMockUtils.createMockSignedBlock({
        block: dsMockUtils.createMockBlock({
          header: dsMockUtils.createMockHeader(),
          extrinsics: dsMockUtils.createMockExtrinsics([
            { toHex: (): string => '0x', hash: txHash },
          ]),
        }),
      }),
    });

    dsMockUtils.createQueryMock('system', 'events', {
      returnValue: [
        createMockEventRecord({
          phase: createMockSystemPhase({ Initialization: dsMockUtils.createMockBool(true) }),
          data: [],
        }),
        createMockEventRecord({
          phase: createMockSystemPhase({
            ApplyExtrinsic: dsMockUtils.createMockU32(new BigNumber(2)),
          }),
          data: [],
        }),
        createMockEventRecord({
          phase: createMockSystemPhase({
            ApplyExtrinsic: dsMockUtils.createMockU32(new BigNumber(0)),
          }),
          data: [],
        }),
      ],
    });

    const result = await pollForTransactionFinalization(
      extrinsicHashMatcher(txHash),
      startingBlock,
      context
    );

    expect(result).toEqual(
      expect.objectContaining({
        txIndex: 0,
        txHash,
        events: [],
      })
    );
  });

  it('should locate the extrinsic with an arbitrary matcher and read its hash back', async () => {
    const otherHash = dsMockUtils.createMockHash('otherHash');

    context.getLatestBlock.mockResolvedValue(new BigNumber(2));
    dsMockUtils.createRpcMock('chain', 'getBlockHash', {
      returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
    });

    dsMockUtils.createRpcMock('chain', 'getBlock', {
      returnValue: dsMockUtils.createMockSignedBlock({
        block: dsMockUtils.createMockBlock({
          header: dsMockUtils.createMockHeader(),
          extrinsics: dsMockUtils.createMockExtrinsics([
            { toHex: (): string => '0x', hash: txHash },
            { toHex: (): string => '0x', hash: otherHash },
          ]),
        }),
      }),
    });

    dsMockUtils.createQueryMock('system', 'events', {
      returnValue: [],
    });

    const result = await pollForTransactionFinalization(
      extrinsic => extrinsic.hash.toString() === 'otherHash',
      startingBlock,
      context
    );

    expect(result).toEqual(
      expect.objectContaining({
        txIndex: 1,
        txHash: otherHash,
        events: [],
      })
    );
  });

  it('should report inclusion before finalization, without letting it decide the result', async () => {
    /*
     * the extrinsic lands in block 2 while only block 1 is finalized, so inclusion is reported
     *   straight away but the returned result must still wait for block 2 to be finalized
     */
    context.getLatestBlock
      .mockResolvedValueOnce(new BigNumber(1))
      .mockResolvedValue(new BigNumber(2));

    dsMockUtils.createRpcMock('chain', 'getHeader', {
      returnValue: dsMockUtils.createMockHeader({
        parentHash: dsMockUtils.createMockHash(),
        number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(2))),
        stateRoot: dsMockUtils.createMockHash(),
        extrinsicsRoot: dsMockUtils.createMockHash(),
      }),
    });

    dsMockUtils.createRpcMock('chain', 'getBlockHash', {
      returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
    });

    dsMockUtils.createRpcMock('chain', 'getBlock', {
      returnValue: dsMockUtils.createMockSignedBlock({
        block: dsMockUtils.createMockBlock({
          header: dsMockUtils.createMockHeader(),
          extrinsics: dsMockUtils.createMockExtrinsics([
            { toHex: (): string => '0x', hash: txHash },
          ]),
        }),
      }),
    });

    dsMockUtils.createQueryMock('system', 'events', { returnValue: [] });

    const onInBlock = jest.fn();

    const result = await pollForTransactionFinalization(
      extrinsicHashMatcher(txHash),
      startingBlock,
      context,
      { delayMs: 0, maxAttempts: 10 },
      onInBlock
    );

    expect(onInBlock).toHaveBeenCalledTimes(1);
    expect(onInBlock).toHaveBeenCalledWith(
      expect.objectContaining({ blockNumber: new BigNumber(2), txIndex: 0 })
    );
    // the returned result is still the finalized one
    expect(result).toEqual(expect.objectContaining({ txIndex: 0, txHash }));
  });

  it('should skip a block whose hash cannot be resolved yet, rather than fetching it', async () => {
    /*
     * the `system.blockHash` storage map only records a block's hash once its child is
     *   initialized, so the current best block can read back as the zero hash. An unresolvable
     *   hash must be skipped and retried on a later pass rather than fetched
     */
    context.getLatestBlock.mockResolvedValue(new BigNumber(1));

    dsMockUtils.createRpcMock('chain', 'getHeader', {
      returnValue: dsMockUtils.createMockHeader({
        parentHash: dsMockUtils.createMockHash(),
        number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(2))),
        stateRoot: dsMockUtils.createMockHash(),
        extrinsicsRoot: dsMockUtils.createMockHash(),
      }),
    });

    // the head block's hash is not yet readable
    dsMockUtils.createRpcMock('chain', 'getBlockHash', {
      returnValue: dsMockUtils.createMockBlockHash(),
    });

    const getBlockMock = dsMockUtils.createRpcMock('chain', 'getBlock');

    dsMockUtils.createQueryMock('system', 'events', { returnValue: [] });

    await expect(
      pollForTransactionFinalization(extrinsicHashMatcher(txHash), startingBlock, context, {
        delayMs: 0,
        maxAttempts: 2,
      })
    ).rejects.toThrow('The block containing the transaction was not found');

    expect(getBlockMock).not.toHaveBeenCalled();
  });

  it('should not report inclusion when the containing block is already finalized', async () => {
    context.getLatestBlock.mockResolvedValue(new BigNumber(2));

    dsMockUtils.createRpcMock('chain', 'getBlockHash', {
      returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
    });

    dsMockUtils.createRpcMock('chain', 'getBlock', {
      returnValue: dsMockUtils.createMockSignedBlock({
        block: dsMockUtils.createMockBlock({
          header: dsMockUtils.createMockHeader(),
          extrinsics: dsMockUtils.createMockExtrinsics([
            { toHex: (): string => '0x', hash: txHash },
          ]),
        }),
      }),
    });

    dsMockUtils.createQueryMock('system', 'events', { returnValue: [] });

    const onInBlock = jest.fn();

    await pollForTransactionFinalization(
      extrinsicHashMatcher(txHash),
      startingBlock,
      context,
      { delayMs: 0, maxAttempts: 10 },
      onInBlock
    );

    expect(onInBlock).not.toHaveBeenCalled();
  });

  describe('subscribeForTransactionFinalization', () => {
    /**
     * Drive a head subscription, invoking its callback with each of the given block numbers
     */
    const mockHeadSubscription = (
      rpcName: 'subscribeNewHeads' | 'subscribeFinalizedHeads',
      blockNumbers: BigNumber[]
    ): jest.Mock => {
      const unsub = jest.fn();
      const mock = dsMockUtils.createRpcMock('chain', rpcName);

      mock.mockImplementation((callback: (header: unknown) => void) => {
        blockNumbers.forEach(blockNumber =>
          setImmediate(() =>
            callback({
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber)),
            })
          )
        );

        return Promise.resolve(unsub);
      });

      return unsub;
    };

    const mockBlockWithTx = (): void => {
      dsMockUtils.createRpcMock('chain', 'getBlockHash', {
        returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
      });

      dsMockUtils.createRpcMock('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: dsMockUtils.createMockBlock({
            header: dsMockUtils.createMockHeader(),
            extrinsics: dsMockUtils.createMockExtrinsics([
              { toHex: (): string => '0x', hash: txHash },
            ]),
          }),
        }),
      });

      dsMockUtils.createQueryMock('system', 'events', { returnValue: [] });
    };

    it('should resolve from a finalized block and report inclusion beforehand', async () => {
      mockBlockWithTx();

      // seen at the best head first, finalized a moment later
      const unsubNew = mockHeadSubscription('subscribeNewHeads', [new BigNumber(2)]);
      const unsubFinalized = mockHeadSubscription('subscribeFinalizedHeads', [new BigNumber(2)]);

      const onInBlock = jest.fn();

      const result = await subscribeForTransactionFinalization(
        extrinsicHashMatcher(txHash),
        startingBlock,
        context,
        onInBlock
      );

      expect(onInBlock).toHaveBeenCalledWith(
        expect.objectContaining({ blockNumber: new BigNumber(2), txIndex: 0 })
      );
      expect(result).toEqual(expect.objectContaining({ txIndex: 0, txHash }));

      // both subscriptions must be torn down once the transaction settles
      expect(unsubNew).toHaveBeenCalled();
      expect(unsubFinalized).toHaveBeenCalled();
    });

    it('should ignore any head that arrives after the transaction has settled', async () => {
      mockBlockWithTx();

      // a second head of each kind arrives once the transaction has already been located
      const unsubNew = mockHeadSubscription('subscribeNewHeads', [
        new BigNumber(2),
        new BigNumber(3),
      ]);
      mockHeadSubscription('subscribeFinalizedHeads', [new BigNumber(2), new BigNumber(3)]);

      const onInBlock = jest.fn();

      const result = await subscribeForTransactionFinalization(
        extrinsicHashMatcher(txHash),
        startingBlock,
        context,
        onInBlock
      );

      // let the trailing callbacks drain, so a second settle would be observed if it happened
      await fakePromise(3);

      expect(result).toEqual(expect.objectContaining({ txIndex: 0, txHash }));
      // inclusion is reported exactly once, no matter how many best heads follow
      expect(onInBlock).toHaveBeenCalledTimes(1);
      expect(unsubNew).toHaveBeenCalledTimes(1);
    });

    it('should not scan the best head when no inclusion callback was passed', async () => {
      mockBlockWithTx();

      mockHeadSubscription('subscribeNewHeads', [new BigNumber(2)]);
      mockHeadSubscription('subscribeFinalizedHeads', [new BigNumber(2)]);

      const result = await subscribeForTransactionFinalization(
        extrinsicHashMatcher(txHash),
        startingBlock,
        context
      );

      expect(result).toEqual(expect.objectContaining({ txIndex: 0, txHash }));
    });

    it('should keep scanning the best head while it does not carry the transaction', async () => {
      dsMockUtils.createRpcMock('chain', 'getBlockHash', {
        returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
      });

      dsMockUtils.createRpcMock('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: dsMockUtils.createMockBlock({
            header: dsMockUtils.createMockHeader(),
            extrinsics: dsMockUtils.createMockExtrinsics([
              { toHex: (): string => '0x', hash: dsMockUtils.createMockHash('someOtherTx') },
            ]),
          }),
        }),
      });

      dsMockUtils.createQueryMock('system', 'events', { returnValue: [] });

      mockHeadSubscription('subscribeNewHeads', [new BigNumber(2)]);
      const unsubNew = mockHeadSubscription('subscribeFinalizedHeads', [new BigNumber(2)]);

      const onInBlock = jest.fn();

      await expect(
        subscribeForTransactionFinalization(
          extrinsicHashMatcher(txHash),
          startingBlock,
          context,
          onInBlock,
          { maxFinalizedBlocks: 1 }
        )
      ).rejects.toThrowError('The block containing the transaction was not found');

      // the best head moved on without the transaction, so nothing was reported as included
      expect(onInBlock).not.toHaveBeenCalled();
      expect(unsubNew).toHaveBeenCalled();
    });

    it('should reject and unsubscribe if a scan fails', async () => {
      const scanError = new Error('the node went away');

      dsMockUtils.createRpcMock('chain', 'getBlockHash').mockRejectedValue(scanError);

      mockHeadSubscription('subscribeNewHeads', []);
      const unsubFinalized = mockHeadSubscription('subscribeFinalizedHeads', [new BigNumber(2)]);

      await expect(
        subscribeForTransactionFinalization(extrinsicHashMatcher(txHash), startingBlock, context)
      ).rejects.toThrowError(scanError);

      expect(unsubFinalized).toHaveBeenCalled();
    });

    it('should throw and unsubscribe if the transaction is never found', async () => {
      dsMockUtils.createRpcMock('chain', 'getBlockHash', {
        returnValue: dsMockUtils.createMockBlockHash('someBlockHash'),
      });

      // blocks are produced, but none of them carry the transaction
      dsMockUtils.createRpcMock('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: dsMockUtils.createMockBlock({
            header: dsMockUtils.createMockHeader(),
            extrinsics: dsMockUtils.createMockExtrinsics([
              { toHex: (): string => '0x', hash: dsMockUtils.createMockHash('someOtherTx') },
            ]),
          }),
        }),
      });

      mockHeadSubscription('subscribeNewHeads', []);
      const unsubFinalized = mockHeadSubscription(
        'subscribeFinalizedHeads',
        // more finalized blocks than the search is willing to wait for
        [1, 2, 3].map(n => new BigNumber(n + 1))
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'The block containing the transaction was not found',
      });

      await expect(
        subscribeForTransactionFinalization(
          extrinsicHashMatcher(txHash),
          startingBlock,
          context,
          undefined,
          { maxFinalizedBlocks: 3 }
        )
      ).rejects.toThrowError(expectedError);

      expect(unsubFinalized).toHaveBeenCalled();
    });
  });

  it('should throw an error if transaction location is not found within polling window', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'The block containing the transaction was not found',
    });

    return expect(
      pollForTransactionFinalization(extrinsicHashMatcher(txHash), startingBlock, context, {
        delayMs: 0,
        maxAttempts: 0,
      })
    ).rejects.toThrow(expectedError);
  });
});
