import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareUnlockInstructionForExecution,
} from '~/api/procedures/unlockInstructionForExecution';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

describe('unlockInstructionForExecution procedure', () => {
  const id = new BigNumber(1);
  const rawInstructionId = dsMockUtils.createMockU64(id);

  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  let unlockInstructionTxMock: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');

    jest.spyOn(procedureUtilsModule, 'assertInstructionValidForUnlocking').mockImplementation();
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          { identity: entityMockUtils.getIdentityInstance(), status: AffirmationStatus.Affirmed },
        ],
      },
    });

    unlockInstructionTxMock = dsMockUtils.createTxMock('settlement', 'unlockInstruction');

    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawInstructionId);
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

  it('should throw an error if signer is not a mediator', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          {
            identity: entityMockUtils.getIdentityInstance({ did: 'randomDid' }),
            status: AffirmationStatus.Affirmed,
          },
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareUnlockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow('Only mediators can unlock instructions for execution');
  });

  it('should throw an error if mediator affirmation has expired', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          {
            identity: entityMockUtils.getIdentityInstance(),
            status: AffirmationStatus.Affirmed,
            expiry: new Date('2022/01/01'),
          },
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareUnlockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow('Mediator affirmation has expired');
  });

  it('should return a transaction spec on successful unlocking', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const result = await prepareUnlockInstructionForExecution.call(proc, {
      id,
    });

    expect(result).toEqual({
      transaction: unlockInstructionTxMock,
      args: [rawInstructionId],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext, { id });
      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc();

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.UnlockInstruction],
        },
      });
    });
  });
});
