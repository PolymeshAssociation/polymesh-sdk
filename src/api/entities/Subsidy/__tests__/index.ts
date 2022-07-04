import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Entity, PolymeshTransaction, Subsidy } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AllowanceOperation } from '~/types/internal';

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
      sinon.restore();
    });

    it('should prepare the quit procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { subsidy };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await subsidy.quit();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setAllowance', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the setAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { ...args, subsidy, operation: AllowanceOperation.Set }, transformer: undefined },
          context
        )
        .resolves(expectedTransaction);

      const tx = await subsidy.setAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: increaseAllowance', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the increaseAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ...args, subsidy, operation: AllowanceOperation.Increase },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await subsidy.increaseAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: decreaseAllowance', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the decreaseAllowance procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { allowance: new BigNumber(50) };

      const expectedTransaction = 'mockTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ...args, subsidy, operation: AllowanceOperation.Decrease },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await subsidy.decreaseAllowance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Subsidy exists', async () => {
      context.accountSubsidy.onFirstCall().returns(null);
      await expect(subsidy.exists()).resolves.toBe(false);

      entityMockUtils.configureMocks({
        accountOptions: {
          isEqual: false,
        },
      });
      context.accountSubsidy.onSecondCall().returns({
        subsidy: entityMockUtils.getSubsidyInstance({ subsidizer: 'mockSubsidizer' }),
        allowance: new BigNumber(1),
      });
      await expect(subsidy.exists()).resolves.toBe(false);

      entityMockUtils.configureMocks({
        accountOptions: {
          isEqual: true,
        },
      });
      context.accountSubsidy.onThirdCall().returns({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance: new BigNumber(1),
      });
      await expect(subsidy.exists()).resolves.toBe(true);
    });
  });

  describe('method: getAllowance', () => {
    it('should throw an error if the Subsidy relationship does not exist', async () => {
      context.accountSubsidy.onFirstCall().returns(null);

      let error;

      try {
        await subsidy.getAllowance();
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('The Subsidy no longer exists');

      context.accountSubsidy.onSecondCall().returns({
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
      context.accountSubsidy.returns({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance,
      });
      await expect(subsidy.getAllowance()).resolves.toBe(allowance);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      subsidy.beneficiary.toHuman = sinon.stub().returns(beneficiary);
      subsidy.subsidizer.toHuman = sinon.stub().returns(subsidizer);
      expect(subsidy.toHuman()).toEqual({ beneficiary, subsidizer });
    });
  });
});
