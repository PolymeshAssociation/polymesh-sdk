import { Option, u32, u128 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PalletStakingActiveEraInfo } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Staking } from '~/api/client/Staking';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBool, createMockU128 } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { PolymeshTransaction } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Staking Class', () => {
  let mockContext: Mocked<Context>;
  let staking: Staking;

  let account: Account;
  let rawAddress: AccountId;

  let accountIdToStringSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    rawAddress = dsMockUtils.createMockAccountId();

    account = entityMockUtils.getAccountInstance();
    staking = new Staking(mockContext);
    accountIdToStringSpy = jest.spyOn(utilsConversionModule, 'accountIdToString');

    when(accountIdToStringSpy).calledWith(rawAddress).mockReturnValue(account.address);
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
        type: 'unbond',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.unbond(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: bondExtra', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        amount,
        type: 'bondExtra',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.bondExtra(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: withdraw', () => {
    it('should prepare the procedure with the correct context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: undefined, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.withdraw();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: nominate', () => {
    it('should prepare the procedure with the correct context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { validators: [] }, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.nominate({ validators: [] });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setController', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        controller: 'someAccount',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.setController(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setPayee', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        payee: 'someAccount',
        autoStake: false,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.setPayee(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getValidators', () => {
    it('should return a list of validators', async () => {
      dsMockUtils.createQueryMock('staking', 'validators', {
        entries: [
          [
            [dsMockUtils.createMockAccountId('someAddress')],
            dsMockUtils.createMockValidatorPref({
              commission: dsMockUtils.createMockCompact(
                createMockU128(new BigNumber(10).times(10 ** 7))
              ),
              blocked: createMockBool(false),
            }),
          ],
        ],
      });

      const result = await staking.getValidators();
      expect(result).toEqual({
        data: [
          expect.objectContaining({
            account: expect.any(Account),
            blocked: false,
            commission: new BigNumber(10),
          }),
        ],
        next: null,
      });
    });
  });

  describe('method: getEraInfo', () => {
    const activeIndex = new BigNumber(7);
    const activeStart = new BigNumber(8);

    let rawActiveStart;
    let rawActiveIndex;
    let rawActiveEra: Option<PalletStakingActiveEraInfo>;
    let rawCurrentEra: Option<u32>;
    let rawPlannedSession: u32;
    let rawTotal: u128;

    let activeEraQueryMock: jest.SpyInstance;
    let currentEraQueryMock: jest.SpyInstance;
    let plannedSessionQueryMock: jest.SpyInstance;

    beforeEach(() => {
      rawActiveIndex = dsMockUtils.createMockU32(activeIndex);
      rawActiveStart = dsMockUtils.createMockOption(dsMockUtils.createMockU64(activeStart));
      rawActiveEra = dsMockUtils.createMockOption(
        dsMockUtils.createMockActiveEraInfo({
          index: rawActiveIndex,
          start: rawActiveStart,
        })
      );
      rawCurrentEra = dsMockUtils.createMockOption(dsMockUtils.createMockU32(new BigNumber(2)));
      rawPlannedSession = dsMockUtils.createMockU32(new BigNumber(3));
      rawTotal = dsMockUtils.createMockU128(new BigNumber(1000));

      activeEraQueryMock = dsMockUtils.createQueryMock('staking', 'activeEra', {
        returnValue: rawActiveEra,
      });

      currentEraQueryMock = dsMockUtils.createQueryMock('staking', 'currentEra', {
        returnValue: rawCurrentEra,
      });

      plannedSessionQueryMock = dsMockUtils.createQueryMock('staking', 'currentPlannedSession', {
        returnValue: rawPlannedSession,
      });

      dsMockUtils.createQueryMock('staking', 'erasTotalStake', {
        returnValue: rawTotal,
      });
    });

    it('should return era info', async () => {
      const result = await staking.eraInfo();

      expect(result).toEqual({
        activeEra: new BigNumber(7),
        activeEraStart: new BigNumber(8),
        currentEra: new BigNumber(2),
        plannedSession: new BigNumber(3),
        totalStaked: new BigNumber(1000),
      });
    });

    it('should handle queries returning None', async () => {
      dsMockUtils.createQueryMock('staking', 'activeEra', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('staking', 'currentEra', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await staking.eraInfo();

      expect(result).toEqual({
        activeEra: new BigNumber(0),
        activeEraStart: new BigNumber(0),
        currentEra: new BigNumber(0),
        plannedSession: new BigNumber(3),
        totalStaked: new BigNumber(1000),
      });
    });

    it('should handle subscription', async () => {
      const activeUnsub = jest.fn();
      const eraUnsub = jest.fn();
      const sessionUnsub = jest.fn();

      type CallbackSig = (arg: unknown) => void;

      activeEraQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawActiveEra);

        return activeUnsub;
      });

      currentEraQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawCurrentEra);

        return eraUnsub;
      });

      plannedSessionQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawPlannedSession);

        return sessionUnsub;
      });

      const callback = jest.fn();

      const result = await staking.eraInfo(callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Function);

      // ensure all unsub functions have not been called
      expect(activeUnsub).not.toHaveBeenCalled();
      expect(eraUnsub).not.toHaveBeenCalled();
      expect(sessionUnsub).not.toHaveBeenCalled();

      expect(() => result()).not.toThrow();

      // ensure all unsub functions have been called now that unsub ran
      expect(activeUnsub).toHaveBeenCalled();
      expect(eraUnsub).toHaveBeenCalled();
      expect(sessionUnsub).toHaveBeenCalled();
    });
  });
});
