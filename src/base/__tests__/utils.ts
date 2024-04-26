import { TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { PolymeshError } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import {
  createMockEventRecord,
  createMockSystemPhase,
  MockContext,
} from '~/testUtils/mocks/dataSources';
import { ErrorCode, TransactionArgumentType } from '~/types';

import { pollForTransactionFinalization, processType } from '../utils';

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

    const result = await pollForTransactionFinalization(txHash, startingBlock, context);

    expect(result).toEqual(
      expect.objectContaining({
        txIndex: 0,
        txHash,
        events: [],
      })
    );
  });

  it('should throw an error if transaction location is not found within polling window', async () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'The block containing the transaction was not found',
    });

    return expect(
      pollForTransactionFinalization(txHash, startingBlock, context, { delayMs: 0, maxAttempts: 0 })
    ).rejects.toThrow(expectedError);
  });
});
