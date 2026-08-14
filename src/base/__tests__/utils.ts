import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  dispatchErrorToMessage,
  extrinsicHashMatcher,
  pollForTransactionFinalization,
  processType,
} from '~/base/utils';
import { PolymeshError } from '~/internal';
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
    dsMockUtils.createQueryMock('system', 'blockHash', {
      multi: [dsMockUtils.createMockBlockHash('someBlockHash')],
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
    dsMockUtils.createQueryMock('system', 'blockHash', {
      multi: [dsMockUtils.createMockBlockHash('someBlockHash')],
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
