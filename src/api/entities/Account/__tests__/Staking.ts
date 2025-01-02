import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Account, Context, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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
        rewardDestination: account,
        autoStake: false,
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

  describe('method: unbond', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        amount,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.unbond(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getLedgerEntry', () => {
    it('should return the ledger info for the account', async () => {
      dsMockUtils.createQueryMock('staking', 'ledger', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockStakingLedger({
            stash: dsMockUtils.createMockAccountId('someId'),
            total: dsMockUtils.createMockCompact(
              dsMockUtils.createMockU128(new BigNumber(10).times(10 ** 6))
            ),
            active: dsMockUtils.createMockCompact(
              dsMockUtils.createMockU128(new BigNumber(5).times(10 ** 6))
            ),
            unlocking: dsMockUtils.createMockVec(),
            claimedRewards: dsMockUtils.createMockVec(),
          })
        ),
      });

      const result = await staking.getLedgerEntry();

      expect(result).toEqual({
        stash: expect.any(Account),
        total: new BigNumber(10),
        active: new BigNumber(5),
        unlocking: [],
        claimedRewards: [],
      });
    });

    it('should return null', async () => {
      dsMockUtils.createQueryMock('staking', 'ledger', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await staking.getLedgerEntry();

      expect(result).toBeNull();
    });
  });

  describe('method: getNomination', () => {
    it('should return the nomination info', async () => {
      const targetAccountId = dsMockUtils.createMockAccountId('someId');

      dsMockUtils.createQueryMock('staking', 'nominators', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockStakingNominations({
            targets: dsMockUtils.createMockVec([targetAccountId]),
            submittedIn: dsMockUtils.createMockU32(new BigNumber(1)),
            suppressed: dsMockUtils.createMockBool(false),
          })
        ),
      });

      const result = await staking.getNomination();

      expect(result).toEqual({
        targets: expect.arrayContaining([expect.any(Account)]),
        submittedInEra: new BigNumber(1),
        suppressed: false,
      });
    });

    it('should return null', async () => {
      dsMockUtils.createQueryMock('staking', 'nominators', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await staking.getNomination();

      expect(result).toBeNull();
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

  describe('method: getCommission', () => {
    it('should return commission info if the account wants to be a validator', async () => {
      dsMockUtils.createQueryMock('staking', 'validators', {
        returnValue: dsMockUtils.createMockValidatorPref({
          blocked: dsMockUtils.createMockBool(false),
          commission: dsMockUtils.createMockCompact(
            dsMockUtils.createMockPerbill(new BigNumber(100000000))
          ),
        }),
      });

      const result = await staking.getCommission();

      expect(result).toEqual({
        blocked: false,
        commission: new BigNumber(10),
      });
    });

    it('should return null if any empty preference is found', async () => {
      dsMockUtils.createQueryMock('staking', 'validators', {
        returnValue: dsMockUtils.createMockValidatorPref(),
      });

      const result = await staking.getCommission();

      expect(result).toBeNull();
    });
  });
});
