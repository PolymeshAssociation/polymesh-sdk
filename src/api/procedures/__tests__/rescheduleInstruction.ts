import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRescheduleInstruction,
  prepareStorage,
  Storage,
} from '~/api/procedures/rescheduleInstruction';
import { Context, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionDetails, InstructionStatus, RoleType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

describe('rescheduleInstruction procedure', () => {
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id.toNumber());
  let mockContext: Mocked<Context>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    numberToU64Stub.withArgs(id, mockContext).returns(rawId);
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the instruction is not Failed', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      instruction: entityMockUtils.getInstructionInstance(),
      instructionDetails: {
        status: InstructionStatus.Pending,
      } as InstructionDetails,
    });

    return expect(
      prepareRescheduleInstruction.call(proc, {
        id,
      })
    ).rejects.toThrow('Only failed Instructions can be rescheduled');
  });

  test('should add a reschedule Instruction transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      instruction: entityMockUtils.getInstructionInstance(),
      instructionDetails: {
        status: InstructionStatus.Failed,
      } as InstructionDetails,
    });

    const transaction = dsMockUtils.createTxStub('settlement', 'rescheduleInstruction');

    await prepareRescheduleInstruction.call(proc, {
      id,
    });

    const addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawId);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const venueId = new BigNumber(2);
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
        instruction: entityMockUtils.getInstructionInstance(),
        instructionDetails: ({
          venue: entityMockUtils.getVenueInstance({ id: venueId }),
        } as unknown) as InstructionDetails,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          transactions: [TxTags.settlement.RescheduleInstruction],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the instruction and its details', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const details = { venue: entityMockUtils.getVenueInstance({ id: new BigNumber(2) }) };

      entityMockUtils.configureMocks({
        instructionOptions: {
          id,
          details,
        },
      });

      const result = await boundFunc({
        id,
      });

      expect(result).toEqual({
        instruction: entityMockUtils.getInstructionInstance(),
        instructionDetails: details,
      });
    });
  });
});
