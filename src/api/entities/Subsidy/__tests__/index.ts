import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, PolymeshTransaction, Subsidy } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AllowanceOperation } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('Subsidy class', () => {
  let context: Mocked<Context>;
  let beneficiary: string;
  let subsidizer: string;
  let subsidy: Subsidy;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    beneficiary = 'beneficiary';
    subsidizer = 'subsidizer';
    subsidy = new Subsidy({ beneficiary, subsidizer }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(Subsidy.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign beneficiary and subsidizer to instance', () => {
      const fakeResult = expect.objectContaining({
        beneficiary: expect.objectContaining({ address: beneficiary }),
        subsidizer: expect.objectContaining({ address: subsidizer }),
      });

      expect(subsidy).toEqual(fakeResult);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Subsidy.isUniqueIdentifiers({ beneficiary, subsidizer })).toBe(true);
      expect(Subsidy.isUniqueIdentifiers({})).toBe(false);
      expect(Subsidy.isUniqueIdentifiers({ beneficiary: 1, subsidizer: 2 })).toBe(false);
    });
  });

  describe('method: quit', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the quit procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { subsidy };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await subsidy.quit();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setAllowance', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the setAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ...args, subsidy, operation: AllowanceOperation.Set }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await subsidy.setAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: increaseAllowance', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the increaseAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { ...args, subsidy, operation: AllowanceOperation.Increase },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await subsidy.increaseAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: decreaseAllowance', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the decreaseAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { ...args, subsidy, operation: AllowanceOperation.Decrease },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await subsidy.decreaseAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Subsidy exists', async () => {
      context.accountSubsidy = jest.fn().mockReturnValue(null);
      await expect(subsidy.exists()).resolves.toBe(false);

      entityMockUtils.configureMocks({
        accountOptions: {
          isEqual: false,
        },
      });
      context.accountSubsidy = jest.fn().mockReturnValue({
        subsidy: entityMockUtils.getSubsidyInstance({ subsidizer: 'mockSubsidizer' }),
        allowance: new BigNumber(1),
      });
      await expect(subsidy.exists()).resolves.toBe(false);

      entityMockUtils.configureMocks({
        accountOptions: {
          isEqual: true,
        },
      });
      context.accountSubsidy = jest.fn().mockReturnValue({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance: new BigNumber(1),
      });
      await expect(subsidy.exists()).resolves.toBe(true);
    });
  });

  describe('method: getAllowance', () => {
    it('should throw an error if the Subsidy relationship does not exist', async () => {
      context.accountSubsidy = jest.fn().mockReturnValue(null);

      let error;

      try {
        await subsidy.getAllowance();
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('The Subsidy no longer exists');

      context.accountSubsidy = jest.fn().mockReturnValue({
        subsidy: entityMockUtils.getSubsidyInstance({ subsidizer: 'otherAddress' }),
        allowance: new BigNumber(1),
      });
      entityMockUtils.configureMocks({
        accountOptions: {
          isEqual: false,
        },
      });

      try {
        await subsidy.getAllowance();
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('The Subsidy no longer exists');
    });

    it('should return allowance of the Subsidy relationship', async () => {
      const allowance = new BigNumber(100);
      context.accountSubsidy = jest.fn().mockReturnValue({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance,
      });
      await expect(subsidy.getAllowance()).resolves.toBe(allowance);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      subsidy.beneficiary.toHuman = jest.fn().mockReturnValue(beneficiary);
      subsidy.subsidizer.toHuman = jest.fn().mockReturnValue(subsidizer);
      expect(subsidy.toHuman()).toEqual({ beneficiary, subsidizer });
    });
  });
});
