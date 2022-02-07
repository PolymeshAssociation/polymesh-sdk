import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

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
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    bigNumberToU64Stub.withArgs(id, mockContext).returns(rawId);
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

  test('should throw an error if the instruction is not Failed', () => {
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

  test('should add a reschedule Instruction transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const transaction = dsMockUtils.createTxStub('settlement', 'rescheduleInstruction');

    await prepareRescheduleInstruction.call(proc, {
      id,
    });

    const addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawId] });
  });
});
