import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Account, Context, Namespace } from '~/internal';
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

  describe('method: getLedger', () => {
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

      const result = await staking.getLedger();

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

      const result = await staking.getLedger();

      expect(result).toBeNull();
    });
  });

  describe('method: getPayee', () => {
    it('should return payee info for Staked', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination('Staked'),
      });

      jest
        .spyOn(staking, 'getController')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(entityMockUtils.getAccountInstance() as any);

      const result = await staking.getPayee();

      expect(result).toEqual({
        account: expect.objectContaining({ address: 'someAddress' }),
        autoStaked: true,
      });
    });

    it('should return payee info for Stash', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination('Stash'),
      });

      jest
        .spyOn(staking, 'getController')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(entityMockUtils.getAccountInstance() as any);

      const result = await staking.getPayee();

      expect(result).toEqual({
        account: expect.objectContaining({ address: 'someAddress' }),
        autoStaked: false,
      });
    });

    it('should return payee info for Controller', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination('Controller'),
      });

      jest.spyOn(staking, 'getController').mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entityMockUtils.getAccountInstance({ address: 'controllerAddress' }) as any
      );

      const result = await staking.getPayee();

      expect(result).toEqual({
        account: expect.objectContaining({ address: 'controllerAddress' }),
        autoStaked: false,
      });
    });

    it('should return payee info for Account', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination({
          Account: dsMockUtils.createMockAccountId('someAddress'),
        }),
      });

      jest
        .spyOn(staking, 'getController')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(entityMockUtils.getAccountInstance({ address: 'someAddress' }) as any);

      const result = await staking.getPayee();

      expect(result).toEqual({
        account: expect.objectContaining({ address: 'someAddress' }),
        autoStaked: false,
      });
    });

    it('should return null for None payee', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination('None'),
      });

      jest
        .spyOn(staking, 'getController')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(entityMockUtils.getAccountInstance() as any);

      const result = await staking.getPayee();

      expect(result).toBeNull();
    });

    it('should return null for no controller', async () => {
      dsMockUtils.createQueryMock('staking', 'payee', {
        returnValue: dsMockUtils.createMockRewardDestination('Stash'),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(staking, 'getController').mockResolvedValue(null as any);

      const result = await staking.getPayee();

      expect(result).toBeNull();
    });

    it('should support subscription', async () => {
      const callback = jest.fn();
      const controllerUnsub = jest.fn();
      const payeeUnsub = jest.fn();

      const payeeQueryMock = dsMockUtils.createQueryMock('staking', 'payee');

      payeeQueryMock.mockImplementation((rawAddr: unknown, cb: (arg: unknown) => void) => {
        cb(dsMockUtils.createMockRewardDestination('Stash'));

        return payeeUnsub;
      });

      jest
        .spyOn(staking, 'getController')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation(async (cb: any) => {
          await cb(entityMockUtils.getAccountInstance());

          return controllerUnsub;
        });

      const unsub = await staking.getPayee(callback);

      expect(callback).toHaveBeenCalled();
      expect(unsub).toBeInstanceOf(Function);

      expect(controllerUnsub).not.toHaveBeenCalled();
      expect(payeeUnsub).not.toHaveBeenCalled();

      expect(() => unsub()).not.toThrow();

      expect(controllerUnsub).toHaveBeenCalled();
      expect(payeeUnsub).toHaveBeenCalled();
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

    it('should support subscription', async () => {
      const callback = jest.fn();
      const targetAccountId = dsMockUtils.createMockAccountId('someId');

      const rawNominators = dsMockUtils.createMockOption(
        dsMockUtils.createMockStakingNominations({
          targets: dsMockUtils.createMockVec([targetAccountId]),
          submittedIn: dsMockUtils.createMockU32(new BigNumber(1)),
          suppressed: dsMockUtils.createMockBool(false),
        })
      );

      const nominatorsQueryMock = dsMockUtils.createQueryMock('staking', 'nominators');

      nominatorsQueryMock.mockImplementation(
        async (rawAddr: unknown, cb: (arg: typeof rawNominators) => Promise<void>) => {
          await cb(rawNominators);

          return jest.fn();
        }
      );

      const unsub = await staking.getNomination(callback);

      expect(callback).toHaveBeenCalledWith({
        targets: expect.arrayContaining([expect.any(Account)]),
        submittedInEra: new BigNumber(1),
        suppressed: false,
      });

      expect(() => unsub()).not.toThrow();
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
    const rawControllerAddress = dsMockUtils.createMockOption(
      dsMockUtils.createMockAccountId(controllerAddress)
    );

    it('should return the controller account', async () => {
      dsMockUtils.createQueryMock('staking', 'bonded', {
        returnValue: rawControllerAddress,
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

    it('should support subscription', async () => {
      const callback = jest.fn();

      const bondedQueryMock = dsMockUtils.createQueryMock('staking', 'bonded');

      bondedQueryMock.mockImplementation(
        async (rawAddr: unknown, cb: (arg: typeof rawControllerAddress) => Promise<void>) => {
          await cb(rawControllerAddress);

          return jest.fn();
        }
      );

      const unsub = await staking.getController(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          address: controllerAddress,
        })
      );

      expect(() => unsub()).not.toThrow();
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
        account: expect.objectContaining({ address: account.address }),
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
