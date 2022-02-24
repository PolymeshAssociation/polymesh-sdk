import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Entity, Subsidy, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

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

  test('should extend Entity', () => {
    expect(Subsidy.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign beneficiary and subsidizer to instance', () => {
      const fakeResult = expect.objectContaining({
        beneficiary: expect.objectContaining({ address: beneficiary }),
        subsidizer: expect.objectContaining({ address: subsidizer }),
      });

      expect(subsidy).toEqual(fakeResult);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Subsidy.isUniqueIdentifiers({ beneficiary, subsidizer })).toBe(true);
      expect(Subsidy.isUniqueIdentifiers({})).toBe(false);
      expect(Subsidy.isUniqueIdentifiers({ beneficiary: 1, subsidizer: 2 })).toBe(false);
    });
  });

  describe('method: quit', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the quit procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = { subsidy };

      const expectedQueue = 'mockQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await subsidy.quit();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: exists', () => {
    test('should return whether the Subsidy exists', async () => {
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
    test('should throw an error if the Subsidy relationship does not exist', async () => {
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

    test('should return allowance of the Subsidy relationship', async () => {
      const allowance = new BigNumber(100);
      context.accountSubsidy.returns({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance,
      });
      await expect(subsidy.getAllowance()).resolves.toBe(allowance);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      subsidy.beneficiary.toJson = sinon.stub().returns(beneficiary);
      subsidy.subsidizer.toJson = sinon.stub().returns(subsidizer);
      expect(subsidy.toJson()).toEqual({ beneficiary, subsidizer });
    });
  });
});