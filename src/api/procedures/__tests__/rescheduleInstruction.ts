import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Params, prepareRescheduleInstruction } from '~/api/procedures/rescheduleInstruction';
import { Context, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionStatus } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

describe('rescheduleInstruction procedure', () => {
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id);
  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Failed,
        },
      },
    });
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

  it('should throw an error if the instruction is not Failed', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareRescheduleInstruction.call(proc, {
        id,
      })
    ).rejects.toThrow('Only failed Instructions can be rescheduled');
  });

  it('should return a reschedule Instruction transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const transaction = dsMockUtils.createTxMock('settlement', 'rescheduleInstruction');

    const result = await prepareRescheduleInstruction.call(proc, {
      id,
    });

    expect(result).toEqual({
      transaction,
      args: [rawId],
      resolver: expect.objectContaining({ id }),
    });
  });
});
