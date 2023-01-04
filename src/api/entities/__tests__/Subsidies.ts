import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Subsidies } from '~/api/entities/Subsidies';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Account, SubsidyWithAllowance, UnsubCallback } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/api/entities/Subsidy',
  require('~/testUtils/mocks/entities').mockSubsidyModule('~/api/entities/Subsidy')
);

describe('Subsidies Class', () => {
  let context: Mocked<Context>;
  let address: string;
  let account: Account;
  let rawAccount: AccountId;
  let subsidies: Subsidies;

  let stringToAccountIdSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    address = 'address';
    account = entityMockUtils.getAccountInstance({ address });
    subsidies = new Subsidies(account, context);

    rawAccount = dsMockUtils.createMockAccountId(address);

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');

    when(stringToAccountIdSpy).calledWith(address, context).mockReturnValue(rawAccount);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: getBeneficiaries', () => {
    it('should return a list of Subsidy relationship along with remaining subsidized amount', async () => {
      const beneficiary = 'beneficiary';
      const rawBeneficiary = dsMockUtils.createMockAccountId(beneficiary);
      rawAccount.eq = jest.fn();
      when(rawAccount.eq).calledWith(rawAccount).mockReturnValue(true);
      const allowance = new BigNumber(100);
      const rawBalance = dsMockUtils.createMockBalance(allowance);
      when(jest.spyOn(utilsConversionModule, 'balanceToBigNumber'))
        .calledWith(rawBalance)
        .mockReturnValue(allowance);

      dsMockUtils.createQueryMock('relayer', 'subsidies', {
        entries: [
          tuple(
            [rawBeneficiary],
            dsMockUtils.createMockOption(
              dsMockUtils.createMockSubsidy({ payingKey: rawAccount, remaining: rawBalance })
            )
          ),
          tuple(
            [dsMockUtils.createMockAccountId('someBeneficiary')],
            dsMockUtils.createMockOption(
              dsMockUtils.createMockSubsidy({
                payingKey: dsMockUtils.createMockAccountId('someAccount'),
                remaining: rawBalance,
              })
            )
          ),
        ],
      });

      const beneficiaries = await subsidies.getBeneficiaries();

      expect(beneficiaries).toHaveLength(1);
      expect(beneficiaries[0].allowance).toEqual(allowance);
      expect(beneficiaries[0].subsidy.beneficiary.address).toEqual(beneficiary);
      expect(beneficiaries[0].subsidy.subsidizer.address).toEqual(address);
    });
  });

  describe('method: getSubsidizer', () => {
    let fakeResult: SubsidyWithAllowance;

    beforeEach(() => {
      fakeResult = {
        subsidy: entityMockUtils.getSubsidyInstance({
          beneficiary: address,
          subsidizer: 'someSubsidizer',
        }),
        allowance: new BigNumber(1000),
      };

      context = dsMockUtils.getContextInstance({
        subsidy: fakeResult,
      });
    });

    it('should return the Subsidy with allowance', async () => {
      const result = await subsidies.getSubsidizer();

      expect(result).toEqual(fakeResult);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      context.accountSubsidy.mockImplementation(
        async (_, cbFunc: (balance: SubsidyWithAllowance) => void) => {
          cbFunc(fakeResult);
          return unsubCallback;
        }
      );

      const result = await subsidies.getSubsidizer(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(fakeResult);
    });
  });
});
