import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Account } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { Staking } from '../Staking';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('Staking namespace', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
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

  it('should extend namespace', () => {
    expect(Staking.prototype).toBeInstanceOf(Namespace);
  });

  const freeBalance = new BigNumber(100);

  let mockContext: Context;
  let account: Account;
  let staking: Staking;

  let rawAddress;

  let stringToAccountIdSpy: jest.SpyInstance;
  let accountIdToStringSpy: jest.SpyInstance;

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    account = entityMockUtils.getAccountInstance({
      getBalance: { free: freeBalance },
    });
    rawAddress = dsMockUtils.createMockAccountId(account.address);
    staking = new Staking(account, mockContext);
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    accountIdToStringSpy = jest.spyOn(utilsConversionModule, 'accountIdToString');

    when(stringToAccountIdSpy).calledWith(account.address, mockContext).mockReturnValue(rawAddress);
  });

  describe('method: bond', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        payee: account,
        controller: account,
        amount,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.bond(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getController', () => {
    const controllerAddress = 'controllerAddress';
    const rawControllerAddress = dsMockUtils.createMockAccountId(controllerAddress);

    it('should return the controller account', async () => {
      dsMockUtils.createQueryMock('staking', 'bonded', {
        returnValue: dsMockUtils.createMockOption(rawControllerAddress),
      });

      when(accountIdToStringSpy)
        .calledWith(rawControllerAddress)
        .mockReturnValue(controllerAddress);

      const controller = await staking.getController();

      expect(controller).toEqual(expect.objectContaining({ address: controllerAddress }));
    });

    it('should return null if there is no controller', async () => {
      dsMockUtils.createQueryMock('staking', 'bonded', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const controller = await staking.getController();

      expect(controller).toBeNull();
    });
  });
});
