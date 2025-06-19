import { PolymeshPrimitivesMemo } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { getAuthorization, prepareTransferPolyx } from '~/api/procedures/transferPolyx';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransferPolyxParams } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('transferPolyx procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should throw an error if the user has insufficient balance to transfer', () => {
    dsMockUtils.createQueryMock('identity', 'didRecords', { returnValue: {} });

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    return expect(
      prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount: new BigNumber(101),
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  it('should return a balance transfer transaction spec', async () => {
    const to = entityMockUtils.getAccountInstance({ address: 'someAccount' });
    const amount = new BigNumber(99);
    const memo = 'someMessage';
    const rawAccount = dsMockUtils.createMockAccountId(to.address);
    const rawAmount = dsMockUtils.createMockBalance(amount);
    const rawMemo = 'memo' as unknown as PolymeshPrimitivesMemo;

    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
    jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
    jest.spyOn(utilsConversionModule, 'stringToMemo').mockReturnValue(rawMemo);

    let tx = dsMockUtils.createTxMock('balances', 'transfer');
    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    let result = await prepareTransferPolyx.call(proc, {
      to,
      amount,
    });

    expect(result).toEqual({
      transaction: tx,
      args: [rawAccount, rawAmount],
      resolver: undefined,
    });

    tx = dsMockUtils.createTxMock('balances', 'transferWithMemo');

    result = await prepareTransferPolyx.call(proc, {
      to,
      amount,
      memo,
    });

    expect(result).toEqual({
      transaction: tx,
      args: [rawAccount, rawAmount, rawMemo],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      expect(getAuthorization()).toEqual({
        signerPermissions: true,
      });
    });
  });
});
